FROM zokrates/zokrates

USER root

# Install dependencies
RUN cp zokrates ../../bin/zokrates
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt -y install nodejs
RUN npm install yarn -g
RUN apt -y install git

COPY scripts/install_parity.sh ./
RUN ./install_parity.sh

# Copy NED server related files
RUN mkdir ../ned-processing-unit
WORKDIR /home/ned-processing-unit

COPY parity-authority/parity/config/chain.json ./parity/config/chain.json
COPY parity-authority/parity/config/authority.toml ./parity/authority.toml
COPY parity-authority/parity/authorities/authority0.json ./parity/authority.json
COPY parity-authority/parity/authorities/authority0.pwd ./parity/authority.pwd
RUN parity account import --config parity/authority.toml parity/authority.json

COPY utility-js ./utility-js
COPY contracts ./contracts
COPY helpers ./helpers
COPY zokrates-code/ ./zokrates-code

COPY household-processing-unit/scripts/start_admin.sh ./
COPY scripts/start_ned.sh ./

COPY ned-server/household-handler.js ./ned-server/household-handler.js
COPY ned-server/index.js ./ned-server/index.js
COPY ned-server/zk-handler.js ./ned-server/zk-handler.js

COPY yarn.lock ./
COPY package.json ./
COPY truffle-config.js ./
COPY ned-server-config.js ./

# Install node packages
RUN yarn install

CMD ./start_ned.sh