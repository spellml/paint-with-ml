"""
Module providing the ModelLoader wrapper class, which handles model instantiation.
"""
import torch
import numpy as np

from pathlib import Path
import os
import yaml

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
        self.load_model_resources(run_id, epoch_id)

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
        Helper function. Loads the model checkpoints file.
        """
        checkpoint_file = Path(f'checkpoints/{run_id}/{epoch_id}_net_G.pth')
        if checkpoint_file.exists():
            print(f'Reusing existing checkpoints file {checkpoint_file.as_posix()}.')
            return

        try:
            client = spell.client.from_environment()
        except ClientException:
            raise OSError(
                'Could not instantiate SpellClient from the environment, did you forget '
                'to specify SPELL_TOKEN and/or SPELL_OWNER environment variables?'
            )

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

    def get_prediction(self, segmap):
        result = self.model({
            'label': torch.tensor(segmap[None, None]).float(),
            'instance': torch.tensor([0]),
            'image': torch.tensor(np.zeros((1, 3, 512, 512))).float(),
            'path': ['~/']
        }, mode='inference')
        return result


__all__ = ['ModelLoader']