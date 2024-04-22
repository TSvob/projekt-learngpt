from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from openai import OpenAI
import json
from bson import json_util
from init_db import init_db
from flask_cors import CORS
import traceback
import os
import uuid
import datetime
import logging
import sys


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.DEBUG)

#JWT Setup
app.config["JWT_SECRET_KEY"] = "secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(minutes=30)
jwt = JWTManager(app)

#Database connection
mongo_uri = "mongodb://admin:admin@mongo-db:27017/"
client = MongoClient(mongo_uri)
db = client.learngpt_data
templates_collection = db.templates
users_collection = db.user_data

#OpenAI connection
openai_client = OpenAI() # Setting the key from .env file

#Alternative OpenAI connection without env file
# openai_client = OpenAI(
#     api_key="********") #Change the key to a new one - if found publicly -> deactivates!

if not os.getenv("OPENAI_API_KEY"):
      print("No API key found in .env file, please add one and try again")

#Initialize database
init_db()

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(datetime.timezone.utc)
        target_timestamp = datetime.timestamp(now + datetime.timedelta(hours=1))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route('/api/login', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user = users_collection.find_one({"email": email})
    if user is None or not check_password_hash(user['password'], password):
        return {"msg": "Bad email or password"}, 401

    token = create_access_token(identity=email, expires_delta=datetime.timedelta(days=1))

    user_data = {
        "id": str(user['_id']),
    }

    response = {
        "token":token,
        "user_data": user_data
        }
    
    return jsonify(response), 200

@app.route('/api/register', methods=["POST"])
def register():
    first_name = request.json.get("firstName", None)
    last_name = request.json.get("lastName", None)
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    hashed_password = generate_password_hash(password)
    user_id = str(uuid.uuid4())
    created_at = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    if users_collection.find_one({'email': email}) is not None:
        return {"msg": "A user with the same email already exists"}, 400
    
    new_user = {
        "_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": hashed_password,
        "created_at": created_at
    }
    users_collection.insert_one(new_user)

    new_template = {
        "_id": str(uuid.uuid4()),
        "author_id": user_id,
        "created_at": created_at,
        "template_list": []
    }


    templates_collection.insert_one(new_template)

    return {"msg": "User created successfully"}, 201

@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@app.route('/api/get-template-names', methods=['GET'])
def get_template_names():
    author_id = request.args.get('author_id')
    if not author_id:
        return jsonify({"status": "error", "message": "Author ID is required"}), 400
    try:
        users_templates = templates_collection.find_one({"author_id": author_id})
        if users_templates != [] and users_templates is not None:
            template_names_list = [{'id': template['_id'], 'template_name': template['template_name']} for template in users_templates['template_list']]
            return jsonify(template_names_list)
        else:
            return jsonify([])

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/get-summaries/<author_id>/<template_id>', methods=['GET'])
def get_summaries(author_id, template_id):
    try:
        users_templates = templates_collection.find_one({"author_id": author_id})
        if users_templates:
            template_list = users_templates.get('template_list', [])
            for template in template_list:
                if template['_id'] == template_id:
                    summaries = template.get('summaries', [])
                    return jsonify(json_util.loads(json_util.dumps(summaries)))
        return jsonify([]), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/new-template', methods=['POST'])
def new_template():
    try:
        data = request.get_json()
        author_id = data['author_id']
        template_name = data['template_name']
        template_topic = data['template_topic']
        fields = data['fields']
        users_templates = templates_collection.find_one({"author_id": author_id})
        
        if users_templates:
            # Check if template with the same name already exists
            for template in users_templates['template_list']:
                if template['template_name'] == template_name:
                    return jsonify({"status": "error", "message": f"Template with the name '{template_name}' already exists"}), 400
            
            # Add new template to existing author's document
            new_template_id = str(uuid.uuid4())
            new_template = {
                "_id": new_template_id,
                "template_name": template_name,
                "template_topic": template_topic,
                "fields": fields,  # Assuming fields is already a list
                "summaries": [],
            }
            templates_collection.update_one({"author_id": author_id}, {"$push": {"template_list": new_template}})
        else:
            return jsonify({"status": "error", "message": "Author ID not found"}), 404
        
        return jsonify({"status": "success", "message": "New template added"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

#TODO: Needs decomposition
@app.route('/api/new-summary', methods=['POST'])
def new_summary():
    try:
        data = request.get_json()
        prompt = data['text']
        active_template_id = data['template_id']
        author_id = data['author_id']    
        query = {
            "author_id": author_id,
            "template_list": {
                "$elemMatch": {
                    "_id": active_template_id
                }
            }
        }

        def get_template_data(template_id, template_key):
            result = templates_collection.find_one(query)
            if result:
                for template in result["template_list"]:
                    if template["_id"] == template_id:
                        return template[template_key]
                    
        template_fields = get_template_data(active_template_id, "fields")
        template_topic = get_template_data(active_template_id, "template_topic")

        # print("API Key:", openai_client.api_key) TESTING API KEY and CONNECTION
        try:
            #Fetching OpenAI response
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                response_format={ "type": "json_object" },
                messages=[
                    {"role": "system", "content": f"You are a helpful assistant designed to output JSON. The topic, I am interested in this topic: {template_topic}. You are given an input and you are supposed to return these fields: {template_fields}. Every returned value should be a string. Make it as short as possible."},
                    {"role": "user", "content": f"The input is {prompt}"}
                ]
            )
        except Exception as e:
            print("API Call Error:", str(e))
            raise

        content = response.choices[0].message.content
        content_dict = json.loads(content)

        #TODO: Check the response against the requested fields

        created_at = datetime.datetime.now()
        new_uuid = str(uuid.uuid4())
        formatted_summary = {
            "_id": new_uuid,
            "created_at": created_at, #Isoformat
            "data": content_dict
        }

        #Inserting to the database
        templates_collection.update_one(query, {"$push": {"template_list.$.summaries": formatted_summary}})

        #Returning response to frontend
        return jsonify({'summary': content})
    except Exception as e:
        print("Exception occurred:", str(e))  # Print the exception message
        print("Traceback:", traceback.format_exc())  # Print the exception traceback
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/delete-summary/', methods=['DELETE'])
def delete_summary():
    data = request.get_json()
    author_id = data.get('author_id')
    template_id = data.get('template_id')
    summary_id = data.get('summary_id')
    print(f"Attempting to delete summary with ID {summary_id} from template {template_id} created by author {author_id}")
    try:
        result = templates_collection.update_one(
        {'author_id': author_id, 'template_list._id': template_id},
        {'$pull': {'template_list.$.summaries': {'_id': summary_id}}}
    )
        
        if result.modified_count:
            return jsonify({'success': 'Summary deleted'}), 200
        else:
            return jsonify({'error': 'No summary found with provided IDs'}), 404

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
        
if __name__ =='__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)