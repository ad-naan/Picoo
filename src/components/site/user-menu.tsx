"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BellIcon, CaretDownIcon, GearIcon, SignOutIcon, SquaresFourIcon, UserCircleIcon } from "@phosphor-icons/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="session-skeleton" aria-label="正在加载登录状态" />;

  if (status !== "authenticated" || !session.user) {
    return <div className="guest-actions"><Link href="/sign-in" className="sign-in-link">登录</Link><Link href="/sign-up" className="sign-up-link">注册</Link></div>;
  }

  const name = session.user.name ?? session.user.email ?? "Picoo User";
  const initial = name.slice(0, 1).toUpperCase();
  return <div className="account-actions"><Link href="/settings/notifications" className="bell" aria-label="通知"><BellIcon size={20} weight="duotone" /><i /></Link><DropdownMenu.Root><DropdownMenu.Trigger className="account-trigger" aria-label="打开账号菜单"><span className="avatar user">{session.user.image ? <img src={session.user.image} alt="" /> : initial}</span><span className="account-name">{name}</span><CaretDownIcon size={14} /></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="account-menu" sideOffset={8} align="end"><div className="account-summary"><b>{name}</b><small>{session.user.email}</small><span>{session.user.roles.join(" · ")}</span></div><DropdownMenu.Separator className="account-separator" /><DropdownMenu.Item asChild><Link href="/settings/profile"><UserCircleIcon />个人中心</Link></DropdownMenu.Item><DropdownMenu.Item asChild><Link href="/studio"><SquaresFourIcon />Creator Studio</Link></DropdownMenu.Item><DropdownMenu.Item asChild><Link href="/settings/security"><GearIcon />账号安全</Link></DropdownMenu.Item><DropdownMenu.Separator className="account-separator" /><DropdownMenu.Item className="account-logout" onSelect={() => signOut({ redirectTo: "/" })}><SignOutIcon />退出登录</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div>;
}
