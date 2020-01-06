"""
Module providing the ModelLoader wrapper class, which handles model instantiation.
"""
import torch
import numpy as np

from pathlib import Path
import os

import spell
import spell.client
from spell.api.exceptions import ClientException

class ModelLoader:
    """
    Performs a network request to download and initialize a model locally.
    """

    def __init__(self, run_id, epoch_id='latest', opts={}):
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

        from models.pix2pix_model import Pix2PixModel
        from options.test_options import TestOptions

        # Use the Spell Python client to download model checkpoints from SpellFS.
        self.load_model_resources(run_id, epoch_id)

        # Instantiate the model object using the GuaGAN config system.
        # TODO: how many of these opts can safely be left unset?
        opt = TestOptions()
        opt.aspect_ratio=1.0
        opt.batchSize=1
        opt.cache_filelist_read=False
        opt.cache_filelist_write=False
        opt.checkpoints_dir='checkpoints/'
        opt.contain_dontcare_label=True
        opt.crop_size=256
        opt.dataroot=''
        opt.dataset_mode='custom'
        opt.display_winsize=512
        opt.gpu_ids=[]
        opt.how_many=float('inf')
        opt.init_type='xavier'
        opt.init_variance=0.02
        opt.isTrain=False
        opt.load_from_opt_file=False
        opt.load_size=256
        opt.max_dataset_size=9223372036854775807
        opt.model='pix2pix'
        opt.nThreads=0
        opt.nef=16
        opt.netG='spade'
        opt.ngf=64
        opt.no_flip=True
        opt.no_instance=True
        opt.no_pairing_check=False
        opt.norm_D='spectralinstance'
        opt.norm_E='spectralinstance'
        opt.norm_G='spectralspadesyncbatch3x3'
        opt.num_upsampling_layers='normal'
        opt.output_nc=3
        opt.phase='test'
        opt.preprocess_mode='resize_and_crop'
        opt.results_dir=''
        opt.label_nc=150
        opt.semantic_nc=151
        opt.serial_batches=True
        opt.use_vae=False
        opt.z_dim=256
        opt.name='GuaGAN_ADE20K_Landscapes'
        opt.which_epoch=epoch_id

        for o in opts:
            opt.setattr(o, opts[o])

        model = Pix2PixModel(opt)
        model.eval()

        # No longer need SPADE-master on PYTHONPATH.
        # TODO: is this true?
        sys.path.pop()

        # Save the model as an object property.
        self.model = model

    def load_model_resources(self, run_id, epoch_id='latest'):
        """
        Helper function. Loads the model checkpoints file.
        """
        checkpoint_file = Path(f'checkpoints/GuaGAN_ADE20K_Landscapes/{epoch_id}_net_G.pth')
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
        
        run = client.runs.get(run_id)
        run.cp(
            f'checkpoints/ade20k_pretrained/{epoch_id}_net_G.pth', 
            f'checkpoints/GuaGAN_ADE20K_Landscapes/'
        )

    def get_prediction(self, segmap):
        result = self.model({
            'label': torch.tensor(segmap[None, None]).float(),
            'instance': torch.tensor([0]),
            'image': torch.tensor(np.zeros((1, 3, 512, 512))).float(),
            'path': ['~/']
        }, mode='inference')
        return result


__all__ = ['ModelLoader']