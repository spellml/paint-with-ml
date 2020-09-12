import os
import requests

from flask import Flask, send_file
from flask import request
app = Flask('neural-painter', static_folder='static')

@app.route('/', methods=['GET'])
def index():
    return send_file('index.html')

print('App ready!')
