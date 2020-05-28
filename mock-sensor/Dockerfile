FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  # Install app dependencies
  RUN yarn install