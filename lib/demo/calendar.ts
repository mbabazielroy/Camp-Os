import type { CalendarEvent } from "@/lib/calendar";

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function at(offsetDays: number, hour: number, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
}

// Sample agenda shown in demo mode, so the calendar section is explorable
// before a real Google account is connected.
export function demoCalendarEvents(): CalendarEvent[] {
  return [
    {
      id: "demo-event-1",
      summary: "Staff planning meeting",
      location: "Camp office",
      start: at(0, 15),
      end: at(0, 16),
      allDay: false,
      htmlLink: null,
    },
    {
      id: "demo-event-2",
      summary: "Furnace service - lodge",
      location: null,
      start: at(2, 9),
      end: at(2, 11),
      allDay: false,
      htmlLink: null,
    },
    {
      id: "demo-event-3",
      summary: "Grace Fellowship youth retreat",
      location: "Lodge and chapel",
      start: isoDate(16),
      end: isoDate(19),
      allDay: true,
      htmlLink: null,
    },
    {
      id: "demo-event-4",
      summary: "Board meeting",
      location: "Zoom",
      start: at(5, 19),
      end: at(5, 20, 30),
      allDay: false,
      htmlLink: null,
    },
  ];
}
