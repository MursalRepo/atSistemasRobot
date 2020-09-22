FROM node:14

RUN mkdir /usr/app
WORKDIR /usr/app

COPY package.json .
RUN rm -rvf node_modules
RUN npm install
COPY . /usr/app
EXPOSE 6379
CMD ["npm", "run", "start"]