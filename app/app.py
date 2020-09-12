import os
import requests

from flask import Flask, send_file
from flask import request
app = Flask('neural-painter', static_folder='static')

@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')

# @app.route('/static/img/favicon.png', methods=['GET'])
# def favicon():
#     return send_file('favicon.png')

# @app.route('/static/img/default.png', methods=['GET'])
# def default():
#     return send_file('static/img/default.png')

print('App ready!')
