"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/practice", label: "Practice by Type" },
  { href: "/dashboard", label: "Progression Dashboard" },
  { href: "/bookmarks", label: "Bookmark" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Primary navigation">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === "/practice" && pathname.startsWith("/tests"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
