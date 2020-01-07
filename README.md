# bob-ross-neural-painter

Bob Ross was a painter and television icon who presented "The Joy of Painting" on PBS for over a decade. He is remembered for his talent and kindness, and remains popular in Internet culture today. Ross had a particular fast and easy-to-learn technique to his painting on the show, one which was popular with viewers and reamins easily identifiable to this day.

In this repository, we build a web application that lets you create your own "Bob Ross like" paintings right from the web browser. Behind the scenes, this bit of magic is powered by a type of machine learning algorithm known as a generative adversial network, or GAN. We use Spell for model training and deployment.

Here are some examples of images created with the Bob Ross Neural Painter algorithm:

$IMAGE_PANEL

Try it out yourself at $LINK. Or, read the article describing how it was made: "$TITLE". Or, keep reading to learn how to train, build, and run this service yourself!

## Project hierarchy

```
├── LICENSE
├── README.md             <- You're reading it!
├── lib/                  <- Vendored model code (Python).
│   ├── SPADE-master/     <- Vendored copy of NVlabs/SPADE.* **
│   └── module_loader/    <- Simple model server Python module used for model serving.
├── models                <- Model assets
│   ├── model_0.py        <- The build script for the first model trained.
│   ├── ...
│   ├── model_N.py        <- The build script for the last model trained.
│   └── README.md         <- Reference to the models builds.
├── notebooks             <- Jupyter notebooks discussing the model build process.
├── requirements.txt      <- Project environment requirements, installable with pip.
├── app/                  <- User-facing demo React web app.
│   ├── README.md         <- Reference on how to build and serve the web app.
│   ├── index.html
│   ├── components/       <- Web app React components.
│   ├── models/           <- Loadable model configs (see module_loader).
│   ├── static/           <- Web app static resources (e.g. CSS, build JS).
│   ├── requirements.txt  <- Web app Python requirements, installable with pip.
|   └── package.json      <- Web app JS requirements, installable with npm.
├── Dockerfile            <- Dockerfile bundling the web application.
└── .gitignore

*  Also contains a copy of vacancy/Synchronized-BatchNorm-PyTorch, a NVlabs/SPADE requirement
** Code has minor modifications made for compatibility with the Jupyter environment
```
