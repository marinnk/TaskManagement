output "public_ip" {
  description = "EC2インスタンスのパブリックIPアドレス"
  value       = aws_instance.app.public_ip
}

output "ssh_command" {
  description = "SSH接続コマンド"
  value       = "ssh -i terraform/ssh_key.pem ec2-user@${aws_instance.app.public_ip}"
}

output "db_endpoint" {
  description = "RDSの接続先エンドポイント（ホスト名:ポート）"
  value       = aws_db_instance.app.endpoint
}

output "db_name" {
  description = "RDSに作成したデータベース名"
  value       = aws_db_instance.app.db_name
}
