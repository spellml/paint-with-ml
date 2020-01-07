import torch
import numpy as np
from PIL import Image
import os
import io
import base64
from ast import literal_eval

from flask import Flask, make_response, send_file
from flask import request
app = Flask(__name__, static_folder='static')

from model_loader import ModelLoader
model = ModelLoader(79)
color_key = {
    (241, 159, 240, 255): 3,
    (154, 153,  64, 255): 5,
    (255, 253,  57, 255): 10,
    (50, 0, 50, 255): 14,
    (249,  40,  55, 255): 17,
    (50, 0, 0, 255): 18,
    (45, 255, 254, 255): 22,
    (62, 110, 122, 255): 27,
    (0, 50, 50, 255): 61
}
# color_key = {
#     (241, 159, 240, 255): 0,
#     (154, 153,  64, 255): 1,
#     (255, 253,  57, 255): 2,
#     (50, 0, 50, 255): 3,
#     (249,  40,  55, 255): 4,
#     (50, 0, 0, 255): 5,
#     (45, 255, 254, 255): 6,
#     (62, 110, 122, 255): 7,
#     (0, 50, 50, 255): 8
# }


print('App ready!')


@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')


@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return send_file('favicon.ico')


@app.route('/predict', methods=['POST'])
def predict():
    # base64 encoded PNG -> PIL image -> array
    d = request.data.decode('utf-8')
    d = d[d.find(',') + 1:]
    segmap_c = np.array(
        Image.open(io.BytesIO(base64.b64decode(d)))
    )
    segmap = np.zeros((512, 512))
    for x in range(512):
        for y in range(512):
            c = tuple(segmap_c[x][y])
            segmap[x][y] = color_key[c]
    del segmap_c

    # Used for testing via curl with a payload of image bytes
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

    # Package into a base64 PNG and return
    out = io.BytesIO()
    result.save(out, format='PNG')
    out = 'data:image/png;base64,'.encode('utf-8') + base64.b64encode(out.getvalue())
    response = make_response(out)
    return response
