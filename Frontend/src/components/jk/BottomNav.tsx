import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "./Icon";

const items = [
  { to: "/home", icon: "home", label: "Beranda" },
  { to: "/upload", icon: "cloud_upload", label: "Upload" },
  { to: "/my-reports", icon: "description", label: "Laporan Saya" },
  { to: "/reports", icon: "analytics", label: "Semua" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex justify-around items-center px-2 bg-surface-container-lowest h-16 border-t border-border-subtle pb-safe">
      {items.map((it) => {
        const active = pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`flex flex-col items-center justify-center h-full px-2 transition-all active:scale-95 ${
              active ? "text-primary border-t-2 border-primary" : "text-on-surface-variant"
            }`}
          >
            <Icon name={it.icon} filled={active} />
            <span className="font-label-sm text-label-sm">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
