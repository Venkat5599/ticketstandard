"use client";
import { useCallback, useMemo, useState } from "react";
import { useEffect, useRef } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowSquareOut, CaretDown, Check,
  CheckCircle, ClipboardText, Command, DownloadSimple, EnvelopeSimple, Export,
  Eye, EyeSlash, GearSix, House, List, MapPin, MagnifyingGlass, Plus, QrCode, Scan,
  ShieldCheck, SquaresFour, Ticket, UploadSimple, Users, ForkKnife,
} from "@phosphor-icons/react";
import { attendees, event, toAttendeeCsv, type Attendee } from "@/lib/events";
import { QrCode as QrVisual } from "@/components/qr-code";
import { VoyageMark } from "@/components/voyage-mark";

type DetectedCode = { rawValue?: string };
type BrowserQrDetector = { detect: (image: HTMLVideoElement) => Promise<DetectedCode[]> };
type BrowserQrDetectorConstructor = new (options: { formats: string[] }) => BrowserQrDetector;

function QrScannerDialog({ onClose, onDetected }: { onClose: () => void; onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Starting camera…");
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    let scanTimer = 0;
    const detectorConstructor = (window as Window & { BarcodeDetector?: BrowserQrDetectorConstructor }).BarcodeDetector;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Camera access is not available here. Enter a pass ID below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (!detectorConstructor) {
          setStatus("Camera is on. Automatic QR reading is not supported in this browser. Enter a pass ID below.");
          return;
        }
        setStatus("Point the camera at an attendee pass.");
        const detector = new detectorConstructor({ formats: ["qr_code"] });
        const scan = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;
            if (value) { onDetected(value); return; }
          } catch {
            setStatus("We could not read that QR code. Hold the pass steady or enter its ID.");
          }
          if (!cancelled) scanTimer = window.setTimeout(() => void scan(), 300);
        };
        void scan();
      } catch {
        setStatus("Camera permission was not granted. Enter the pass ID below to continue.");
      }
    }
    void startCamera();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelled = true;
      window.clearTimeout(scanTimer);
      stream?.getTracks().forEach((track) => track.stop());
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onDetected]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="scanner-dialog" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
        <div className="scanner-heading"><div><h2 id="scanner-title">Scan an entry pass</h2><p>QR data stays in this browser.</p></div><LiquidButton type="button" className="icon-button" aria-label="Close scanner" onClick={onClose}>×</LiquidButton></div>
        <div className="scanner-viewport"><video ref={videoRef} autoPlay playsInline muted aria-label="Camera preview for scanning an event pass" /><div className="scanner-frame" aria-hidden="true" /></div>
        <p className="scanner-status" role="status">{status}</p>
        <form className="manual-pass-form" onSubmit={(event) => { event.preventDefault(); onDetected(manualId); }}><label htmlFor="manual-pass-id">Pass ID</label><div><input autoFocus id="manual-pass-id" value={manualId} onChange={(event) => setManualId(event.target.value)} placeholder="e.g. MW-2841" /><LiquidButton className="button button-red" type="submit" disabled={!manualId.trim()}>Find pass</LiquidButton></div></form>
      </section>
    </div>
  );
}

type PageKey = "Overview" | "Attendees" | "Event page" | "Venue map" | "Operations" | "Exports";
const navItems: { label: PageKey; icon: typeof House }[] = [
  { label: "Overview", icon: House },
  { label: "Attendees", icon: Users },
  { label: "Event page", icon: ArrowSquareOut },
  { label: "Venue map", icon: MapPin },
  { label: "Operations", icon: ShieldCheck },
  { label: "Exports", icon: Export },
];

const navTarget: Record<PageKey, string> = {
  Overview: "#overview", Attendees: "#attendees", "Event page": "#event-page",
  "Venue map": "#venue", Operations: "#operations", Exports: "#attendees",
};

