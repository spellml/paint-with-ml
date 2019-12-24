import sys; sys.path.append('../models/SPADE-master/')
from models.pix2pix_model import Pix2PixModel
from options.test_options import TestOptions
from torch import nn
import torch
import numpy as np

opt = TestOptions()
opt.aspect_ratio=1.0
opt.batchSize=1
opt.cache_filelist_read=False
opt.cache_filelist_write=False
opt.checkpoints_dir='/spell/checkpoints/'
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
opt.name='fine_tuned_unfrozen'
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
opt.which_epoch='latest'
opt.z_dim=256


class ServingModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = Pix2PixModel(opt)

    def forward(self, segmap):
        return self.model({
            'label': torch.tensor(segmap[None, None]).float(),
            'instance': torch.tensor([0]),
            'image': torch.tensor(np.zeros((1, 3, 512, 512))).float(),
            'path': ['~/']
        }, mode='inference')

# Trace and save
module_instance = ServingModel()
test_input = torch.tensor(np.ones((1,1,512,512)))
traced_module = torch.jit.trace(module_instance, test_input)
traced_module.save("model.pt")