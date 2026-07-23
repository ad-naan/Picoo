import Link from "next/link";

export default function ForbiddenPage() {
  return <main className="state-page"><div><span>403</span><h1>没有访问权限</h1><p>当前账号没有执行此操作所需的权限。</p><Link href="/">返回首页</Link></div></main>;
}
