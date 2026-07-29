"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BellIcon, CaretDownIcon, GearIcon, SignOutIcon, SquaresFourIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useLocale } from "@/i18n/locale-provider";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { t } = useLocale();

  if (status === "loading") return <div className="session-skeleton" aria-label={t("account.loading")} />;
  if (status !== "authenticated" || !session.user) {
    return <div className="guest-actions"><Link href="/sign-in" className="sign-in-link">{t("account.signIn")}</Link><Link href="/sign-up" className="sign-up-link">{t("account.signUp")}</Link></div>;
  }

  const name = session.user.name ?? session.user.email ?? "Picoo User";
  const initial = name.slice(0, 1).toUpperCase();
  let avatar: React.ReactNode = initial;
  if (session.user.image) avatar = <img src={session.user.image} alt="" />;
  return (
    <div className="account-actions">
      <Link href="/settings/notifications" className="bell" aria-label={t("account.notifications")}><BellIcon size={20} weight="duotone" /><i /></Link>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className="account-trigger" aria-label={t("account.openMenu")}><span className="avatar user">{avatar}</span><span className="account-name">{name}</span><CaretDownIcon size={14} /></DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="account-menu" sideOffset={8} align="end">
            <div className="account-summary"><b>{name}</b><small>{session.user.email}</small><span>{session.user.roles.join(" · ")}</span></div>
            <DropdownMenu.Separator className="account-separator" />
            <DropdownMenu.Item asChild><Link href="/settings/profile"><UserCircleIcon />{t("account.profile")}</Link></DropdownMenu.Item>
            <DropdownMenu.Item asChild><Link href="/studio"><SquaresFourIcon />{t("account.studio")}</Link></DropdownMenu.Item>
            <DropdownMenu.Item asChild><Link href="/settings/security"><GearIcon />{t("account.security")}</Link></DropdownMenu.Item>
            <DropdownMenu.Separator className="account-separator" />
            <DropdownMenu.Item className="account-logout" onSelect={() => signOut({ redirectTo: "/" })}><SignOutIcon />{t("account.signOut")}</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
