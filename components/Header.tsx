"use client";
import Logo from '@/assets/vehicleopsLogo.svg'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import HamburgerMenu from "@/components/hamburger-menu";
import LoginButton from "@/components/login/LoginButton";
import UserMenu from './profile/UserMenu';

export function HeaderNav({ navClassname, ulClassname, liClassname }: { navClassname?: string, ulClassname?: string, liClassname?: string }) {
  const [activePath, setActivePath] = useState("");
  const pathname = usePathname();

  useEffect(() => setActivePath(pathname), [pathname]);

  const navLinks = [
    { id: 0, text: "Services", path: '/services' },
    { id: 1, text: "Spare parts", path: '/spare-parts' },
    { id: 2, text: "Support", path: '/support' }
  ];

  return (
    <nav className={cn('hidden sm:block', navClassname)}>
      <ul className={cn('flex items-center gap-x-10', ulClassname)}>
        {navLinks.map((nLink) => {
          const isActive = activePath === nLink.path;
          return (
            <Link
              href={nLink.path}
              className={cn(
                "cursor-pointer text-charcoal80 text-base font-medium",
                liClassname,
                isActive && "font-semibold text-charcoal"
              )}
              key={nLink.id}
            >
              {nLink.text}
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}

export function HeaderButtons({ divClassname }: { divClassname?: string }) {
  return (
    <div className={cn('hidden sm:flex items-center gap-x-6', divClassname)}>
      <LoginButton />
      <Button
        asChild={true}
        className="flex justify-center items-center bg-steel-blue/10 border border-steel-blue/20 rounded-[32px] py-2 px-6 hover:bg-steel-blue/25"
      >
        <Link className="text-steel-blue font-semibold text-base" href="/register">
          Qeydiyyat
        </Link>
      </Button>
    </div>
  );
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Determine which header section to show
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const authData = localStorage.getItem("auth_response");
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed?.company_id || parsed?.id || parsed?.branch_id) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="w-full h-24 bg-soft-blue">
      <Container className="flex items-center justify-between gap-x-6">
        <Link href="/">
          <Logo className="!size-12" />
        </Link>

        <HeaderNav />

        <div className="flex gap-6 items-center">
          {!isLoggedIn && <HeaderButtons />}
          {isLoggedIn && <UserMenu />}
        </div>

        <HamburgerMenu />
      </Container>
    </header>
  );
}
