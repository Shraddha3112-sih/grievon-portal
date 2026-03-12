import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerRole } from "../hooks/useQueries";

interface Props {
  children: ReactNode;
}

export function FirstTimeSetupGuard({ children }: Props) {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading } = useCallerRole();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (!identity) return;
    if (isLoading) return;
    if (currentPath === "/setup") return;
    if (role === UserRole.guest) {
      navigate({ to: "/setup" });
    }
  }, [identity, isLoading, role, currentPath, navigate]);

  return <>{children}</>;
}
