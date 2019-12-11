# This is a ADE20K training script in a 512x512 configuration.
# Used to test how long and how expensive this model would be to train from scratch.

import sys; sys.path.append('../lib/SPADE-master/')
from options.train_options import TrainOptions
from models.pix2pix_model import Pix2PixModel
from collections import OrderedDict
import data
from util.iter_counter import IterationCounter
from util.visualizer import Visualizer
from trainers.pix2pix_trainer import Pix2PixTrainer

opt = TrainOptions()

opt.D_steps_per_G = 1
opt.aspect_ratio = 1.0
opt.batchSize = 1
opt.beta1 = 0.0                           
opt.beta2 = 0.9
opt.cache_filelist_read = False                         
opt.cache_filelist_write = False                         
opt.checkpoints_dir = '/spell/checkpoints/'
opt.contain_dontcare_label = True                          
opt.continue_train = False
opt.crop_size = 512                           
opt.dataroot = '/spell/ade20k_c/ADEChallengeData2016/'  # data mount point
opt.dataset_mode = "ade20k"
opt.debug = False                         
opt.display_freq = 100                           
opt.display_winsize = 512                           
opt.fff = 1  # junk value for the argparse                            
opt.gan_mode = 'hinge'                         
# opt.gpu_ids = []                             
opt.init_type = 'xavier'                        
opt.init_variance = 0.02                          
opt.isTrain = True
opt.label_nc = 150                           
opt.lambda_feat = 10.0                          
opt.lambda_kld = 0.05                          
opt.lambda_vgg = 10.0                          
opt.load_from_opt_file = False                         
opt.load_size = 512
opt.lr = 0.0002                        
opt.max_dataset_size = 9223372036854775807           
opt.model = 'pix2pix'                       
opt.nThreads = 0                             
opt.n_layers_D = 4                             
opt.name = 'ade20k_pretrained'
opt.ndf = 64                            
opt.nef = 16                            
opt.netD = 'multiscale'                    
opt.netD_subarch = 'n_layer'                       
opt.netG = 'spade'                         
opt.ngf = 64                            
opt.niter = 50                            
opt.niter_decay = 0                             
opt.no_TTUR = False                         
opt.no_flip = False                         
opt.no_ganFeat_loss = False                         
opt.no_html = True                         
opt.no_instance = True                          
opt.no_pairing_check = False
opt.no_vgg_loss = False                         
opt.norm_D = 'spectralinstance'              
opt.norm_E = 'spectralinstance'              
opt.norm_G = 'spectralspadesyncbatch3x3'     
opt.num_D = 2                             
opt.num_upsampling_layers = 'normal'                        
opt.optimizer = 'adam'                          
opt.output_nc = 3                             
opt.phase = 'train'                         
opt.preprocess_mode = 'resize_and_crop'               
opt.print_freq = 100                           
opt.save_epoch_freq = 10                            
opt.save_latest_freq = 5000                          
opt.serial_batches = False                         
opt.tf_log = False                         
opt.use_vae = False                         
opt.which_epoch = 'latest'                        
opt.z_dim = 256

# addition arguments copied over from the previous TestOptions declarer
opt.gpu_ids=[0]
opt.results_dir='../data/SPADE_from_scratch_results/'
opt.semantic_nc = 151