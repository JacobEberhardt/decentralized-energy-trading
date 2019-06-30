FROM node:8-stretch

RUN curl -LSfs get.zokrat.es | sh
RUN mv root/.zokrates/bin/zokrates bin/zokrates
COPY scripts/install_parity.sh ./
RUN ./install_parity.sh

COPY utility-js ./utility-js
COPY contracts ./contracts
COPY helpers ./helpers
COPY yarn.lock ./
COPY package.json ./
COPY truffle-config.js ./
COPY ned-server-config.js ./

RUN yarn install --network-concurrency 1
RUN yarn compile-contracts

RUN mkdir /ned-server
WORKDIR /ned-server

COPY ned-server/household-handler.js ./
COPY ned-server/index.js ./
COPY ned-server/zk-handler.js ./


CMD ["node", "index.js"]