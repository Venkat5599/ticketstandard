import WorkspaceShell from "@/components/workspace-shell";
import { TicketTitleIntro } from "@/components/ticket-title-intro";

export default function WorkspacePage() {
  return (
    <>
      <TicketTitleIntro label="Opening the studio…" />
      <WorkspaceShell />
    </>
  );
}
