FROM opentensorfdn/bittensor:3.3.3-torch1.12.0-cuda11.3-cubit1.1.1-pm2
RUN DEBIAN_FRONTEND=noninteractive apt install -y expect
RUN wget https://deb.nodesource.com/setup_lts.x
RUN chmod 700 setup_lts.x
RUN ./setup_lts.x
RUN apt-get install -y nodejs expect &&  npm i -g pm2  
RUN npm i -g yarn
WORKDIR /workspace
COPY . .
EXPOSE 7033
RUN rm -rf node_modules yarn.lock package.lock
RUN npm i
RUN chmod 700 /workspace/start.sh
RUN yarn build
CMD ["/bin/bash", "/workspace/start.sh"]

