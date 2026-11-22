import Image from "next/image";

export function TicketLoading({ label }: { label: string }) {
  return (
    <div className="ticket-route-loading">
      <div className="ticket-route-loading-card" role="status">
        <Image
          src="/images/ticketstandard-wordmark.png"
          alt=""
          width={2172}
          height={724}
          sizes="(max-width: 600px) 210px, 300px"
          loading="eager"
        />
        <span className="ticket-route-loading-track" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
