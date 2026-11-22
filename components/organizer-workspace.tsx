"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRinging,
  CalendarBlank,
  CaretRight,
  Check,
  CheckCircle,
  Clock,
  Coffee,
  FileCsv,
  Gauge,
  GearSix,
  Info,
  List,
  PencilSimple,
  MapPin,
  MapTrifold,
  CalendarDots,
  Question,
  QrCode,
  ShieldCheck,
  ShareNetwork,
  Ticket,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import { VoyageMark } from "@/components/voyage-mark";
import { Dock, DockItem } from "@/components/ui/dock";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { GooeyFab } from "@/components/godui/gooey-fab";
import { ElasticText } from "@/components/godui/elastic-text";
import { NumberTicker } from "@/components/godui/number-ticker";
import { LiquidGlassCard } from "@/components/godui/liquid-glass-card";
import { GradientBackground } from "@/components/godui/gradient-background";

type OrganizerSection = "overview" | "venue" | "schedule" | "invitations" | "guests" | "arrival";

const navigation: { id: OrganizerSection; label: string; icon: typeof MapTrifold }[] = [
  { id: "overview", label: "Overview", icon: CalendarBlank },
  { id: "venue", label: "Venue plan", icon: MapTrifold },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "invitations", label: "Invitations", icon: Ticket },
  { id: "guests", label: "Guest list", icon: UsersThree },
  { id: "arrival", label: "Entry & safety", icon: QrCode },
];

const schedule = [
  { time: "10:00", title: "Doors open", note: "Guest arrival · north entrance", type: "Arrival" },
  { time: "10:30", title: "Welcome & introductions", note: "Main courtyard", type: "Gathering" },
  { time: "11:15", title: "Shared table", note: "Refreshments served", type: "Refreshments" },
  { time: "12:00", title: "Open courtyard", note: "Conversation & activities", type: "Activities" },
];

function SampleTag({ children }: { children: ReactNode }) {
  return <span className="organizer-sample-tag">{children}</span>;
}

function VenueDiagram() {
  return (
    <div className="organizer-venue-plan organizer-venue-plan-large" aria-label="Sample courtyard venue diagram">
      <div className="organizer-map-topline"><span>COURTYARD / NORTH ENTRY</span><span>PLAN 01</span></div>
      <div className="organizer-map-layout">
        <div className="organizer-map-zone organizer-map-entry"><span>ENTRY</span><ArrowDownRight size={19} /></div>
        <div className="organizer-map-zone organizer-map-table"><span>SHARED TABLE</span><i /><i /><i /><i /></div>
        <div className="organizer-map-zone organizer-map-stage"><span>WELCOME</span></div>
        <div className="organizer-map-zone organizer-map-refreshments"><Coffee size={15} /><span>REFRESHMENTS</span></div>
        <span className="organizer-map-path" />
      </div>
      <div className="organizer-map-legend"><span><i className="map-dot-entry" /> Entry</span><span><i className="map-dot-route" /> Guest route</span><span><i className="map-dot-service" /> Service point</span></div>
    </div>
  );
}

const initialActions = [
  { id: "venue", category: "VENUE PLAN", icon: MapTrifold, title: "Add the venue layout", description: "Mark the entrance, guest flow, and service points.", section: "venue", due: "This week", done: false },
  { id: "schedule", category: "SCHEDULE", icon: Clock, title: "Review the event schedule", description: "Shape the key moments and leave room between them.", section: "schedule", due: "This week", done: false },
  { id: "invite", category: "INVITATIONS", icon: Ticket, title: "Prepare the guest invitation", description: "Give guests the event details and a way to RSVP.", section: "invitations", due: "When ready", done: true },
];

