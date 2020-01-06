from setuptools import setup
setup(
    name='model_loader',
    packages=['model_loader'],
    install_requires=[
        'torch>=1.0.0', 'torchvision', 'dominate>=2.3.1', 'dill', 'scikit-image', 'spell>=0.31.25'
    ],
    version='0.0.1',
    python_requires='>=3.6.0',
    description='Helper module for loading a GuaGAN model into memory.',
    keywords=[],
    classifiers=[]
)