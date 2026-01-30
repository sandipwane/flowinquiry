output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.flowinquiry.id
}

output "public_ip" {
  description = "Public IP address"
  value       = aws_instance.flowinquiry.public_ip
}

output "public_dns" {
  description = "Public DNS name"
  value       = aws_instance.flowinquiry.public_dns
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ${var.key_name}.pem ec2-user@${aws_instance.flowinquiry.public_ip}"
}

output "frontend_url" {
  description = "Flowinquiry frontend URL"
  value       = "http://${aws_instance.flowinquiry.public_ip}:1234"
}

output "private_key_file" {
  description = "Path to SSH private key"
  value       = "${path.module}/${var.key_name}.pem"
}
