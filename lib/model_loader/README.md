# model_loader

`model_loader` is a pip-installable Python package for initializing a well-specified GuaGAN model. In other words, this module defines a basic [**model server**](https://medium.com/@vikati/the-rise-of-the-model-servers-9395522b6c58).

Like many of the more complex neural networks you might want to use in or integrate into your projects, GuaGAN has its own unique configuration and initialization system. In the like scenario that we are working with many different models and/or model architectures, configuration differences quickly become a source of user error. Defining a common interface over your production models ameliorates this problem.

While this package is specific to this project, it demonstrates some best practices for model management in both test and production use cases:

* Model checkpoint data is managed using a dedicated data-serving service suitable to the task, [SpellFS](https://spell.run/docs/resources). The checkpoints are downloaded to a local disk cache at runtime.

  Model gradients for larger models are in the tens of millions or more, potentially resulting in multi-GB download times. [Manage these resources like data, not like code](https://blog.quiltdata.com/reproduce-a-machine-learning-model-build-in-four-lines-of-code-b4f0a5c5f8c8).

* Model configuration, which is comparatively lightweight, is packaged inside the code module, and thus managed using git. This follows the principle known as a infrastructure as code.

* The model interface is defined at the model object level. Our frontend application provides a PNG-type [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) as input and expects the same type as output. Our core PyTorch model on the other hand expects a batch tensor as input and provides one as output. The model loader `get_prediction` routine handles all of the serialization and deserialization required to make this work.

  We could handle this inside of our web server instead. But this would make testing much more difficult. Preference should be for keeping the model serving logic in the web server as thin as possible.

## How it works

Every run executed via Spell is assigned a unique (consecutive) run ID. `model_loader` expects model configuration to be stored by run ID in a YAML file accessible on disk at a location specified by the `MODEL_CONFIG_PATH` environment variable. To initialize a model, initialize a `model_loader.ModelLoader(run_id)` object; this will check the model configuration out of the local file, and the model checkpoints out of Spell file system, SpellFS.

Model checkpoints are cached on disk in the `checkpoints/` folder.

Model productionization is does not have anything like standard practice. Depending on your training and model storage infrastructure, model configuration needs, and model serving architecture, you may choose to make different design decisions in the model server layer. Whatever code you write or service you need should nevertheless pay attention the best practices demonstrated here.
