import torch
import numpy as np
from PIL import Image
import os
import io
import base64

from flask import Flask, make_response, send_file
from flask import request
app = Flask(__name__, static_folder='static')

from model_loader import ModelLoader
model = ModelLoader(79)
print('App ready!')


@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    # base64 encoded PNG -> PIL image -> array
    d = request.data
    d = d[d.index(',') + 1:]
    segmap = np.array(
        Image.open(io.BytesIO(base64.b64decode(d)))
    )

    # Used for testing via cURL from a payload of image bytes.
    # TODO: use a base64 test string instead.
    # bytes -> PIL image -> array
    # segmap = np.array(
    #     Image.open(
    #         io.BytesIO(request.data)
    #     )
    # )

    # Get model prediction
    result = model.get_prediction(segmap)

    # [-1, 1] batch tensor -> [0, 255] image array -> PIL image -> bytes
    result = Image.fromarray(
        ((result.squeeze().numpy() + 1) / 2 * 255).transpose(1, 2, 0).astype('uint8')
    )

    # Package in a returnable object and return
    out = io.BytesIO()
    result.save(out, format='PNG')
    out.seek(0)
    return send_file(out, mimetype='image/png')

# TODO: status path