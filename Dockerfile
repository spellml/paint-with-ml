FROM node:12.14.0 AS node_staging

COPY app/ .
RUN npm install; \
    npm run-script build;

FROM python:3.7

RUN mkdir app
WORKDIR /app

COPY app/ app/
COPY lib/ lib/
COPY --from=node_staging static/dist/ app/static/dist/

RUN apt-get update && apt-get install -y ssh rsync; \
    pip install -r app/requirements.txt; \
    pip install lib/model_loader/;
ENV FLASK_APP=app/app.py \
    FLASK_ENV=production \
    MODEL_CODE_PATH=./lib/SPADE-master/ \
    MODEL_CONFIG_PATH=./app/models/;

EXPOSE 5000

ENTRYPOINT flask run --host=0.0.0.0 --port=5000