const activityEntries = [
  { id: "invitation", category: "Registration", icon: CheckCircle, status: "pending", title: "Invitation draft started", detail: "Organizer preview", time: "Today", clock: "9:42 AM", dateTime: "2026-11-14T09:42:00" },
  { id: "guests", category: "Guests", icon: UsersThree, status: "complete", title: "Guest list added", detail: "82 confirmed", time: "Yesterday", clock: "4:18 PM", dateTime: "2026-11-13T16:18:00" },
  { id: "venue", category: "Planning", icon: MapTrifold, status: "complete", title: "Venue plan outlined", detail: "Old Mill Courtyard", time: "12 Nov", clock: "11:06 AM", dateTime: "2026-11-12T11:06:00" },
  { id: "schedule", category: "Planning", icon: Clock, status: "complete", title: "Run of day drafted", detail: "4 schedule moments", time: "11 Nov", clock: "2:30 PM", dateTime: "2026-11-11T14:30:00" },
];
const activityTabs = ["All", "Planning", "Guests", "Registration"] as const;

function OverviewFollowThrough({ onNavigate }: { onNavigate: (section: OrganizerSection) => void }) {
  const reduceMotion = useReducedMotion();
  const [actions, setActions] = useState(initialActions);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [activityTab, setActivityTab] = useState<(typeof activityTabs)[number]>("All");
  const [activityDetails, setActivityDetails] = useState<string | null>(null);
  const remaining = actions.filter((action) => !action.done).length;
  const visibleActivity = activityTab === "All" ? activityEntries : activityEntries.filter((entry) => entry.category === activityTab);

  const finishEdit = (id: string, save: boolean) => {
    if (save && editDraft.trim()) {
      setActions((current) => current.map((item) => item.id === id ? { ...item, title: editDraft.trim() } : item));
    }
    setEditing(null);
  };

  return (
    <div className="organizer-overview-follow-through">
      <section className="organizer-follow-card" aria-labelledby="organizer-next-actions-title">
        <div className="organizer-follow-card-head">
          <div><h3 id="organizer-next-actions-title">Next actions</h3></div>
          <span className="organizer-checklist-summary" aria-label={`${actions.length - remaining} of ${actions.length} tasks complete`}>
            <strong>{String(actions.length - remaining).padStart(2, "0")}</strong><span>of {String(actions.length).padStart(2, "0")} complete</span>
          </span>
        </div>
        <div className="organizer-action-list">
          {actions.map((action) => (
            <div className={`organizer-action-row${action.done ? " is-done" : ""}`} key={action.id}>
              <button className="organizer-action-check" type="button" aria-label={action.done ? `Mark ${action.title} incomplete` : `Complete ${action.title}`} onClick={() => setActions((current) => current.map((item) => item.id === action.id ? { ...item, done: !item.done } : item))}>
                {action.done && <Check size={13} weight="bold" />}
              </button>
              <span className="organizer-action-icon"><action.icon size={16} weight="bold" /></span>
              <span className="organizer-action-copy">{editing === action.id ? (
                <input autoFocus aria-label="Edit action" value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onBlur={() => finishEdit(action.id, true)} onKeyDown={(event) => { if (event.key === "Enter") finishEdit(action.id, true); if (event.key === "Escape") finishEdit(action.id, false); }} />
              ) : (
                <button className="organizer-action-title" type="button" onClick={() => onNavigate(action.section as OrganizerSection)}>{action.title}</button>
              )}</span>
              <button className="organizer-action-edit" type="button" aria-label={`Edit ${action.title}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { if (editing === action.id) finishEdit(action.id, true); else { setEditDraft(action.title); setEditing(action.id); } }}><PencilSimple size={14} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="organizer-follow-card organizer-activity-card" aria-labelledby="organizer-recent-activity-title">
        <div className="organizer-follow-card-head">
          <div><h3 id="organizer-recent-activity-title">Recent activity</h3></div>
          <span className="organizer-activity-count"><i><BellRinging size={13} /></i><strong>{String(visibleActivity.length).padStart(2, "0")}</strong><small>UPDATES</small></span>
        </div>
        <div className="organizer-activity-layout">
          <div className="organizer-activity-feed">
            <div className="organizer-log-tabs" role="tablist" aria-label="Filter event activity">
              {activityTabs.map((tab) => {
                return <button key={tab} className={`organizer-log-tab${activityTab === tab ? " is-selected" : ""}`} id={`activity-tab-${tab.toLowerCase()}`} type="button" role="tab" aria-selected={activityTab === tab} aria-controls="organizer-activity-panel" tabIndex={activityTab === tab ? 0 : -1} onClick={() => setActivityTab(tab)}>
                  <span className="organizer-log-tab-content"><span className="organizer-log-tab-label">{tab}</span></span>
                </button>;
              })}
            </div>
            <div className="organizer-activity-list" id="organizer-activity-panel" role="tabpanel" aria-labelledby={`activity-tab-${activityTab.toLowerCase()}`}>
              <AnimatePresence initial={false}>
              {visibleActivity.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { opacity: { duration: .14, ease: "easeOut" } }}
                  className={`organizer-activity-row organizer-activity-${entry.category.toLowerCase()} organizer-activity-${entry.status}${entry.id === "invitation" ? " is-latest" : ""}${activityDetails === entry.id ? " is-expanded" : ""}`}
                >
                  <span className="organizer-activity-icon"><entry.icon size={19} weight="bold" /></span>
                  <span className="organizer-activity-copy"><span className="organizer-activity-titleline"><strong>{entry.title}</strong>{entry.id === "invitation" && <em>NEW</em>}</span><small><span className="organizer-activity-state"><i aria-hidden="true">{entry.status === "complete" ? <Check size={11} weight="bold" /> : <b />}</i>{entry.status === "complete" ? "Completed" : "In progress"}</span><i className="organizer-activity-meta-separator" /><time dateTime={entry.dateTime}>{entry.time} · {entry.clock}</time></small></span>
                  <button type="button" className="organizer-activity-info" aria-label={`${activityDetails === entry.id ? "Hide" : "Show"} details for ${entry.title}`} aria-expanded={activityDetails === entry.id} aria-controls={`activity-details-${entry.id}`} onClick={() => setActivityDetails((current) => current === entry.id ? null : entry.id)}><Info size={17} weight="bold" /></button>
                  <AnimatePresence initial={false}>
                    {activityDetails === entry.id && (
                      <motion.div
                        id={`activity-details-${entry.id}`}
                        className="organizer-activity-detail-motion"
                        role="region"
                        aria-label={`Details for ${entry.title}`}
                        initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { height: { duration: .2, ease: [.2, .8, .2, 1] }, opacity: { duration: .14, ease: "easeOut" } }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="organizer-activity-detail-card">
                          <div className="organizer-activity-detail-head"><span className="organizer-activity-detail-icon"><entry.icon size={18} weight="bold" /></span><span><small>ACTIVITY DETAILS</small><strong>{entry.title}</strong></span><span className={`organizer-activity-detail-status ${entry.status}`}><i>{entry.status === "complete" ? <Check size={11} weight="bold" /> : <b />}</i>{entry.status === "complete" ? "Completed" : "In progress"}</span></div>
                          <div className="organizer-activity-detail-grid"><div><small>Category</small><strong>{entry.category}</strong></div><div><small>Recorded</small><strong>{entry.time} · {entry.clock}</strong></div><div className="organizer-activity-detail-note"><small>Details</small><strong>{entry.detail}</strong></div></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="organizer-follow-hint">Sample log · records will appear here as work happens</p>
      </section>
    </div>
  );
}

function OverviewMetricCard({
  className,
  label,
  value,
  unit,
  icon: MetricIcon,
  detail,
  progress,
}: {
  className: string;
  label: string;
  value: number;
  unit: string;
  icon: typeof UsersThree;
  detail: ReactNode;
  progress?: number;
}) {
  return (
    <LiquidGlassCard
      className={`organizer-stat-card ${className}`}
      radius={18}
      blur={0}
      strength={0}
      dispersion={0}
      saturation={1}
      sheen={0}
      refraction={false}
      tint="rgba(22,22,26,1)"
    >
      <div className="organizer-stat-content">
        <div className="organizer-stat-heading">
          <span className="organizer-stat-visual" aria-hidden="true"><MetricIcon size={18} weight="bold" /></span>
          <span className="organizer-stat-label">{label}</span>
        </div>
        <strong className="organizer-stat-value">
          <span className="organizer-stat-value-group">
            <NumberTicker value={value} className="organizer-number-ticker" />
            <small>{unit}</small>
          </span>
        </strong>
        <div className="organizer-stat-foot">
          <div className="organizer-stat-support"><em>{detail}</em>{progress !== undefined && <small>{progress}%</small>}</div>
          {progress !== undefined && <div className="organizer-stat-mini-track"><i style={{ width: `${progress}%` }} /></div>}
        </div>
      </div>
    </LiquidGlassCard>
  );
}

function EventOverview({ onNavigate }: { onNavigate: (section: OrganizerSection) => void }) {
  const [artworkTone, setArtworkTone] = useState<"light" | "dark">("dark");

  return (
    <>
      <LiquidGlassCard className="organizer-glass-card organizer-event-overview organizer-overview-hero" radius={22} blur={24} strength={0} dispersion={0} saturation={1.4} sheen={0} refraction={false} tint="rgba(255,255,255,.06)">
        <div className="organizer-overview-event-content">
          <figure className="organizer-event-scene organizer-overview-event-scene" data-tone={artworkTone}>
            <img src="/images/courtyard-gathering.svg" alt="Illustration of a candlelit courtyard gathering with long tables and hanging lights" onLoad={(event) => setArtworkTone(detectArtworkTone(event.currentTarget))} />
            <figcaption><span>COMMUNITY GATHERING</span><strong>The Courtyard Gathering</strong><small>18 APR · BENGALURU</small></figcaption>
          </figure>
        </div>
        <div className="organizer-event-overview-side"><span>Setup progress</span><strong className="organizer-readiness-value"><NumberTicker value={3} className="organizer-number-ticker organizer-number-ticker-compact" /><small>of 8</small></strong><div className="organizer-readiness-track"><i /></div><small>3 of 8 planning steps started</small></div>
      </LiquidGlassCard>

      <div className="organizer-preview-stats" aria-label="Sample event figures">
        <OverviewMetricCard className="organizer-guests-card" label="Guests" value={128} unit="people" icon={UsersThree} detail={<><Check size={13} weight="bold" /> 82 confirmed</>} progress={64} />
        <OverviewMetricCard className="organizer-capacity-card" label="Capacity" value={160} unit="guests" icon={Gauge} detail="32 places remaining" progress={80} />
        <OverviewMetricCard className="organizer-countdown-card" label="Event in" value={24} unit="days" icon={CalendarDots} detail="Planning in progress" />
      </div>

      <OverviewFollowThrough onNavigate={onNavigate} />
    </>
  );
}

function detectArtworkTone(image: HTMLImageElement): "light" | "dark" {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return "dark";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let luminance = 0;
    let samples = 0;
    for (let y = 19; y < 32; y += 1) {
      for (let x = 2; x < 30; x += 1) {
        const offset = (y * canvas.width + x) * 4;
        const alpha = data[offset + 3] / 255;
        const red = data[offset] * alpha + 9 * (1 - alpha);
        const green = data[offset + 1] * alpha + 10 * (1 - alpha);
        const blue = data[offset + 2] * alpha + 15 * (1 - alpha);
        luminance += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        samples += 1;
      }
    }
    return samples && luminance / samples >= 142 ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function VenueView() {
  return <><div className="organizer-view-grid"><article className="organizer-preview-panel organizer-map-expanded"><div className="organizer-panel-heading"><div><span>THE OLD MILL COURTYARD</span><h3>Guest flow · north entrance</h3></div><SampleTag>PLAN 01</SampleTag></div><VenueDiagram /><div className="organizer-panel-footer"><span>Concept diagram · not to scale</span><span>PHOTO TO VECTOR PLAN</span></div></article><aside className="organizer-preview-panel organizer-detail-list"><div className="organizer-panel-heading"><div><span>PLAN NOTES</span><h3>Key areas</h3></div></div><div><span className="organizer-detail-symbol"><MapPin size={16} /></span><span><strong>North entrance</strong><small>Arrival & pass check</small></span></div><div><span className="organizer-detail-symbol"><UsersThree size={16} /></span><span><strong>Shared table</strong><small>Central gathering point</small></span></div><div><span className="organizer-detail-symbol"><Coffee size={16} /></span><span><strong>Refreshment point</strong><small>Near the courtyard exit</small></span></div><div><span className="organizer-detail-symbol"><ShieldCheck size={16} /></span><span><strong>Staff position</strong><small>Clear view of the entry</small></span></div></aside></div><LiquidButton className="organizer-view-action" size="lg" disabled>Edit venue plan <ArrowRight size={16} /></LiquidButton></>;
}

function ScheduleView() {
  return <><article className="organizer-preview-panel organizer-schedule-expanded"><div className="organizer-panel-heading"><div><span>COURTYARD GATHERING</span><h3>Run of day</h3></div><SampleTag>4 SAMPLE MOMENTS</SampleTag></div><div className="organizer-schedule-list organizer-schedule-list-large">{schedule.map((item, index) => <div className="organizer-schedule-row" key={item.time}><time>{item.time}</time><span className="organizer-schedule-marker"><i />{index < schedule.length - 1 && <b />}</span><span><strong>{item.title}</strong><small>{item.note}</small></span><SampleTag>{item.type}</SampleTag></div>)}</div><div className="organizer-panel-footer"><span><Clock size={14} /> Times can be shaped around the event</span><span>LOCAL TIME · IST</span></div></article><div className="organizer-note-row"><Clock size={17} /><span><strong>Allow a little room between moments.</strong><small>Arrival, refreshments, and moving between areas all take time.</small></span></div><LiquidButton className="organizer-view-action" size="lg" disabled>Edit schedule <ArrowRight size={16} /></LiquidButton></>;
}

function InvitationView() {
  return <><div className="organizer-view-grid organizer-invitation-grid"><article className="organizer-invite-mock"><div className="organizer-invite-mock-top"><VoyageMark className="organizer-invite-mark" /><span>AN INVITATION TO GATHER</span></div><div className="organizer-invite-mock-body"><p>THE OLD MILL COURTYARD · BENGALURU</p><h2>The Courtyard<br />Gathering</h2><p>A relaxed afternoon for neighbours, good food, and getting to know one another.</p><div><CalendarBlank size={16} /> Saturday, 18 April 2026 · 10:00 am</div><button type="button" disabled>Save your place <ArrowRight size={15} /></button></div><div className="organizer-invite-mock-foot">A SAMPLE EVENT PAGE</div></article><article className="organizer-preview-panel organizer-registration-panel"><div className="organizer-panel-heading"><div><span>REGISTRATION OPTIONS</span><h3>Different guests, one list</h3></div></div><div className="organizer-guest-types"><div><span className="organizer-guest-type-icon"><UserCircle size={17} /></span><span><strong>Individual</strong><small>One guest per RSVP</small></span><ArrowRight size={14} /></div><div><span className="organizer-guest-type-icon"><UsersThree size={17} /></span><span><strong>Family or group</strong><small>Several guests together</small></span><ArrowRight size={14} /></div><div><span className="organizer-guest-type-icon organizer-student-icon">S</span><span><strong>Student</strong><small>Student-friendly sign-up</small></span><ArrowRight size={14} /></div></div><div className="organizer-registration-note"><Check size={15} /><span>Each guest receives their own QR pass.</span></div></article></div><LiquidButton className="organizer-view-action" size="lg" disabled>Customize invitation <ArrowRight size={16} /></LiquidButton></>;
}

function GuestView() {
  return <><div className="organizer-preview-stats organizer-guest-stats"><div><span>REGISTERED</span><strong className="organizer-stat-value"><NumberTicker value={128} className="organizer-number-ticker" /><small>guests</small></strong><em>Across all registration types</em></div><div><span>CONFIRMED</span><strong className="organizer-stat-value"><NumberTicker value={82} className="organizer-number-ticker" /><small>guests</small></strong><em>RSVP received</em></div><div><span>WAITING ON RSVP</span><strong className="organizer-stat-value"><NumberTicker value={46} className="organizer-number-ticker" /><small>guests</small></strong><em>Response not received</em></div></div><article className="organizer-preview-panel organizer-guest-table-panel"><div className="organizer-panel-heading"><div><span>GUEST RECORDS</span><h3>Recent registrations</h3></div><SampleTag>SAMPLE RECORDS</SampleTag></div><div className="organizer-guest-table-wrap"><table className="organizer-guest-table"><thead><tr><th>GUEST</th><th>TYPE</th><th>GROUP SIZE</th><th>RSVP</th><th>PASS</th></tr></thead><tbody><tr><td>Guest 001</td><td>Individual</td><td>1</td><td><span className="organizer-rsvp-confirmed">Confirmed</span></td><td>Ready</td></tr><tr><td>Guest 002</td><td>Family</td><td>4</td><td><span className="organizer-rsvp-confirmed">Confirmed</span></td><td>Ready</td></tr><tr><td>Guest 003</td><td>Student</td><td>1</td><td><span className="organizer-rsvp-pending">Awaiting</span></td><td>—</td></tr><tr><td>Guest 004</td><td>Family</td><td>3</td><td><span className="organizer-rsvp-confirmed">Confirmed</span></td><td>Ready</td></tr></tbody></table></div><div className="organizer-panel-footer"><span>Guest information in one place</span><span>SPREADSHEET EXPORT PREVIEW <FileCsv size={14} /></span></div></article><LiquidButton className="organizer-view-action" size="lg" disabled><FileCsv size={16} /> Export guest list</LiquidButton></>;
}

function ArrivalView() {
  return <><div className="organizer-view-grid organizer-arrival-view-grid"><article className="organizer-preview-panel organizer-pass-panel"><div className="organizer-panel-heading"><div><span>ATTENDEE PASS · SAMPLE</span><h3>One pass per guest</h3></div><SampleTag>QR PASS</SampleTag></div><div className="organizer-pass-preview"><div className="organizer-sample-qr organizer-sample-qr-large"><QrCode size={100} weight="fill" /></div><div><p>THE OLD MILL COURTYARD</p><h2>The Courtyard Gathering</h2><span><CalendarBlank size={14} /> 18 APR 2026 · 10:00 AM</span><small>VOYAGE / SAMPLE PASS 0001</small></div></div><div className="organizer-panel-footer"><span>Saved to the attendee’s QR wallet</span><span>INDIVIDUAL PASS</span></div></article><article className="organizer-preview-panel organizer-checkin-panel"><div className="organizer-panel-heading"><div><span>ON THE DAY</span><h3>Check-in desk</h3></div><span className="organizer-arrival-status"><i /> STAFF VIEW</span></div><div className="organizer-checkin-number"><span>ARRIVED</span><strong>— <small>/ 160</small></strong><p>Guest counts update as passes are checked.</p></div><div className="organizer-safety-list"><div><ShieldCheck size={16} /><span><strong>Entry checks</strong><small>Confirm each pass once</small></span></div><div><UsersThree size={16} /><span><strong>Staff positions</strong><small>Coordinate at the entrance</small></span></div><div><Coffee size={16} /><span><strong>Refreshments</strong><small>Share service details with the team</small></span></div></div></article></div><LiquidButton className="organizer-view-action" size="lg" disabled>Preview check-in screen <ArrowRight size={16} /></LiquidButton></>;
}

const sectionContent: Record<Exclude<OrganizerSection, "overview">, () => ReactNode> = {
  venue: VenueView,
  schedule: ScheduleView,
  invitations: InvitationView,
  guests: GuestView,
  arrival: ArrivalView,
};

const sectionTitles: Record<OrganizerSection, string> = {
  overview: "Overview",
  venue: "Venue plan",
  schedule: "Schedule",
  invitations: "Invitations",
  guests: "Guest list",
  arrival: "Entry & safety",
};

export function OrganizerWorkspace() {
  const [activeSection, setActiveSection] = useState<OrganizerSection>("overview");
  const [profileNotice, setProfileNotice] = useState("");
  const [hasSwitchedSection, setHasSwitchedSection] = useState(false);
  const ActiveContent = activeSection === "overview" ? null : sectionContent[activeSection];

  function switchSection(section: OrganizerSection) {
    if (section === activeSection) return;
    setHasSwitchedSection(true);
    setActiveSection(section);
  }

  return (
    <section className="organizer-app organizer-preview" aria-label="Organizer workspace preview">
      <GradientBackground
        className="organizer-atmosphere"
        style={{
          backgroundImage: `radial-gradient(
            ellipse 88% 76% at 50% 38%,
            rgba(147, 51, 234, 0.15) 0%,
            rgba(147, 51, 234, 0.09) 28%,
            rgba(147, 51, 234, 0.035) 52%,
            transparent 78%
          )`,
          backgroundSize: "100% 100%",
          backgroundColor: "#000000",
        }}
      />
      <aside className="organizer-dock-shell">
        <div className="organizer-dock-surface">
          <Link href="/" className="organizer-dock-brand" aria-label="Voyage home"><VoyageMark /></Link>
          <Dock className="organizer-left-dock">
            {navigation.map(({ id, label, icon: Icon }) => <DockItem key={id} label={label} active={activeSection === id} onClick={() => switchSection(id)}><Icon size={19} weight={activeSection === id ? "fill" : "regular"} /></DockItem>)}
          </Dock>
        </div>
        <div className="organizer-dock-profile-wrap">
          <GooeyFab
            className="organizer-profile-fab"
            label="Profile options"
            icon={<UserCircle size={17} weight="regular" />}
            actions={[
              { label: "Edit profile", icon: <UserCircle size={19} />, onSelect: () => setProfileNotice("Profile editing will be available when accounts are connected.") },
              { label: "Share workspace", icon: <ShareNetwork size={19} />, onSelect: () => { void navigator.clipboard?.writeText(window.location.href); setProfileNotice("Workspace link copied."); } },
              { label: "Preferences", icon: <GearSix size={19} />, onSelect: () => setProfileNotice("Workspace preferences are coming later.") },
              { label: "Help", icon: <Question size={19} />, onSelect: () => setProfileNotice("Help and support will be available here.") },
            ]}
          />
        </div>
        <span className="organizer-profile-status" role="status" aria-live="polite">{profileNotice}</span>
      </aside>

      <div className="organizer-main organizer-preview-main">
        <div className={`organizer-preview-content organizer-section-view${activeSection === "overview" ? " organizer-overview-page" : ""}`} key={activeSection}>
          <header className="organizer-titlebar">
            <h1>
              {hasSwitchedSection ? (
                <ElasticText
                  key={activeSection}
                  className="organizer-elastic-title"
                  duration={1.1}
                  loop={false}
                  startOnView={false}
                  forceMotion
                >
                  {sectionTitles[activeSection]}
                </ElasticText>
              ) : (
                <span className="organizer-elastic-title">{sectionTitles[activeSection]}</span>
              )}
            </h1>
          </header>
          {activeSection === "overview" ? <EventOverview onNavigate={switchSection} /> : ActiveContent && <ActiveContent />}
          <footer className="organizer-preview-footer"><span>VOYAGE / ORGANIZER</span></footer>
        </div>
      </div>
    </section>
  );
}



