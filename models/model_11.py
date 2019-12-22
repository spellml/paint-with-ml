# TODO: this docstring
# 
# This is the ADE20K pretrain model. This is meant to be trained on a machine with
# 8 GPUs onboard. This file is the full, 50-epoch model trainer.

import sys; sys.path.append('../lib/SPADE-master/')
from options.train_options import TrainOptions
from models.pix2pix_model import Pix2PixModel
from collections import OrderedDict
import data
from util.iter_counter import IterationCounter
from util.visualizer import Visualizer
from trainers.pix2pix_trainer import Pix2PixTrainer
import os

opt = TrainOptions()
opt.D_steps_per_G = 1
opt.aspect_ratio = 1.0
opt.batchSize = 8
opt.beta1 = 0.0                           
opt.beta2 = 0.9
opt.cache_filelist_read = False                         
opt.cache_filelist_write = False                         
opt.checkpoints_dir = '/spell/checkpoints/'
opt.contain_dontcare_label = True                          
opt.continue_train = False
opt.crop_size = 256                           
opt.dataroot = '/spell/adek20k'  # data mount point
opt.dataset_mode = "ade20k"
opt.debug = False                         
opt.display_freq = 100                           
opt.display_winsize = 256                           
opt.fff = 1  # junk value for the argparse                            
opt.gan_mode = 'hinge'                         
opt.init_type = 'xavier'                        
opt.init_variance = 0.02                          
opt.isTrain = True
opt.label_nc = 150                           
opt.lambda_feat = 10.0                          
opt.lambda_kld = 0.05                          
opt.lambda_vgg = 10.0                          
opt.load_from_opt_file = False                         
opt.load_size = 286  # should this be 256?
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
opt.tf_log = True
opt.use_vae = False
opt.which_epoch = 'latest'
opt.z_dim = 256
opt.gpu_ids=[0,1,2,3,4,5,6,7]
opt.results_dir='../data/SPADE_from_scratch_results/'
opt.semantic_nc = 151

# Create the folder structure expected by the model checkpointing feature.
if not os.path.exists('/spell/checkpoints/'):
    os.mkdir('/spell/checkpoints/')
if not os.path.exists('/spell/checkpoints/ade20k_pretrained/'):
    os.mkdir('/spell/checkpoints/ade20k_pretrained/')

model = Pix2PixModel(opt)
model.train()

def test_train():
    # print options to help debugging
    # print(' '.join(sys.argv))

    # load the dataset
    dataloader = data.create_dataloader(opt)

    # create trainer for our model
    trainer = Pix2PixTrainer(opt)

    # create tool for counting iterations
    iter_counter = IterationCounter(opt, len(dataloader))

    # create tool for visualization
    visualizer = Visualizer(opt)

    for epoch in iter_counter.training_epochs():
        iter_counter.record_epoch_start(epoch)
        for i, data_i in enumerate(dataloader, start=iter_counter.epoch_iter):
            iter_counter.record_one_iteration()

            # Training
            # train generator
            if i % opt.D_steps_per_G == 0:
                trainer.run_generator_one_step(data_i)

            # train discriminator
            trainer.run_discriminator_one_step(data_i)

            # Visualizations
            if iter_counter.needs_printing():
                losses = trainer.get_latest_losses()
                visualizer.print_current_errors(epoch, iter_counter.epoch_iter,
                                                losses, iter_counter.time_per_iter)
                visualizer.plot_current_errors(losses, iter_counter.total_steps_so_far)

            if iter_counter.needs_displaying():
                visuals = OrderedDict([('input_label', data_i['label']),
                                       ('synthesized_image', trainer.get_latest_generated()),
                                       ('real_image', data_i['image'])])
                visualizer.display_current_results(visuals, epoch, iter_counter.total_steps_so_far)

            if iter_counter.needs_saving():
                print('saving the latest model (epoch %d, total_steps %d)' %
                      (epoch, iter_counter.total_steps_so_far))
                trainer.save('latest')
                iter_counter.record_current_iter()

        trainer.update_learning_rate(epoch)
        iter_counter.record_epoch_end()

        if epoch % opt.save_epoch_freq == 0 or \
           epoch == iter_counter.total_epochs:
            print('saving the model at the end of epoch %d, iters %d' %
                  (epoch, iter_counter.total_steps_so_far))
            trainer.save('latest')
            trainer.save(epoch)

    print('Training was successfully finished.')

test_train()
