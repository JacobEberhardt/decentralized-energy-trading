# Building Contain Images

### Base Image
We build on the base image `openethereum/openethereum:latest`. This is an alpine distribution.

We install additional packages on the image. We use the package manager `apk`.
Additional packages are:
- `js`: parsing json
- `bash`: advanced shell

### Source Files
Building a container image requires source files. This folder contains all source files. The source files are:
- Build script for image: `Dockerfile`
- Template for chain config: `template-chain.json`
- Template for node config: `template-node.toml`
- Init script for entrypoint: `init.sh`

Idea: We use the `Dockerfile` to copy `template-chain.json`, `template-node.toml`, and `init.sh` to the image. We set the `entrypoint`to `init.sh`. We use `init.sh` to create the final chain configuration and node configuration.

The `init.sh` script is a pure hook. Thus, it executes the old `entrypoint` of the parent image as last command. In addition it appends all argumends provided via `command` to the old `entrypoint`.

### Templates
The source files include two templates. The `init.sh`script use both templates to create the chain config and node config at container start time. The two templates are `template-chain.json` and `template-node.toml`.

The `init.sh` script replaces `{ VARIABLE_NAME }` in the template with the content of the environment variable `VARIABLE_NAME`.

### Usage

Build Docker container image:
```
# Assumption: Current folder .../1_build/
$ docker image build -t blogpvblossom/openethereum:latest .
```

Push Docker container image to container registry:
```
# Assumption: Logged into registry
$ $ docker image push blogpvblossom/openethereum
```