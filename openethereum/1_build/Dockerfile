FROM openethereum/openethereum:latest
# ARG NETWORK_NAME=Blogpv
USER root

# Setting up node config
# COPY --chown=openethereum node_config.toml /home/blogpv/node_config.toml
COPY --chown=openethereum template-node.toml /home/blogpv/template-node.toml

# Setting up chain specification
COPY --chown=openethereum template-chain.json /home/blogpv/template-chain.json
# RUN ["touch", "/home/blogpv/chain.json"]

# Set default node account password
# COPY --chown=openethereum bootnode_account.pwd /home/blogpv/node_account.pwd

# Copy init scrip
COPY --chown=openethereum init.sh /home/blogpv/init.sh
RUN ["chmod", "+x", "/home/blogpv/init.sh"]

# RUN echo $(/home/openethereum/openethereum account new --password /home/blogpv/node_account.pwd) > /home/blogpv/bootnode_address

ENTRYPOINT [ "/home/blogpv/init.sh" ]
# ENTRYPOINT [ "touch", "/home/blogpv/node_account.pwd", "&&", "./openethereum" ]

# CMD [ "echo",  "$ACCOUNT_PASSWORD", ">", "/home/blogpv/node_account.pwd", "&&"]
# RUN chown -R openethereum: /home/blogpv

# Adding JSON key files. Default location: '$BASE/keys'
# COPY --chown=parity parity/keys /home/parity/.local/share/io.parity.ethereum/keys/${NETWORK_NAME}

#
# COPY --chown=parity parity/authorities/authority${ID}.json /home/parity/.local/share/io.parity.ethereum/keys/${NETWORK_NAME}/authority.json

#
# COPY --chown=parity parity/authorities/authority${ID}.pwd parity/authority.pwd

#
# COPY --chown=parity parity/node${ID}.network.key /home/parity/.local/share/io.parity.ethereum/network/key

#
# RUN mkdir -p /home/parity/.local/share/io.parity.ethereum/chains/${NETWORK_NAME}/db
# RUN chown -R parity: /home/parity/.local/share/io.parity.ethereum

USER openethereum
