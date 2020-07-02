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

We will provide support for configurable parameters soon.
@BloGPV.BLOSSOMers: The corresponding resources exist for AWS region: eu-west-1 (Ireland)

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

### Developer Guider

Developers will change the [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html). Changes can introduces new failures. The AWS CLI allows to check a [template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) for syntactical correctness without provisioning resources, thus saving time and money.
```bash
# Validate template
$ aws cloudformation validate-template --template-body file://cloudonly-template.yaml
```