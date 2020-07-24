FROM openethereum/openethereum:latest
USER root

# Add template for node configuration
COPY --chown=openethereum template-node.toml /home/blogpv/template-node.toml

# Add template for chain configuration
COPY --chown=openethereum template-chain.json /home/blogpv/template-chain.json

# Add package js
RUN apk update && apk add jq && apk add bash

# Add initialization script that executes at entrypoint
COPY --chown=openethereum init.sh /home/blogpv/init.sh
RUN ["chmod", "+x", "/home/blogpv/init.sh"]
ENTRYPOINT [ "/home/blogpv/init.sh" ]

# Create folder structure

USER openethereum