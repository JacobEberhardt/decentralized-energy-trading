FROM ubuntu:bionic

COPY  ./household-processing-unit/parity/node.network.key /home/parity/.local/share/io.parity.ethereum/network/key

RUN apt-get update && apt-get install -y gnupg2
RUN apt-get -y install apt-transport-https ca-certificates
RUN apt-get -y install systemd
RUN apt install -y mongodb
RUN apt-get -y install curl
RUN apt -y install nodejs npm
RUN npm install yarn -g
RUN apt -y install git

RUN mkdir /household_procesing_unit
WORKDIR /household_procesing_unit

COPY contracts ./contracts
COPY helpers ./helpers
COPY household-server ./household-server
COPY household-ui ./household-ui
COPY migrations ./migrations

COPY household-server-config.js ./
COPY package.json ./
COPY truffle-config.js ./
COPY yarn.lock ./
COPY parity-authority/parity/config/chain.json ./parity/config/chain.json
COPY parity-authority/parity/config/authority.toml ./parity/authority.toml
COPY parity-authority/parity/authorities/authority0.json ./parity/authority.json
COPY parity-authority/parity/authorities/authority0.pwd ./parity/authority.pwd
COPY household-processing-unit/scripts/start_admin.sh ./
COPY household-processing-unit/scripts/setup_parity.sh ./

RUN yarn install --network-concurrency 1
WORKDIR /household_procesing_unit/household-ui
RUN yarn install --network-concurrency 1

WORKDIR /household_procesing_unit
RUN ./setup_parity.sh
RUN parity account import --config ./parity/authority.toml ./parity/authority.json
WORKDIR /household_procesing_unit

CMD ./start_admin.sh