export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  // 可选 HTML 版本；纯文本 body 始终必填以便降级。
  html?: string;
}

// 出站邮件端口。具体投递（SMTP、Resend 等）由基础设施层实现，
// 领域与应用层只依赖此接口，便于替换和测试。
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
