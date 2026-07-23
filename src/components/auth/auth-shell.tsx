import { SparkleIcon } from "@phosphor-icons/react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="auth-shell"><section className="auth-visual"><div className="auth-logo">Picoo</div><div className="auth-spark"><SparkleIcon size={42} weight="fill" /></div><h2>Discover.<br />Remix. Create.</h2><p>GitHub 存代码，Picoo 存 AI 创造。发现值得复用的 Agent、Workflow 与 Prompt。</p><div className="auth-orb" /></section><section className="auth-panel"><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>;
}
