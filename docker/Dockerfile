FROM node:9

RUN mkdir /var/lib/app
RUN npm i -g npm@^5.7.1
RUN npm i -g node-wait-for-it

COPY package*.json /var/lib/app/
WORKDIR /var/lib/app
RUN npm ci

COPY ./ /var/lib/app
RUN make clean
RUN npm run dist

COPY ./docker/scripts /home/docker/

ENTRYPOINT ['true']