function downloadCsv(rows: Attendee[]) {
  const url = URL.createObjectURL(new Blob([toAttendeeCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "monsoon-sessions-attendees.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function EventWorkspace() {
  const [activePage, setActivePage] = useState<PageKey>("Attendees");
  const [rows, setRows] = useState(attendees);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All guests" | "Checked in" | "Not arrived">("All guests");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState<"ink" | "red">("ink");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const closeScanner = useCallback(() => setScannerOpen(false), []);
  const [venuePhoto, setVenuePhoto] = useState<string | null>(null);
  const [venuePhotoVisible, setVenuePhotoVisible] = useState(true);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const text = `${row.id} ${row.name} ${row.email} ${row.ticket} ${row.group}`.toLowerCase();
    const searchMatch = text.includes(query.toLowerCase());
    const filterMatch = filter === "All guests" || (filter === "Checked in" ? row.status === "Checked in" : row.status === "Registered");
    return searchMatch && filterMatch;
  }), [filter, query, rows]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const checkedInInView = rows.filter((row) => row.status === "Checked in").length;
  const checkedInTotal = event.checkedIn + checkedInInView - attendees.filter((row) => row.status === "Checked in").length;

  useEffect(() => () => { if (venuePhoto) URL.revokeObjectURL(venuePhoto); }, [venuePhoto]);
  useEffect(() => {
    if (!mobileNavOpen) return;
    const closeOnEscape = (keyEvent: KeyboardEvent) => { if (keyEvent.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  function checkIn(id: string) {
    const person = rows.find((row) => row.id === id);
    if (!person) return;
    if (person.status === "Checked in") {
      setNotice(`${person.name} is already checked in.`);
      return;
    }
    setRows((current) => current.map((row) => row.id === id ? { ...row, status: "Checked in" } : row));
    setNotice(`${person.name} checked in. Pass ${person.id} is valid.`);
  }

  function copyEventLink() {
    void navigator.clipboard?.writeText("https://voyage.events/e/monsoon-sessions").then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  function downloadPassQr() {
    const svg = document.getElementById("guest-qr");
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected?.id ?? "MW-2841"}-entry-pass.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("QR pass downloaded as an SVG file.");
  }

  const handleDetectedPass = useCallback((rawValue: string) => {
    const match = rawValue.trim().match(/(?:\/p\/)?(MW-\d{4})\/?$/i);
    const person = rows.find((row) => row.id.toLowerCase() === match?.[1]?.toLowerCase());
    setScannerOpen(false);
    if (!person) {
      setNotice("Pass not found. Check the event and try another QR code or pass ID.");
      return;
    }
    checkIn(person.id);
  }, [rows]);

  return (
    <div className="workspace" id="overview">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`} aria-label="Event workspace navigation">
        <a href="#top" className="brand-mark" aria-label="Voyage home"><VoyageMark className="brand-symbol" /><span>voyage</span></a>
        <div className="workspace-switcher">
          <span className="organizer-mark" aria-hidden="true">M</span>
          <span className="switcher-copy"><strong>Monsoon Studio</strong><small>Organizer workspace</small></span>
          <CaretDown size={15} weight="bold" aria-hidden="true" />
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="side-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <a key={label} href={navTarget[label]} onClick={() => { setActivePage(label); setMobileNavOpen(false); }} aria-current={activePage === label ? "page" : undefined} className={activePage === label ? "side-link active" : "side-link"}>
              <Icon size={18} weight={activePage === label ? "fill" : "regular"} aria-hidden="true" />
              <span>{label}</span>
              {label === "Attendees" && <span className="nav-count">186</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-event">
          <div className="sidebar-event-image">
            <img src="/images/gateway-kalupur-swaminarayan-temple-ahmedabad-1866.jpg" alt="Archival view of a carved stone gateway in Ahmedabad" />
          </div>
          <span>Next event</span>
          <strong>Monsoon Sessions</strong>
          <small>14 November · Ahmedabad</small>
        </div>
        <LiquidButton type="button" className="profile-button" onClick={() => setNotice("Organizer profile settings are ready to connect.")}>
          <span className="profile-avatar">AS</span>
          <span><strong>Aarav Shah</strong><small>Event organizer</small></span>
          <GearSix size={18} aria-hidden="true" />
        </LiquidButton>
      </aside>
      {mobileNavOpen && <LiquidButton className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <div className="workspace-main">
        <header className="workspace-topbar" id="top">
          <LiquidButton className="mobile-menu" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
            <List size={21} aria-hidden="true" />
          </LiquidButton>
          <div className="breadcrumb"><span>Events</span><ArrowRight size={14} aria-hidden="true" /><strong>{event.name}</strong></div>
          <div className="topbar-actions">
            <LiquidButton className="icon-button" aria-label="Workspace settings" type="button" onClick={() => setNotice("Workspace settings are ready to connect.")}><GearSix size={19} /></LiquidButton>
            <LiquidButton type="button" className="button button-dark button-small" onClick={copyEventLink}><ArrowSquareOut size={15} aria-hidden="true" /> {copied ? "Link copied" : "View event page"}</LiquidButton>
          </div>
        </header>

        <main className="workspace-content">
          <section className="event-header" aria-labelledby="event-heading">
            <div>
            <div className="event-title-row">
                <h1 id="event-heading" className="pass-mark-reveal">{event.name}</h1>
                <span className="event-live"><span className="live-indicator" /> Published</span>
              </div>
              <p className="event-meta"><span><MapPin size={15} aria-hidden="true" /> {event.venue}</span><span className="meta-divider" /><span>{event.date}</span></p>
            </div>
            <LiquidButton type="button" className="button button-outline" onClick={() => setNotice("Event editing is ready to connect.")}><GearSix size={16} aria-hidden="true" /> Edit event</LiquidButton>
          </section>

          {notice && (
            <div className="notice" role="status">
              <CheckCircle size={19} weight="fill" aria-hidden="true" /><span>{notice}</span>
              <LiquidButton type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>Dismiss</LiquidButton>
            </div>
          )}

          <section className="metric-strip" aria-label="Event registration summary">
            <div className="metric-item" data-reveal><div className="metric-value-line"><strong>{event.registrations}<small> / {event.capacity}</small></strong><span>registered</span></div><span className="metric-note"><Users size={14} aria-hidden="true" /> {event.guestCount} guests, including groups</span></div>
            <div className="metric-item" data-reveal><div className="metric-value-line"><strong>{checkedInTotal}<small> guests</small></strong><span>checked in</span></div><span className="metric-note"><CheckCircle size={14} aria-hidden="true" /> At the door</span></div>
            <div className="metric-item" data-reveal><div className="metric-value-line"><strong>{event.capacity - event.registrations}<small> places</small></strong><span>available</span></div><span className="metric-note">Registration is open</span></div>
            <div className="metric-item metric-event-time" data-reveal><div className="metric-value-line"><strong className="time-value">10:00 <small>am</small></strong><span>local time</span></div><span className="metric-note">Saturday · IST</span></div>
          </section>

          <section className="attendee-section" id="attendees" aria-labelledby="attendee-heading" data-reveal>
            <div className="section-heading-row" data-reveal>
              <div><h2 id="attendee-heading">Attendee list</h2><p>Search passes and mark arrivals at the door.</p></div>
              <div className="section-actions">
                <LiquidButton className="button button-outline scan-button" type="button" onClick={() => setScannerOpen(true)}><Scan size={16} aria-hidden="true" /> Scan pass</LiquidButton>
                <LiquidButton className="button button-outline export-button" type="button" onClick={() => downloadCsv(visibleRows)}><DownloadSimple size={16} aria-hidden="true" /> Export CSV</LiquidButton>
                <LiquidButton className="button button-red" type="button" onClick={() => setNotice("Registration link copied: voyage.events/e/monsoon-sessions")}><Plus size={17} weight="bold" aria-hidden="true" /> Invite guests</LiquidButton>
              </div>
            </div>
            <div className="list-toolbar" data-reveal>
              <div className="guest-tabs" role="group" aria-label="Filter attendees">
                {(["All guests", "Checked in", "Not arrived"] as const).map((item) => (
                  <LiquidButton key={item} type="button" className={filter === item ? "guest-tab selected" : "guest-tab"} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}<span>{item === "All guests" ? rows.length : item === "Checked in" ? checkedInInView : rows.length - checkedInInView}</span></LiquidButton>
                ))}
              </div>
              <label className="search-box"><MagnifyingGlass size={18} aria-hidden="true" /><span className="visually-hidden">Search attendees</span><input value={query} onChange={(eventInput) => setQuery(eventInput.target.value)} placeholder="Name, email, or pass ID" /><kbd><Command size={12} aria-hidden="true" /> K</kbd></label>
            </div>
            <div className="table-scroll" role="region" aria-label="Attendee registration list" tabIndex={0}>
              <table className="attendee-table">
                <thead><tr><th scope="col"><input aria-label="Select all visible attendees" type="checkbox" onChange={(e) => setSelectedId(e.currentTarget.checked && visibleRows[0] ? visibleRows[0].id : null)} /></th><th scope="col">Guest</th><th scope="col">Ticket</th><th scope="col">Registered</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {visibleRows.map((person, index) => (
                    <tr key={person.id} className={selectedId === person.id ? "row-selected" : ""}>
                      <td><input aria-label={`Select ${person.name}`} type="checkbox" checked={selectedId === person.id} onChange={() => setSelectedId(selectedId === person.id ? null : person.id)} /></td>
                      <td><div className="guest-cell"><span className={`guest-avatar avatar-${index % 5}`}>{person.name.split(" ").map((part) => part[0]).join("")}</span><span className="guest-copy"><strong>{person.name}</strong><small>{person.email}</small><small className="mobile-ticket">{person.ticket} · {person.group}</small></span></div></td>
                      <td><div className="ticket-cell"><strong>{person.ticket}</strong><small>{person.group}</small></div></td>
                      <td className="date-cell">{person.registered}</td>
                      <td><span className={`status-pill ${person.status === "Checked in" ? "status-arrived" : "status-pending"}`}><span className="status-dot" />{person.status}</span></td>
                      <td><LiquidButton type="button" className={person.status === "Checked in" ? "checkin-button checked-button" : "checkin-button"} onClick={() => person.status === "Checked in" ? setSelectedId(person.id) : checkIn(person.id)} aria-label={person.status === "Checked in" ? `View pass for ${person.name}` : `Check in ${person.name}`}>
                        {person.status === "Checked in" ? <QrCode size={17} aria-hidden="true" /> : <><Check size={16} weight="bold" aria-hidden="true" /><span>Check in</span></>}
                      </LiquidButton></td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 && <tr><td colSpan={6} className="empty-row"><MagnifyingGlass size={22} /><strong>No matching guests</strong><span>Try a different name, email, pass ID, or status filter.</span><LiquidButton type="button" onClick={() => { setQuery(""); setFilter("All guests"); }}>Clear search</LiquidButton></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{visibleRows.length}</strong> of <strong>{rows.length}</strong> sample passes</span><div className="pagination"><LiquidButton aria-label="Previous page" type="button" disabled><ArrowLeft size={16} /></LiquidButton><span>1 of 24</span><LiquidButton aria-label="Next page" type="button" onClick={() => setNotice("All sample passes on this page are shown.")}><ArrowRight size={16} /></LiquidButton></div></div>
          </section>

          <div className="support-grid">
            <section className="venue-panel" id="venue" aria-labelledby="venue-heading" data-reveal>
              <div className="panel-heading"><div><h2 id="venue-heading">The venue, mapped</h2><p>Give every guest a clear way in.</p></div><div className="map-tools"><label className="map-tool-button" title="Load a venue photo under the diagram"><UploadSimple size={16} aria-hidden="true" /><span>Add photo</span><input type="file" accept="image/*" aria-label="Add a venue photo to trace" onChange={(fileEvent) => { const file = fileEvent.currentTarget.files?.[0]; if (file) { setVenuePhoto(URL.createObjectURL(file)); setVenuePhotoVisible(true); setNotice("Venue photo loaded in this browser. Use it as a reference while positioning the diagram."); } }} /></label>{venuePhoto && <LiquidButton className="map-tool-button" type="button" onClick={() => setVenuePhotoVisible((visible) => !visible)}>{venuePhotoVisible ? <EyeSlash size={16} /> : <Eye size={16} />}<span>{venuePhotoVisible ? "Hide photo" : "Show photo"}</span></LiquidButton>}</div></div>
              <div className="venue-map" role="img" aria-label="Sample venue diagram showing entrance, registration, hall and refreshments" data-reveal>
                <div className="venue-map-top"><span><MapPin size={13} /> L. D. Institute of Indology</span><span>Guest route</span></div>
                <div className={`venue-structure ${venuePhoto && venuePhotoVisible ? "venue-photo-mode" : ""}`} style={venuePhoto && venuePhotoVisible ? { backgroundImage: `url("${venuePhoto}")` } : undefined}>
                  <div className="map-garden garden-top" /><div className="map-garden garden-bottom" />
                  <div className="map-zone map-entry"><ArrowDown size={16} /><strong>Entry</strong><span>Gate A</span></div>
                  <div className="map-zone map-check"><QrCode size={17} /><strong>Check-in</strong><span>Welcome desk</span></div>
                  <div className="map-zone map-hall"><SquaresFour size={18} /><strong>Main hall</strong><span>240 seats</span></div>
                  <div className="map-zone map-refresh"><ForkKnife size={16} /><strong>Refreshments</strong><span>Courtyard</span></div>
                  <div className="route route-one" /><div className="route route-two" /><div className="route route-three" />
                </div>
              </div>
              <div className="venue-foot"><span>Attendee diagram · sample</span><LiquidButton type="button" className="text-action" onClick={() => setNotice("Map editor is ready to connect.")}>Edit diagram <ArrowRight size={14} /></LiquidButton></div>
            </section>

            <section className="pass-panel" aria-labelledby="pass-heading" data-reveal>
              <div className="panel-heading"><div><h2 id="pass-heading">Entry pass preview</h2><p>One scan for a verified arrival.</p></div><Ticket size={19} weight="duotone" aria-hidden="true" /></div>
            <div className="ticket-preview">
                <div className="ticket-red" data-draw><div className="pass-brand"><VoyageMark className="pass-brand-symbol" /><span>VOYAGE</span><span>ADMIT ONE</span></div><p>{selected?.ticket ?? "General admission"}</p><h3>{selected?.name ?? "Monsoon Sessions"}</h3><div className="pass-date"><span>{event.date}</span><span>{event.time}</span></div></div>
                <div className="ticket-code"><QrVisual value={`https://voyage.events/p/${selected?.id ?? "MW-2841"}`} color={qrColor === "ink" ? "#171715" : "#a92821"} label={`Sample QR pass for ${selected?.name ?? "Monsoon Sessions"}`} /><span>MW-{selected?.id.slice(-4) ?? "2841"}</span></div>
              </div>
              <div className="pass-foot"><span><Scan size={15} /> QR wallet ready</span><div className="pass-tools"><div className="qr-style-toggle" role="group" aria-label="QR code color"><LiquidButton aria-pressed={qrColor === "ink"} className={qrColor === "ink" ? "qr-color-choice choice-active" : "qr-color-choice"} onClick={() => setQrColor("ink")} type="button">Ink</LiquidButton><LiquidButton aria-pressed={qrColor === "red"} className={qrColor === "red" ? "qr-color-choice choice-active" : "qr-color-choice"} onClick={() => setQrColor("red")} type="button">Red</LiquidButton></div><LiquidButton type="button" className="text-action" onClick={downloadPassQr}><DownloadSimple size={14} /> Download</LiquidButton><LiquidButton type="button" className="text-action preview-action" onClick={() => setNotice("Pass preview opened. QR entry links will be issued when registration is connected.")}>Preview pass <ArrowRight size={14} /></LiquidButton></div></div>
            </section>
          </div>

          <section className="operations-strip" id="operations" aria-labelledby="operations-heading" data-reveal>
            <div className="operations-title"><h2 id="operations-heading">The day, accounted for</h2><p>Plans that reach the door.</p></div>
            <a className="operation-link" href="#attendees" onClick={() => setActivePage("Attendees")} data-reveal><span className="operation-icon"><ShieldCheck size={20} /></span><span><strong>Entry and security</strong><small>Staff roles · duplicate scan alerts</small></span><ArrowRight size={17} /></a>
            <a className="operation-link" href="#venue" onClick={() => setActivePage("Venue map")} data-reveal><span className="operation-icon"><ForkKnife size={20} /></span><span><strong>Food and family groups</strong><small>Refreshment counts · party passes</small></span><ArrowRight size={17} /></a>
            <a className="operation-link" href="#attendees" onClick={() => { setActivePage("Exports"); downloadCsv(rows); }} data-reveal><span className="operation-icon"><ClipboardText size={20} /></span><span><strong>Spreadsheet exports</strong><small>Guest list · check-in records</small></span><ArrowRight size={17} /></a>
          </section>

          <section className="public-event" id="event-page" aria-labelledby="public-event-heading" data-reveal>
            <div className="public-event-photo">
              <img src="/images/kalupur-swaminarayan-temple-ahmedabad-1866.jpg" alt="Historic engraved photograph of an ornate Ahmedabad temple courtyard"  />
            </div>
            <div className="public-event-content"><h2 id="public-event-heading">A day to meet in person</h2><p>{event.subtitle}. Join a full day of talks, shared food, and new company in Ahmedabad.</p><div className="public-event-facts"><span><strong>When</strong>{event.date}<br />{event.time}</span><span><strong>Where</strong>{event.venue}</span></div><div className="public-event-actions"><LiquidButton className="button button-red" type="button" onClick={copyEventLink}><EnvelopeSimple size={16} /> {copied ? "Link copied" : "Share invitation"}</LiquidButton><span>Student and family passes available</span></div></div>
          </section>

          <section className="credits-section" aria-label="Image credits">
            <img src="/images/miya-khan-chishti-s-mosque-ahmedabad-1866.jpg" alt="Historic architectural study of Miya Khan Chishti's Mosque in Ahmedabad"  />
            <p>Archival Ahmedabad views by The British Library: <a href="https://commons.wikimedia.org/wiki/File:Kalupur_Swaminarayan_temple_Ahmedabad_1866.jpg" target="_blank" rel="noreferrer">temple courtyard</a>, <a href="https://commons.wikimedia.org/wiki/File:Gateway_Kalupur_Swaminarayan_Temple_Ahmedabad_1866.jpg" target="_blank" rel="noreferrer">gateway</a>, and <a href="https://commons.wikimedia.org/wiki/File:Miya_Khan_Chishti%27s_Mosque_Ahmedabad_1866.jpg" target="_blank" rel="noreferrer">mosque</a>, via Wikimedia Commons. No known copyright restrictions. These photographs show historic Ahmedabad, not the event venue.</p>
            <img src="/images/gateway-kalupur-swaminarayan-temple-ahmedabad-1866.jpg" alt="Historic study of a carved entrance in Ahmedabad"  />
          </section>

          <footer className="workspace-footer"><a href="#top" className="brand-mark footer-brand"><VoyageMark className="brand-symbol" /><span>voyage</span></a><span>Event planning and entry, in one place.</span><a href="mailto:hello@voyage.events">Contact the team</a></footer>
        </main>
      </div>
      {scannerOpen && <QrScannerDialog onClose={closeScanner} onDetected={handleDetectedPass} />}
    </div>
  );
}


