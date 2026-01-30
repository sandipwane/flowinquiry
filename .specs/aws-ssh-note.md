
  So tomorrow from office:
  # 1. Get your office IP
  curl https://checkip.amazonaws.com
  # Returns: 103.x.x.x (example)

  # 2. Add it to security group (runs against AWS API, not EC2)
  aws ec2 authorize-security-group-ingress \
    --group-id sg-029bca01cd6a78308 \
    --protocol tcp --port 22 --cidr 103.x.x.x/32

  # 3. Now SSH works from office too!

  You're never locked out of AWS CLI

  - AWS CLI talks to AWS API (internet)
  - SSH talks to EC2 instance (blocked by SG)