# AWS Configuration
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-west-2"
}

# Instance Configuration
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Name for the SSH key pair"
  type        = string
  default     = "flowinquiry-key"
}

variable "instance_name" {
  description = "Name tag for EC2 instance"
  type        = string
  default     = "flowinquiry-poc"
}

# Application Secrets
variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "jwt_base64_secret" {
  description = "JWT secret (base64 encoded)"
  type        = string
  sensitive   = true
}

# Git Configuration
variable "git_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

# Network Configuration
variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access (restrict for security)"
  type        = string
  default     = "0.0.0.0/0"
}
