"""
Module providing the ModelLoader wrapper class, which handles model instantiation.
"""
import torch
import numpy as np
from PIL import Image

from pathlib import Path
import os
import yaml
import io
import base64

import spell
import spell.client
from spell.api.exceptions import ClientException

class ModelLoader:
    """
    Performs a network request to download and initialize a model locally.
    """

    def __init__(self, run_id, epoch_id='latest'):
        # First we must load the model code artifact.
        #
        # The SPADE model code is not pip-installable because it lacks a setup.py file, so
        # we have to load the code from a well-known location instead.
        #
        # The model library files are located at the root of the current working directory
        # in the production web app, but can be located anywhere on disk when you're running
        # the app on your local machine. We leave specifying the exact path up to the
        # MODEL_CODE_PATH env var.
        #
        # We load the model code artifact first, *before* we load the model data artifact, so that
        # in the event of an error in this part of the process, we fail quickly---and don't waste
        # much time downloading data.
        import sys

        try:
            path = os.environ['MODEL_CODE_PATH']
            sys.path.append(path)
        except KeyError:
            raise OSError(
                f"MODEL_CODE_PATH is unset. Set this to the directory containing SPADE."
            )
        try:
            path = os.environ['MODEL_CONFIG_PATH']
        except KeyError:
            raise OSError(
                f"MODEL_CONFIG_PATH is unset. Set this to the directory with model YAML files."
            )

        from models.pix2pix_model import Pix2PixModel
        from options.test_options import TestOptions

        # Use the Spell Python client to download model checkpoints from SpellFS.
        #
        # If you are not the original author or a member of the Spell dev team, and you don't 
        # already have a copy of the model checkpoints on your local disk, running the following
        # code will not do what you expect it to do. Use `load_model_resources_public` instead.
        self.load_model_resources(run_id, epoch_id)

        # TODO: implement this. Requires the model checkpoints to be available as a public
        # resource first.
        # self.load_model_resources_public(run_id, epoch_id)

        # Instantiate the model object using the GuaGAN config system.
        opt = TestOptions()
        with open(f'{os.environ["MODEL_CONFIG_PATH"].rstrip("/")}/{run_id}.yaml', 'r') as fp:
            saved_opts = yaml.safe_load(fp)
            for _opt in saved_opts:
                setattr(opt, _opt, saved_opts[_opt])

        # If the environment has GPUs available and visible, use them.
        if 'CUDA_VISIBLE_DEVICES' in os.environ:
            gpus = os.environ['CUDA_VISIBLE_DEVICES']
            if ',' in gpus:
                gpus = gpus.split(',')
            else:
                gpus = int(gpus)
        else:
            gpus = []
        os.gpu_ids = gpus

        model = Pix2PixModel(opt)
        model.eval()
        self.model = model

        # No longer need SPADE-master on PYTHONPATH.
        sys.path.pop()


    def load_model_resources(self, run_id, epoch_id='latest'):
        """
        Helper function. Loads the model checkpoints file from source on Spell.
        """
        checkpoint_file = Path(f'checkpoints/{run_id}/{epoch_id}_net_G.pth')
        if checkpoint_file.exists():
            print(f'Reusing existing checkpoints file {checkpoint_file.as_posix()}.')
            return

        try:
            client = spell.client.from_environment()
        except ClientException as e:
            print('Could not instantiate SpellClient from the environment.')
            raise e

        # The checkpoints path is run-dependent, but there is no arbitrary metadata assigned to
        # a run. For now we work around this issue manually. But this is awkward!
        run = client.runs.get(run_id)
        if run_id == 62:
            src = f'checkpoints/bob_ross/{epoch_id}_net_G.pth'
        if run_id == 79:
            src = f'checkpoints/ade20k_pretrained/{epoch_id}_net_G.pth'
        elif run_id == 102:
            src = f'checkpoints/bob_ross_x_ade20k_outdoors/{epoch_id}_net_G.pth'
        run.cp(src, f'checkpoints/{run_id}/')


    def load_model_resources_public(self, run_id, epoch_id='latest'):
        raise NotImplementedError


    def png_data_uri_to_batch_tensor(self, data_uri):
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


__all__ = ['ModelLoader']