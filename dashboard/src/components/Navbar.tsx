"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "INVESTIGATE", href: "/" },
    { name: "EVIDENCE BOARD", href: "/graph" },
    { name: "SAFETY CHECK", href: "/check" },
    { name: "ACTIVE CASES", href: "/cases" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-[#2a2a2a] px-6 flex items-center justify-between">
      <Link href="/" className="flex flex-col group">
        <span className="font-bebas text-3xl tracking-wider text-[#f5a623] animate-neon-flicker leading-none">
          CAPI
        </span>
        <span className="font-mono text-[9px] tracking-widest text-[#9ca3af] uppercase mt-0.5 group-hover:text-[#f5a623] transition-colors">
          CONFIG ARCHAEOLOGY
        </span>
      </Link>

      <nav className="flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase font-sans tracking-widest transition-all duration-200 relative py-1 ${
                isActive
                  ? "text-[#f5a623] font-semibold"
                  : "text-[#9ca3af] hover:text-[#f5a623]"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#f5a623] transition-transform duration-200 ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
