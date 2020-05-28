FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  #RUN git clone https://github.com/JacobEberhardt/decentralized-energy-trading.git
  
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  # Install app dependencies
  
  RUN yarn install