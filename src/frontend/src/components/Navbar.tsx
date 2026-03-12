import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function Navbar() {
  const location = useLocation();
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  const navLinks = [
    {
      to: "/",
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      ocid: "nav.home_link",
    },
    {
      to: "/report",
      label: "Report Issue",
      icon: <MessageSquare className="w-4 h-4" />,
      ocid: "nav.report_link",
    },
    {
      to: "/dashboard",
      label: "My Grievances",
      icon: <LayoutDashboard className="w-4 h-4" />,
      ocid: "nav.dashboard_link",
    },
    ...(isAdmin
      ? [
          {
            to: "/admin",
            label: "Admin Panel",
            icon: <Shield className="w-4 h-4" />,
            ocid: "nav.admin_link",
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.home_link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Grie<span className="text-primary">von</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                {shortPrincipal}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  clear();
                  setMobileOpen(false);
                }}
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  login();
                  setMobileOpen(false);
                }}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                {isLoggingIn ? "Connecting..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
