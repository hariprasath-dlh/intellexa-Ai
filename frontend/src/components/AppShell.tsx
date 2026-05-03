import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  ChevronLeft,
  Plus,
  Hexagon,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workspace", label: "Workspace", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex text-foreground">
      <motion.aside
        animate={{ width: open ? 280 : 76 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="glass-strong sticky top-0 h-screen flex flex-col z-20 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-gradient-primary opacity-60 rounded-lg" />
            <div className="relative h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
              <Hexagon className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col leading-tight"
              >
                <span className="font-display font-semibold text-[15px]">Intellexa</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Research OS
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto h-7 w-7 rounded-md grid place-items-center hover:bg-white/5 transition-colors text-muted-foreground"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active =
              location.pathname === n.to ||
              (n.to === "/workspace" && location.pathname.startsWith("/workspace"));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex items-center gap-3 px-3 h-10 rounded-lg transition-colors ${active ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"}`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-gradient-primary"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {n.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="px-3">
          <Link
            to="/research"
            className="flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            {open && <span>New Research</span>}
          </Link>
        </div>
      </motion.aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="h-16 px-6 flex items-center gap-4 border-b border-white/5 glass sticky top-0 z-10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span>All systems operational</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 h-7 rounded-md border border-white/10 text-[10px] text-muted-foreground bg-white/[0.03]">
          ⌘K <span className="opacity-60">Quick search</span>
        </kbd>
        <button className="h-9 px-4 text-xs rounded-lg border border-white/10 hover:bg-white/5 transition">
          Invite team
        </button>
      </div>
    </header>
  );
}
