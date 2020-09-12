# app

This folder defines our consumer-facing web application.

The application frontend is in React. The core of the application is a drawable HTML Canvas with click-based interaction logic. The application backend is a [model server](https://spell.ml/docs/model_servers) running on Spell.

## Deployment

### Local

1. Run `npm install` to install the JS packages.
2. Run `npm run-script build` to build the app JS assets.
3. Run `pip install -r requirements.txt` (preferably in a `virtualenv` or `conda` environment) to install the Python packages.
4. Export the Flask environment variables (you may set `FLASK_ENV=production` instead, if you are so inclined):

   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```
5. Start the web service using `flask run --no-reload`.

### Remote

We're hosting this site statically on AWS S3. See [Enabling website hosting](https://docs.aws.amazon.com/AmazonS3/latest/dev/EnableWebsiteHosting.html) in the AWS documentation for details, and `app/scripts/upload_to_s3.sh` for the deploy script.
