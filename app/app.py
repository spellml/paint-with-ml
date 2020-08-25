import os
import requests

from flask import Flask, make_response, send_file
from flask import request
app = Flask('neural-painter', static_folder='static')

if 'MODEL_SERVER_URL' not in os.environ:
    raise ValueError("'MODEL_SERVER_URL' environment variable not set.")

@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')


@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return send_file('favicon.ico')


@app.route('/predict', methods=['POST'])
def predict():
    """Proxies a request to the Spell model server."""
    resp = requests.post(os.environ['MODEL_SERVER_URL'], data=request.data.decode('utf-8'))
    return resp.json()["image"]

print('App ready!')
