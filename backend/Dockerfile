FROM python:3.9-alpine

WORKDIR /backend

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5001

CMD ["python", "app.py", "--host=0.0.0.0", "--port=5001"]