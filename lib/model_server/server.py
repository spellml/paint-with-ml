import torch
import numpy as np
from PIL import Image

import os
import yaml
import io
import base64
import json

from spell.serving import BasePredictor

if "MODEL_CONFIG_PATH" in os.environ:
    model_config_path = os.environ["MODEL_CONFIG_PATH"]
else:
    model_config_path = "/model/latest_net_G.yaml"

if "SPADE_CODE_DIR" in os.environ:
    spade_dir = os.environ["SPADE_CODE_DIR"]
else:
    spade_dir = "../SPADE-master/"
import sys; sys.path.append(spade_dir)

from models.pix2pix_model import Pix2PixModel
from options.test_options import TestOptions


class Predictor(BasePredictor):
    def __init__(self):
        opt = TestOptions()
        with open(model_config_path, 'r') as fp:
            saved_opts = yaml.safe_load(fp)
        for _opt in saved_opts:
            setattr(opt, _opt, saved_opts[_opt])

        model = Pix2PixModel(opt)
        model.eval()
        self.model = model

        # No longer need SPADE-master on PYTHONPATH.
        sys.path.pop()
 
    def png_data_uri_to_batch_tensor(self, data_uri):
        # NOTE(aleksey): keys must match those set in app.js. Values are labels from ADE20K.
        color_key = {
            (245, 216, 122, 255): 3,  # sky
            (13, 113, 125, 255): 5,  # tree
            (224, 27, 66, 255): 18,  # plant
            (255, 190, 203, 255): 10,  # grass
            (114, 102, 118, 255): 14,  # rock
            (245, 147, 34, 255): 17,  # mountain
            (109, 0, 161, 255): 61,  # river
            (62, 110, 122, 255): 22,  # lake
            (0, 50, 50, 255): 27  # ocean
        }
        # base64 encoded PNG -> PIL image -> array
        data_uri = data_uri[data_uri.find(',') + 1:]
        segmap_c = np.array(
            Image.open(io.BytesIO(base64.b64decode(data_uri)))
        )
        segmap = np.zeros((512, 512))
        for x in range(512):
            for y in range(512):
                c = tuple(segmap_c[x][y])
                segmap[x][y] = color_key[c]
        del segmap_c
        tensor = torch.tensor(segmap[None, None]).float()
        return tensor

    def batch_tensor_to_png_data_uri(self, tensor):
        # [-1, 1] batch tensor -> [0, 255] image array -> PIL image
        result = Image.fromarray(
            ((tensor.squeeze().numpy() + 1) / 2 * 255).transpose(1, 2, 0).astype('uint8')
        )

        # Package into a base64 PNG and return
        out = io.BytesIO()
        result.save(out, format='PNG')
        out = 'data:image/png;base64,'.encode('utf-8') + base64.b64encode(out.getvalue())
        return out

    def get_prediction(self, data_uri):
        label = self.png_data_uri_to_batch_tensor(data_uri)

        result = self.model({
            'label': label,
            'instance': torch.tensor([0]),
            'image': torch.tensor(np.zeros((1, 3, 512, 512))).float(),
            'path': ['~/']
        }, mode='inference')

        out = self.batch_tensor_to_png_data_uri(result)
        return out

    def predict(self, payload):
        # NOTE: this endpoint should return a body of {'image': <PNG URI string>}.
        image = self.get_prediction(payload['segmap'])
        image = image.decode('utf-8')
        return json.dumps({"image": image})
