from pymongo import MongoClient
import json

mongo_uri = "mongodb://admin:admin@mongo-db:27017/"
client = MongoClient(mongo_uri)

db = client.learngpt_data

def load_json_data(file_path):
    with open(file_path) as f:
        return json.load(f)

templates_data = load_json_data('./Jsons/templates.json')
user_data = load_json_data('./Jsons/user_data.json')

def insert_data(collection, data):
  for item in data:
    collection.insert_one(item)

def init_db():
  templates_collection = db.templates
  user_data_collection = db.user_data

  if templates_collection.count_documents({}) == 0:
    try:
      insert_data(templates_collection, templates_data)
    except:
      print("Error inserting templates.")
  else:
    print("Templates collection already exists.")

  if user_data_collection.count_documents({}) == 0:
    try:
      insert_data(user_data_collection, user_data)
    except:
      print("Error inserting user_data.")
  else:
    print("User_data collection already exists.")
