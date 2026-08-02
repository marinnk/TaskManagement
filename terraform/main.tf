# Amazon Linux 2023の最新AMIを取得する
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# デフォルトVPC・サブネットを利用する（新規VPCは作らない）
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# SSH用の鍵ペアをTerraformに作らせる
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ssh" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.ssh.public_key_openssh
}

# 秘密鍵をローカルファイルに保存する（.gitignoreでコミット対象外）
resource "local_file" "private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/ssh_key.pem"
  file_permission = "0600"
}

# セキュリティグループ：SSH(22番)・HTTP(80番)を、指定したIPからだけ許可する
# （リソース名はssh_onlyのままだが、AWS側のdescriptionと同様に変更すると
# セキュリティグループの再作成が必要になるため、Phase 3bでの80番追加後も維持している）
resource "aws_security_group" "ssh_only" {
  name        = "${var.project_name}-sg"
  description = "Allow SSH only from a specific IP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH from allowed IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP from allowed IP only (not open to everyone)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# EC2インスタンス本体（何もインストールしない、素のサーバー）
resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  subnet_id              = tolist(data.aws_subnets.default.ids)[0]
  vpc_security_group_ids = [aws_security_group.ssh_only.id]
  key_name               = aws_key_pair.ssh.key_name

  root_block_device {
    volume_size = 16
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.project_name}-app"
  }
}
