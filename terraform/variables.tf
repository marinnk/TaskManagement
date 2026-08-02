variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名のプレフィックス"
  type        = string
  default     = "taskmanagement"
}

variable "instance_type" {
  description = "EC2インスタンスタイプ（無料利用枠対象のものを指定する。このアカウントではt3.microが対象）"
  type        = string
  default     = "t3.micro"
}

variable "allowed_ssh_cidr" {
  description = "SSH接続を許可するIPアドレス（CIDR形式、例: 1.2.3.4/32）"
  type        = string
}

variable "db_instance_class" {
  description = "RDSインスタンスクラス（無料利用枠対象のものを指定する）"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "RDSに作成するデータベース名"
  type        = string
  default     = "taskmanagement"
}

variable "db_username" {
  description = "RDSのマスターユーザー名"
  type        = string
}

variable "db_password" {
  description = "RDSのマスターパスワード"
  type        = string
  sensitive   = true
}
