FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  #RUN git clone https://github.com/JacobEberhardt/decentralized-energy-trading.git
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  
  # Install app dependencies
  RUN yarn install
  
  # Install ZoKrates
  RUN curl -LSfs get.zokrat.es | sh
  ENV PATH="/root/.zokrates/bin:${PATH}"
  ENV ZOKRATES_HOME="/root/.zokrates/stdlib"