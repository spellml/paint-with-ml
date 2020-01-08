# app

This folder defines our consumer-facing web application.

## How it works

The application frontend is in React. The core of the application is a drawable HTML Canvas with click-based interaction logic.

The application backend is a structured as a simple Python-Flask application. Model predictions are served on the `/predict` path, but almost all of the model serving logic is managed using the `model_loader` model server package located in the `/lib` folder (see [the `README.md` in the `model_loader` folder](https://github.com/ResidentMario/bob-ross-neural-painter/tree/master/lib/model_loader) for more details).

## Building the app

1. Run `npm install` to install the JS packages.
2. Run `npm run-script build` to build the app JS assets.
3. Run `pip install -r requirements.txt` (preferably in a `virtualenv` or `conda` environment) to install the Python packages.
4. Navigate to the `/lib/model_loader` folder and install the `model_loader` package: `pip install .`
5. Set the environment variables expected by `model_loader`:

    ```bash
    export MODEL_CODE_PATH=/${path_to}/bob-ross-neural-painter/lib/SPADE-master/
    export MODEL_CONFIG_PATH=/${path_to}/bob-ross-neural-painter/app/models/
    ```

   ...replacing `path_to` with the path to this project on your local machine.
6. Download a copy of the model checkpoints here (TODO: $LINK). Unzip this file to `checkpoints/79/latest_net_G.pth`, e.g. in a `checkpoints/` subdirectory.
7. Export the Flask environment variables (you may set `FLASK_ENV=production` instead, if you are so inclined):

   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```

8. If you are running on a GPU, export the CUDA GPU environment variable:

   ```bash
   export CUDA_VISIBLE_DEVICES=0
   ```

   For model serving on CPU, skip this step.

9. Start the web service using `flask run --no-reload`. It may take some time for the app to start the first time you run this command as `model_loader` will need to download the model checkpoints to local disk.
10. Once the server is running, navigate to the linked-to web page and try it out.