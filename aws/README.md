# AWS CloudFormation Deployment

You can deploy the DET (Decentraliced Energ Trading) on the AWS Cloud using the AWS CloudFormation service.

### AWS Cloud Formation

[AWS CloudFormation](https://us-east-2.console.aws.amazon.com/cloudformation/home) is a fully-managed cloud service that provides Infrastructure-as-Code (IaC) capabilities.

Cloud consumers can describe cloud infrastrucutre via declarative files that they can hold in version control.

### Stacks and AWS CLI
We enable a cloud consumer to deploy cloud infrastructure in an automated and reproducible manner.
In AWS CloudFormation lingu, the resulting cloud infrastructure is a [stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html). The text file that describes the target [stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) is a [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-guide.html). We use a [YAML file](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html) to specify a template.
Using a template, the cloud consumer provision a [stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) with the [AWS CLI](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-cli.html).

### Target Infrastructure
We define a [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) that allows cloud consumer to deploy *N* Virtual Machines (VMs), i.e., [EC2 instances](https://docs.aws.amazon.com/de_de/AWSEC2/latest/UserGuide/concepts.html), in the same [VPN](https://docs.aws.amazon.com/de_de/vpn/latest/s2svpn/VPC_VPN.html).

The cloud consumer defines *N* as [parameter](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html#gettingstarted.templatebasics.parameters) for the [AWS CLI](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-cli.html).

### How To
We use the following notation for all code snippets provided in this file. We use the character '\$' to indicate a shell command that is provided by the cloud user. A missing '\$' indicates console output. We assume that all commands are executed from the 'root/aws' folder.

### Requirements
Your target AWS region requires the following ressources:
- EC2 AMI - Example: ami-031a03cb800ecb0d5
- EC2 Security Group - Example: sg-cbcd9484
- EC2 Key Pair - Example: blogpv-jk-ireland

##### EC2 AMI
Currently, we use the default AMI provided by AWS.

##### EC2 Security Group
We assume an existing security group that allows all incoming traffic from all sources and all outgoing traffic to all destinations.

We assume region eu-central-1. You can create a new security group via the [AWS Console](https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#SecurityGroups:)

CAUTION: The security group must be registered with appropriate subnets and mapping tables. This is the case for default security groups.

We will include network configurations via cloud formation soon.

##### Create an EC2 Key-Pair
We assume region eu-central-1. You can create a new key pair via the [AWS Console](https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#KeyPairs:). We assume a Mac-OS and a keyfile mykey.pem. This will download the mykey.pem file of the keypair to $HOME/Downloads.

```bash
# Copy key file to .ssh
$ cp $HOME/Downloads/mykey.pem /Users/joernkuhlenkamp/.ssh/

# Change access
$ chmod 400 $HOME/.ssh/mykey.pem

# (optional) test ssh into an instance
$ ssh -i $HOME/.ssh/mykey.pem ec2-user@myip
```

We will provide support for configurable parameters via the AWS CLI soon.

### User Guider

[Create](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-stack.html) a new CloudFormation stack:
```bash
# Create a new stack with stack-name 'blogpvstack' using template 'cloudonly-template.yaml'
$ aws cloudformation create-stack --stack-name blogpvstack --template-body file://cloudonly-template.yaml --capabilities CAPABILITY_AUTO_EXPAND
```
Check result in the AWS console:
- [CloudFormation](https://eu-central-1.console.aws.amazon.com/cloudformation/home)
- [EC2](https://eu-central-1.console.aws.amazon.com/ec2/v2/home)

[Delete](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/delete-stack.html)
```bash
# Delete stack with stack-name 'blogpvstack'
$ aws cloudformation delete-stack --stack-name blogpvstack
```
Check results in the AWS console:
- [CloudFormation](https://eu-central-1.console.aws.amazon.com/cloudformation/home)
- [EC2](https://eu-central-1.console.aws.amazon.com/ec2/v2/home)

##### Parameters
Users can configure cloud resources via [parameters](https://docs.aws.amazon.com/de_de/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html) in the "create-stack" command. A parameter has a *Name* and takes values in a *Domain*. If omitted, each parameter results to its *Default*. We support the following list of parameters:

| Name | Domain | Default |
|---|--:|--:|
| ImageId  | [AWS::EC2::Image::Id](https://docs.aws.amazon.com/de_de/AWSEC2/latest/UserGuide/ComponentsAMIs.html) | ami-05ca073a83ad2f28c |
| Ec2InstanceType | [EC2 Instance Type](https://aws.amazon.com/de/ec2/instance-types/) | t2.micro |
| Ec2KeyPair | [AWS::EC2::KeyPair::KeyName](https://docs.aws.amazon.com/de_de/AWSEC2/latest/UserGuide/ec2-key-pairs.html) | blogpv-frankfurt-key|
| Ec2SecurityGroupId | [AWS::EC2::SecurityGroup::Id](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) | sg-0b12b2191bf3951cf |

Example:
```bash
# setting the EC2 instance type to 't2.small'
$ aws cloudformation create-stack --stack-name blogpvstack --template-body file://cloudonly-template.yaml --capabilities CAPABILITY_AUTO_EXPAND --parameters ParameterKey=Ec2InstanceType,ParameterValue=t2.small
```

### Developer Guider

Developers will change the [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html). Changes can introduces new failures. The AWS CLI allows to check a [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) for syntactical correctness without provisioning resources, thus saving time and money.
```bash
# Validate template
$ aws cloudformation validate-template --template-body file://cloudonly-template.yaml
```


##### Docker Registry

We use a image registry *blogpvblossom* provided by [Docker Hub](https://hub.docker.com/) to persist Docker images. Docker images allow to launch containers that expose app services on EC2 instances.

The registry provides the following images:
| Image Name | Description | GitHub |
|---|--:|--:|
| [household-db](https://hub.docker.com/repository/docker/blogpvblossom/household-db)  | Launches a Mongo DB for storing meter data at households. | [mongo](https://github.com/JacobEberhardt/decentralized-energy-trading/tree/dynamic_dockerized_setup/mongo) |
| [household-ws]() | Launches a Node.js server that realizes the business logic for a household. | [household-server](https://github.com/JacobEberhardt/decentralized-energy-trading/tree/dynamic_dockerized_setup/household-server) |
| [household-ui](https://hub.docker.com/repository/docker/blogpvblossom/household-ui) | Launches a React Frontend that realizes the UI of a household. | [household-ui](https://github.com/JacobEberhardt/decentralized-energy-trading/tree/dynamic_dockerized_setup/household-ui) |
| [netting-ws]() | | |