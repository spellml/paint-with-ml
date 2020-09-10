# app

This folder defines our consumer-facing web application.

## How it works

The application frontend is in React. The core of the application is a drawable HTML Canvas with click-based interaction logic. The application backend is a [model server](https://spell.ml/docs/model_servers) running on Spell. A simple `/predict` proxies requests to the model server to the correct Spell endpoint.

## Standing up the model server

This section is a TODO.

## Building the app

1. Run `npm install` to install the JS packages.
2. Run `npm run-script build` to build the app JS assets.
3. Run `pip install -r requirements.txt` (preferably in a `virtualenv` or `conda` environment) to install the Python packages.
4. Export the Flask environment variables (you may set `FLASK_ENV=production` instead, if you are so inclined):

   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```
5. Start the web service using `flask run --no-reload`. Once the server is running, navigate to the linked-to web page and try it out.
