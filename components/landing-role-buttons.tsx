"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { WorkspaceLoadingScreen, type WorkspaceRole } from "@/components/workspace-loading-screen";

export function LandingRoleButtons() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<WorkspaceRole | null>(null);

  useEffect(() => {
    if (!loadingRole) return;
    const timer = window.setTimeout(() => router.push(`/workspace?role=${loadingRole}`), 1750);
    return () => window.clearTimeout(timer);
  }, [loadingRole, router]);

  return (
    <>
      <div className="landing-role-buttons" aria-label="Choose your space">
        <LiquidButton type="button" size="lg" className="workspace-glass-button workspace-glass-user" disabled={loadingRole !== null} aria-busy={loadingRole === "user"} onClick={() => setLoadingRole("user")}>
          User <span aria-hidden="true">↗</span>
        </LiquidButton>
        <LiquidButton type="button" size="lg" className="workspace-glass-button workspace-glass-organizer" disabled={loadingRole !== null} aria-busy={loadingRole === "organizer"} onClick={() => setLoadingRole("organizer")}>
          Organizer <span aria-hidden="true">↗</span>
        </LiquidButton>
      </div>
      {loadingRole && <WorkspaceLoadingScreen role={loadingRole} />}
    </>
  );
}
