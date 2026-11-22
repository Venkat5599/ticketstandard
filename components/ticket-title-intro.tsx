"use client";

import { useEffect, useState } from "react";
import { TicketLoading } from "@/components/ticket-loading";

export function TicketTitleIntro({ label, waitForCamera = false }: { label: string; waitForCamera?: boolean }) {
  const [phase, setPhase] = useState<"holding" | "leaving" | "done">("holding");

  useEffect(() => {
    let minimumElapsed = false;
    let finish = 0;
    let leaving = false;
    const camera = waitForCamera ? document.querySelector("[data-camera-status]") : null;
    function dismiss() {
      if (leaving) return;
      leaving = true;
      setPhase("leaving");
      finish = window.setTimeout(() => setPhase("done"), 200);
    }
    function check() {
      if (!minimumElapsed) return;
      if (waitForCamera && (document.readyState !== "complete" ||
        !camera || camera.getAttribute("data-camera-status") === "loading")) return;
      dismiss();
    }
    const observer = camera && new MutationObserver(check);
    if (camera && observer) observer.observe(camera, { attributes: true, attributeFilter: ["data-camera-status"] });
    window.addEventListener("load", check);
    const hold = window.setTimeout(() => { minimumElapsed = true; check(); }, 1000);
    const timeout = waitForCamera ? window.setTimeout(dismiss, 6500) : 0;
    return () => {
      observer?.disconnect();
      window.removeEventListener("load", check);
      window.clearTimeout(hold);
      window.clearTimeout(timeout);
      window.clearTimeout(finish);
    };
  }, [waitForCamera]);

  if (phase === "done") return null;

  return (
    <div className="ticket-title-intro" data-phase={phase}>
      <TicketLoading label={label} />
    </div>
  );
}
