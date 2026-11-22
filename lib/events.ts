export type Attendee = {
  id: string;
  name: string;
  email: string;
  ticket: string;
  group: string;
  registered: string;
  status: "Checked in" | "Registered";
};

export const attendees: Attendee[] = [
  { id: "MW-2841", name: "Ananya Shah", email: "ananya.shah@example.in", ticket: "Student pass", group: "CEPT University", registered: "Today, 09:42", status: "Checked in" },
  { id: "MW-2839", name: "Kabir Mehta", email: "kabir.mehta@example.in", ticket: "General pass", group: "Independent", registered: "Today, 09:38", status: "Checked in" },
  { id: "MW-2836", name: "Mira Desai", email: "mira.desai@example.in", ticket: "Family group · 3", group: "3 attendees", registered: "Today, 09:31", status: "Registered" },
  { id: "MW-2832", name: "Dev Patel", email: "dev.patel@example.in", ticket: "Student pass", group: "NID Ahmedabad", registered: "Today, 09:16", status: "Registered" },
  { id: "MW-2827", name: "Ira Trivedi", email: "ira.trivedi@example.in", ticket: "General pass", group: "Independent", registered: "Today, 08:54", status: "Registered" },
  { id: "MW-2818", name: "Aarav Bhatt", email: "aarav.bhatt@example.in", ticket: "Student pass", group: "Ahmedabad University", registered: "Yesterday, 18:22", status: "Checked in" },
  { id: "MW-2804", name: "Zoya Merchant", email: "zoya.merchant@example.in", ticket: "Family group · 2", group: "2 attendees", registered: "Yesterday, 16:08", status: "Registered" },
  { id: "MW-2791", name: "Rohan Vyas", email: "rohan.vyas@example.in", ticket: "General pass", group: "Independent", registered: "Yesterday, 12:47", status: "Registered" },
];

export type Event = {
  name: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registrations: number;
  checkedIn: number;
  guestCount: number;
};

export const event: Event = {
  name: "Monsoon Sessions",
  subtitle: "A day for ideas in the open",
  date: "Saturday, 14 November 2026",
  time: "10:00 am - 6:30 pm IST",
  venue: "L. D. Institute of Indology, Ahmedabad",
  capacity: 240,
  registrations: 186,
  checkedIn: 128,
  guestCount: 213,
};

export function toAttendeeCsv(rows: Attendee[]) {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [
    ["Pass ID", "Name", "Email", "Ticket", "Group", "Registered", "Status"].join(","),
    ...rows.map((row) => [row.id, row.name, row.email, row.ticket, row.group, row.registered, row.status].map(quote).join(",")),
  ].join("\r\n");
}

