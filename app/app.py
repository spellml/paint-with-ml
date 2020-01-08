import torch
import numpy as np
from PIL import Image
import os
import io
import base64
from ast import literal_eval

from flask import Flask, make_response, send_file
from flask import request
app = Flask('neural-painter', static_folder='static')

from model_loader import ModelLoader
model = ModelLoader(79)
print('App ready!')


@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')


@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return send_file('favicon.ico')


@app.route('/predict', methods=['POST'])
def predict():
    result = model.get_prediction(
        request.data.decode('utf-8')
    )
    response = make_response(result)
    return response
