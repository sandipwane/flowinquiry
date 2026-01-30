# Terraform AWS Deployment Spec

## Goal
Create Terraform config to deploy Flowinquiry POC on single EC2 instance in us-east-1.

## Directory Structure
```
apps/ops/terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── user-data.sh
└── terraform.tfvars.example
```

## File Specifications

### variables.tf
```hcl
variable "aws_region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t3.medium"
}

variable "volume_size" {
  default = 50
}

variable "allowed_ssh_ips" {
  type        = list(string)
  description = "List of IPs allowed to SSH (CIDR format)"
  # Example: ["223.233.85.240/32", "103.x.x.x/32"]
}

variable "github_repo" {
  default = "https://github.com/sandipwane/flowinquiry.git"
}

variable "github_branch" {
  default = "feature/fi-cli"
}

variable "key_name" {
  default = "flowinquiry-poc"
}

variable "postgres_password" {
  sensitive = true
}

variable "jwt_base64_secret" {
  sensitive = true
}
```

### main.tf
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get latest Ubuntu 22.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# Key pair (generate locally, import public key)
resource "tls_private_key" "flowinquiry" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "flowinquiry" {
  key_name   = var.key_name
  public_key = tls_private_key.flowinquiry.public_key_openssh
}

resource "local_file" "private_key" {
  content         = tls_private_key.flowinquiry.private_key_pem
  filename        = "${path.module}/flowinquiry-poc.pem"
  file_permission = "0600"
}

# Security Group
resource "aws_security_group" "flowinquiry" {
  name        = "flowinquiry-poc-sg"
  description = "Flowinquiry POC security group"

  # SSH - restricted to allowed IPs
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_ips
  }

  # HTTP (Caddy)
  ingress {
    from_port   = 1234
    to_port     = 1234
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (Caddy)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound - allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "flowinquiry-poc-sg"
  }
}

# EC2 Instance
resource "aws_instance" "flowinquiry" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.flowinquiry.key_name
  vpc_security_group_ids = [aws_security_group.flowinquiry.id]

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user-data.sh", {
    github_repo       = var.github_repo
    github_branch     = var.github_branch
    postgres_password = var.postgres_password
    jwt_base64_secret = var.jwt_base64_secret
  })

  tags = {
    Name = "flowinquiry-poc"
  }
}
```

### outputs.tf
```hcl
output "instance_id" {
  value = aws_instance.flowinquiry.id
}

output "public_ip" {
  value = aws_instance.flowinquiry.public_ip
}

output "public_dns" {
  value = aws_instance.flowinquiry.public_dns
}

output "ssh_command" {
  value = "ssh -i ${path.module}/flowinquiry-poc.pem ubuntu@${aws_instance.flowinquiry.public_ip}"
}

output "frontend_url" {
  value = "http://${aws_instance.flowinquiry.public_ip}:1234"
}

output "private_key_path" {
  value = local_file.private_key.filename
}
```

### user-data.sh
```bash
#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== Starting Flowinquiry Setup ==="

# Update system
apt-get update
apt-get install -y ca-certificates curl gnupg git

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Clone repo
su - ubuntu -c "git clone -b ${github_branch} ${github_repo} ~/flowinquiry"

# Create .env file
cat > /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.env << 'ENVEOF'
POSTGRES_PASSWORD=${postgres_password}
JWT_BASE64_SECRET=${jwt_base64_secret}
ENVEOF

# Create .backend.env
cat > /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.backend.env << 'ENVEOF'
SPRING_PROFILES_ACTIVE=prod
ENVEOF

# Create .frontend.env
cat > /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.frontend.env << 'ENVEOF'
NODE_ENV=production
ENVEOF

# Set permissions
chown ubuntu:ubuntu /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.env
chown ubuntu:ubuntu /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.backend.env
chown ubuntu:ubuntu /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.frontend.env
chmod 600 /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.env
chmod 600 /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.backend.env
chmod 600 /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker/.frontend.env

# Build frontend image (for correct architecture)
cd /home/ubuntu/flowinquiry
docker build -t flowinquiry/flowinquiry-frontend:1.2.3 -f apps/frontend/Dockerfile .

# Start services
cd /home/ubuntu/flowinquiry/apps/ops/flowinquiry-docker
docker compose -f services_http.yml up -d

echo "=== Flowinquiry Setup Complete ==="
```

### terraform.tfvars.example
```hcl
# Copy to terraform.tfvars and fill in values

aws_region    = "us-east-1"
instance_type = "t3.medium"
volume_size   = 50

# Add your IP(s) for SSH access
# Get your IP: curl https://checkip.amazonaws.com
allowed_ssh_ips = ["YOUR_IP/32"]

github_repo   = "https://github.com/sandipwane/flowinquiry.git"
github_branch = "feature/fi-cli"

# Secrets (generate secure values)
postgres_password = "GENERATE_SECURE_PASSWORD"
jwt_base64_secret = "GENERATE_BASE64_SECRET"
```

## Usage Instructions

### Prerequisites
- Terraform installed (`brew install terraform`)
- AWS CLI configured (`aws configure`)

### Deploy
```bash
cd apps/ops/terraform

# Copy and edit tfvars
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize
terraform init

# Preview
terraform plan

# Deploy
terraform apply

# Get outputs
terraform output
```

### Access
```bash
# SSH (use output ssh_command)
ssh -i flowinquiry-poc.pem ubuntu@<public_ip>

# Check logs
ssh ... 'tail -f /var/log/user-data.log'

# Check containers
ssh ... 'docker compose -f ~/flowinquiry/apps/ops/flowinquiry-docker/services_http.yml ps'
```

### Add SSH IP Later
```bash
# Edit terraform.tfvars
allowed_ssh_ips = ["223.233.85.240/32", "103.x.x.x/32"]

# Apply changes
terraform apply
```

### Destroy
```bash
terraform destroy
```

## Notes
- Frontend is built on EC2 (ensures correct amd64 architecture)
- User data script logs to /var/log/user-data.log
- Services auto-start via docker compose
- Key pair generated by Terraform, saved locally
- Secrets passed via terraform.tfvars (gitignored)

## .gitignore additions
```
# Terraform
apps/ops/terraform/*.tfstate
apps/ops/terraform/*.tfstate.*
apps/ops/terraform/.terraform/
apps/ops/terraform/*.pem
apps/ops/terraform/terraform.tfvars
```
