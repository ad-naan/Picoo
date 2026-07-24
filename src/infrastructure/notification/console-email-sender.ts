import type { EmailMessage, EmailSender } from "@/modules/notification/application/ports/email-sender";
import { writeAudit } from "@/infrastructure/audit/audit-service";

// 开发环境的邮件发送实现：打印到控制台并写审计日志，不实际发信。
// 生产环境替换为 SMTP / Resend 适配器即可，调用方无需改动。
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email] → ${message.to} | ${message.subject}\n${message.body}`);
    await writeAudit({
      action: "email.send",
      resourceType: "email",
      metadata: { to: message.to, subject: message.subject, transport: "console" },
    });
  }
}
