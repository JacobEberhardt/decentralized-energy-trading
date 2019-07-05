FROM node:8-stretch

RUN curl -LSfs get.zokrat.es | sh
RUN mv root/.zokrates/bin/zokrates bin/zokrates
COPY scripts/install_parity.sh ./
RUN ./install_parity.sh

RUN mkdir /ned-processing-unit
WORKDIR /ned-processing-unit

COPY parity-authority/parity/config/chain.json ./parity/config/chain.json
COPY parity-authority/parity/config/authority.toml ./parity/authority.toml
COPY parity-authority/parity/authorities/authority0.json ./parity/authority.json
COPY parity-authority/parity/authorities/authority0.pwd ./parity/authority.pwd
RUN parity account import --config ./parity/authority.toml ./parity/authority.json

COPY utility-js ./utility-js
COPY contracts ./contracts
COPY helpers ./helpers
COPY yarn.lock ./
COPY package.json ./
COPY truffle-config.js ./
COPY ned-server-config.js ./
COPY household-processing-unit/scripts/start_admin.sh ./

RUN yarn install --network-concurrency 1

COPY ned-server/household-handler.js ./ned-server/household-handler.js
COPY ned-server/index.js ./ned-server/index.js
COPY ned-server/zk-handler.js ./ned-server/zk-handler.js

COPY scripts/start_ned.sh ./
CMD ./start_ned.sh