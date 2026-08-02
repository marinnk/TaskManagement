output "public_ip" {
  description = "EC2インスタンスのパブリックIPアドレス"
  value       = aws_instance.app.public_ip
}

output "ssh_command" {
  description = "SSH接続コマンド"
  value       = "ssh -i terraform/ssh_key.pem ec2-user@${aws_instance.app.public_ip}"
}
