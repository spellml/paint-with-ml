# models

This folder contains all of the models built over the course of this project.

The GuaGAN model is designed to be used from the command line, and uses CLI-based `argparse` configuration. Internally all this does within the Python code is create a `TrainOptions` or `TestOptions` object with the right fields attached. To execute the model from a Python script, we create and configure our own `TrainOptions` with the correct options set.

A machine learning project will involve many iterations of model training. You will start with a simple model, one which either replicates an expected result or produces a simple output. That models grows in complexity as you try new things, keeping what works and discarding what doesn't. The collective list of models you train this way is your **model history**.
