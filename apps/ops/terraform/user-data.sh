#!/bin/bash
set -ex

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== Starting Flowinquiry setup ==="

# Install Docker
dnf update -y
dnf install -y docker git

# Start Docker
systemctl enable docker
systemctl start docker

# Install Docker Compose
DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Clone repository
cd /home/ec2-user
git clone --branch ${git_branch} https://github.com/flowinquiry/flowinquiry.git
cd flowinquiry/apps/ops/flowinquiry-docker

# Get instance public IP
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)

# Create backend env file
cat > .backend.env << 'ENVEOF'
POSTGRES_PASSWORD=${postgres_password}
JWT_BASE64_SECRET=${jwt_base64_secret}
ENVEOF

# Create frontend env file
cat > .frontend.env << ENVEOF
HOST_IP=$PUBLIC_IP
ENVEOF

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/flowinquiry

# Start services
docker-compose -f services_http.yml up -d

echo "=== Flowinquiry setup complete ==="
echo "Frontend available at: http://$PUBLIC_IP:1234"
