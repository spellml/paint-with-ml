# TODO
FROM python:3.7

# set the working directory
RUN ["mkdir", "app"]
WORKDIR "app"

# install code dependencies
COPY "requirements.txt" .
RUN ["pip", "install", "-r", "requirements.txt"]

# install environment dependencies
COPY "build.ipynb" .
COPY "catalog-screencap.png" .

# provision environment
EXPOSE 8080
ENTRYPOINT ["jupyter", "notebook", "--ip", "0.0.0.0", "--port", "8080", "--allow-root", "--NotebookApp.token=''", "--NotebookApp.password=''"]