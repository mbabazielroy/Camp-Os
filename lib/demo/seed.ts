// Sample Mill Stream data used when the app runs without a database, so the
// whole product can be explored before any keys exist.

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoTime(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

export const DEMO_USER_ID = "demo-user-0001";
export const DEMO_CAMP_ID = "demo-camp-0001";
export const DEMO_EMAIL = "director@millstream.camp";
export const DEMO_FULL_NAME = "Alex Rivera";

export type DemoRow = Record<string, unknown>;

export function buildSeed(): Record<string, DemoRow[]> {
  return {
    camps: [
      {
        id: DEMO_CAMP_ID,
        name: "Mill Stream Bible Camp",
        owner_id: DEMO_USER_ID,
        created_at: isoTime(-60 * 24 * 30),
      },
    ],

    profiles: [
      {
        id: DEMO_USER_ID,
        full_name: DEMO_FULL_NAME,
        camp_id: DEMO_CAMP_ID,
        role: "director",
        created_at: isoTime(-60 * 24 * 30),
      },
      {
        id: "demo-user-0002",
        full_name: "Dana Brooks",
        camp_id: DEMO_CAMP_ID,
        role: "staff",
        created_at: isoTime(-60 * 24 * 12),
      },
    ],

    camp_invites: [
      {
        id: "demo-invite-1",
        camp_id: DEMO_CAMP_ID,
        email: "office@millstream.camp",
        role: "staff",
        invited_by: DEMO_USER_ID,
        accepted_at: null,
        created_at: isoTime(-60 * 30),
      },
    ],

    tasks: [
      {
        id: "demo-task-1",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Call the Parkers back about Friday pickup",
        description: "They left a voicemail during rest hour.",
        due_date: isoDate(0),
        priority: "high",
        status: "open",
        source_email_id: null,
        created_at: isoTime(-90),
        updated_at: isoTime(-90),
      },
      {
        id: "demo-task-2",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Restock sunscreen at the waterfront shed",
        description: null,
        due_date: isoDate(-2),
        priority: "medium",
        status: "open",
        source_email_id: null,
        created_at: isoTime(-60 * 50),
        updated_at: isoTime(-60 * 50),
      },
      {
        id: "demo-task-3",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Confirm Saturday campfire speaker",
        description: "Pastor Nate - confirm arrival time and sound setup.",
        due_date: isoDate(0),
        priority: "medium",
        status: "open",
        source_email_id: null,
        created_at: isoTime(-60 * 20),
        updated_at: isoTime(-60 * 20),
      },
      {
        id: "demo-task-4",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Send week 3 photos to the parent mailing list",
        description: null,
        due_date: isoDate(2),
        priority: "low",
        status: "open",
        source_email_id: null,
        created_at: isoTime(-60 * 8),
        updated_at: isoTime(-60 * 8),
      },
      {
        id: "demo-task-5",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Check the med form for Maya P. arrived",
        description: "Nurse flagged it as missing at check-in.",
        due_date: isoDate(1),
        priority: "high",
        status: "open",
        source_email_id: null,
        created_at: isoTime(-60 * 5),
        updated_at: isoTime(-60 * 5),
      },
      {
        id: "demo-task-6",
        camp_id: DEMO_CAMP_ID,
        created_by: DEMO_USER_ID,
        title: "Post the updated packing list to the website",
        description: null,
        due_date: isoDate(-4),
        priority: "medium",
        status: "done",
        source_email_id: null,
        created_at: isoTime(-60 * 24 * 5),
        updated_at: isoTime(-60 * 24 * 3),
      },
    ],

    knowledge_base: [
      {
        id: "demo-kb-1",
        camp_id: DEMO_CAMP_ID,
        category: "pickup_times",
        title: "Daily pickup window",
        content:
          "Pickup is between 4:30 and 5:30 PM at the main lodge loop. Please stay in your vehicle; a counsellor will walk your camper out. Campers are only released to adults on the authorized pickup list, and we ask for photo ID for the first few days.",
        created_at: isoTime(-60 * 24 * 20),
        updated_at: isoTime(-60 * 24 * 20),
      },
      {
        id: "demo-kb-2",
        camp_id: DEMO_CAMP_ID,
        category: "pickup_times",
        title: "Early pickup procedure",
        content:
          "Email or call the camp office at least two hours ahead. Early pickups are signed out at the office, and we need the request from the email address we have on file. Please allow ten minutes for us to bring your camper up from their activity.",
        created_at: isoTime(-60 * 24 * 18),
        updated_at: isoTime(-60 * 24 * 18),
      },
      {
        id: "demo-kb-3",
        camp_id: DEMO_CAMP_ID,
        category: "packing_list",
        title: "Overnight trip packing list",
        content:
          "Sleeping bag, pillow, flashlight, toiletries, two changes of clothes, a warm layer for the evening, rain jacket, and closed-toe shoes. Medication goes to the camp nurse in its original container. Please leave electronics at home and label everything.",
        created_at: isoTime(-60 * 24 * 16),
        updated_at: isoTime(-60 * 24 * 16),
      },
      {
        id: "demo-kb-4",
        camp_id: DEMO_CAMP_ID,
        category: "policy",
        title: "Medication policy",
        content:
          "All medication, including over-the-counter, is checked in with the camp nurse in its original labelled container with a completed authorization form. Campers do not keep medication in their cabins, apart from physician-authorized inhalers and epinephrine auto-injectors.",
        created_at: isoTime(-60 * 24 * 15),
        updated_at: isoTime(-60 * 24 * 15),
      },
      {
        id: "demo-kb-5",
        camp_id: DEMO_CAMP_ID,
        category: "policy",
        title: "Refund and cancellation policy",
        content:
          "Cancellations more than two weeks before a session receive a full refund less the fifty dollar deposit. Within two weeks, half the fee is refunded. After a session begins we do not refund, though documented medical withdrawals are credited toward a future session.",
        created_at: isoTime(-60 * 24 * 14),
        updated_at: isoTime(-60 * 24 * 14),
      },
      {
        id: "demo-kb-6",
        camp_id: DEMO_CAMP_ID,
        category: "rules",
        title: "Phones and electronics",
        content:
          "Camp is screen-free. Phones, tablets, smart watches and gaming devices stay at home. If a camper needs to reach a parent the office phone is always available, and we will call you directly if anything comes up.",
        created_at: isoTime(-60 * 24 * 13),
        updated_at: isoTime(-60 * 24 * 13),
      },
    ],

    guardians: [
      {
        id: "demo-guardian-1",
        camp_id: DEMO_CAMP_ID,
        first_name: "Jordan",
        last_name: "Parker",
        email: "jordan.parker@example.com",
        phone: "705-555-0142",
        relationship: "Mother",
        notes: "Prefers email over phone during work hours.",
        created_at: isoTime(-60 * 24 * 22),
        updated_at: isoTime(-60 * 24 * 22),
      },
      {
        id: "demo-guardian-2",
        camp_id: DEMO_CAMP_ID,
        first_name: "Sam",
        last_name: "Whitfield",
        email: "sam.whitfield@example.com",
        phone: "705-555-0198",
        relationship: "Father",
        notes: null,
        created_at: isoTime(-60 * 24 * 21),
        updated_at: isoTime(-60 * 24 * 21),
      },
      {
        id: "demo-guardian-3",
        camp_id: DEMO_CAMP_ID,
        first_name: "Renee",
        last_name: "Osei",
        email: "renee.osei@example.com",
        phone: "705-555-0167",
        relationship: "Guardian",
        notes: "Two campers this session.",
        created_at: isoTime(-60 * 24 * 19),
        updated_at: isoTime(-60 * 24 * 19),
      },
    ],

    campers: [
      {
        id: "demo-camper-1",
        camp_id: DEMO_CAMP_ID,
        first_name: "Maya",
        last_name: "Parker",
        cabin: "Cabin 4",
        age: 11,
        guardian_id: "demo-guardian-1",
        notes: "Peanut allergy - EpiPen with the nurse.",
        created_at: isoTime(-60 * 24 * 22),
        updated_at: isoTime(-60 * 24 * 22),
      },
      {
        id: "demo-camper-2",
        camp_id: DEMO_CAMP_ID,
        first_name: "Eli",
        last_name: "Whitfield",
        cabin: "Cabin 2",
        age: 9,
        guardian_id: "demo-guardian-2",
        notes: null,
        created_at: isoTime(-60 * 24 * 21),
        updated_at: isoTime(-60 * 24 * 21),
      },
      {
        id: "demo-camper-3",
        camp_id: DEMO_CAMP_ID,
        first_name: "Ama",
        last_name: "Osei",
        cabin: "Cabin 6",
        age: 13,
        guardian_id: "demo-guardian-3",
        notes: "Returning camper - asked about the leadership program.",
        created_at: isoTime(-60 * 24 * 19),
        updated_at: isoTime(-60 * 24 * 19),
      },
      {
        id: "demo-camper-4",
        camp_id: DEMO_CAMP_ID,
        first_name: "Kofi",
        last_name: "Osei",
        cabin: "Cabin 3",
        age: 10,
        guardian_id: "demo-guardian-3",
        notes: null,
        created_at: isoTime(-60 * 24 * 19),
        updated_at: isoTime(-60 * 24 * 19),
      },
      {
        id: "demo-camper-5",
        camp_id: DEMO_CAMP_ID,
        first_name: "Nina",
        last_name: "Doyle",
        cabin: "Cabin 4",
        age: 12,
        guardian_id: null,
        notes: "Sponsored spot - paperwork with the office.",
        created_at: isoTime(-60 * 24 * 11),
        updated_at: isoTime(-60 * 24 * 11),
      },
    ],

    staff: [
      {
        id: "demo-staff-1",
        camp_id: DEMO_CAMP_ID,
        first_name: "Dana",
        last_name: "Brooks",
        role: "Program Director",
        email: "dana@millstream.camp",
        phone: "705-555-0110",
        notes: null,
        created_at: isoTime(-60 * 24 * 40),
        updated_at: isoTime(-60 * 24 * 40),
      },
      {
        id: "demo-staff-2",
        camp_id: DEMO_CAMP_ID,
        first_name: "Priya",
        last_name: "Raman",
        role: "Camp Nurse",
        email: "nurse@millstream.camp",
        phone: "705-555-0111",
        notes: "On site Sunday evening through Friday.",
        created_at: isoTime(-60 * 24 * 38),
        updated_at: isoTime(-60 * 24 * 38),
      },
      {
        id: "demo-staff-3",
        camp_id: DEMO_CAMP_ID,
        first_name: "Tomas",
        last_name: "Vega",
        role: "Waterfront Lead",
        email: null,
        phone: "705-555-0124",
        notes: "Lifeguard certification renews in March.",
        created_at: isoTime(-60 * 24 * 35),
        updated_at: isoTime(-60 * 24 * 35),
      },
      {
        id: "demo-staff-4",
        camp_id: DEMO_CAMP_ID,
        first_name: "Hannah",
        last_name: "Lindgren",
        role: "Cabin 4 Counsellor",
        email: null,
        phone: null,
        notes: null,
        created_at: isoTime(-60 * 24 * 30),
        updated_at: isoTime(-60 * 24 * 30),
      },
    ],

    email_drafts: [
      {
        id: "demo-email-1",
        camp_id: DEMO_CAMP_ID,
        original_email:
          "Hi there,\n\nMaya has a dentist appointment on Friday afternoon that we couldn't move. Would it be alright if I picked her up at 3pm instead of the usual time? I can come to the office if that's easier.\n\nThanks so much,\nJordan Parker",
        sender_name: "Jordan Parker",
        sender_email: "jordan.parker@example.com",
        subject: "Early pickup Friday?",
        source: "manual",
        gmail_message_id: null,
        gmail_thread_id: null,
        category: "pickup",
        urgency: "high",
        ai_summary: "Asking to pick Maya up at 3pm this Friday for a dentist appointment.",
        ai_draft:
          "Hi Jordan,\n\nThat's no problem at all - a 3pm pickup on Friday works. Please come to the camp office to sign Maya out, and allow about ten minutes for us to bring her up from her afternoon activity.\n\nOne small thing: we do need the request to come from the email address we have on file, which this is, so you're all set.\n\nSee you Friday,\nThe Camp Office\nMill Stream Bible Camp",
        edited_draft:
          "Hi Jordan,\n\nThat's no problem at all - a 3pm pickup on Friday works. Please come to the camp office to sign Maya out, and allow about ten minutes for us to bring her up from her afternoon activity.\n\nOne small thing: we do need the request to come from the email address we have on file, which this is, so you're all set.\n\nSee you Friday,\nThe Camp Office\nMill Stream Bible Camp",
        suggested_task_title: "Tell Cabin 4 about Maya's 3pm Friday pickup",
        suggested_task_due: isoDate(3),
        suggested_task_accepted: false,
        status: "pending",
        created_at: isoTime(-12),
        updated_at: isoTime(-12),
      },
      {
        id: "demo-email-2",
        camp_id: DEMO_CAMP_ID,
        original_email:
          "Hello,\n\nCould you send along the packing list for the overnight trip next week? I want to make sure Eli has everything, especially if it's going to be cold at night.\n\nThank you,\nSam",
        sender_name: "Sam Whitfield",
        sender_email: "sam.whitfield@example.com",
        subject: "Packing list for the overnight",
        source: "manual",
        gmail_message_id: null,
        gmail_thread_id: null,
        category: "logistics",
        urgency: "low",
        ai_summary: "Wants the overnight trip packing list for Eli.",
        ai_draft:
          "Hi Sam,\n\nHappy to help. For the overnight trip Eli will need a sleeping bag, pillow, flashlight, toiletries, two changes of clothes, a warm layer for the evening, a rain jacket, and closed-toe shoes.\n\nIf Eli takes any medication, please hand it to our camp nurse in its original container rather than packing it. And we do ask that electronics stay home - labelling everything with his name saves a lot of lost-and-found.\n\nWarmly,\nThe Camp Office\nMill Stream Bible Camp",
        edited_draft:
          "Hi Sam,\n\nHappy to help. For the overnight trip Eli will need a sleeping bag, pillow, flashlight, toiletries, two changes of clothes, a warm layer for the evening, a rain jacket, and closed-toe shoes.\n\nIf Eli takes any medication, please hand it to our camp nurse in its original container rather than packing it. And we do ask that electronics stay home - labelling everything with his name saves a lot of lost-and-found.\n\nWarmly,\nThe Camp Office\nMill Stream Bible Camp",
        suggested_task_title: null,
        suggested_task_due: null,
        suggested_task_accepted: false,
        status: "pending",
        created_at: isoTime(-95),
        updated_at: isoTime(-95),
      },
      {
        id: "demo-email-3",
        camp_id: DEMO_CAMP_ID,
        original_email:
          "Good morning,\n\nAma mentioned there's a leadership program for older campers. Is there information about it, and is there still space for next summer?\n\nRenee Osei",
        sender_name: "Renee Osei",
        sender_email: "renee.osei@example.com",
        subject: "Leadership program",
        source: "manual",
        gmail_message_id: null,
        gmail_thread_id: null,
        category: "general",
        urgency: "medium",
        ai_summary:
          "Asking about the older-camper leadership program and next summer's availability.",
        ai_draft:
          "Hi Renee,\n\nThank you for asking - it's lovely to hear Ama is interested.\n\nI don't have the leadership program details in front of me in a form I can quote accurately, so rather than guess at dates or spaces I'll confirm with our program director and come back to you this week with the specifics.\n\nWarmly,\nThe Camp Office\nMill Stream Bible Camp",
        edited_draft:
          "Hi Renee,\n\nThank you for asking - it's lovely to hear Ama is interested.\n\nI don't have the leadership program details in front of me in a form I can quote accurately, so rather than guess at dates or spaces I'll confirm with our program director and come back to you this week with the specifics.\n\nWarmly,\nThe Camp Office\nMill Stream Bible Camp",
        suggested_task_title: "Get leadership program details from Dana for Renee Osei",
        suggested_task_due: isoDate(2),
        suggested_task_accepted: false,
        status: "pending",
        created_at: isoTime(-60 * 26),
        updated_at: isoTime(-60 * 26),
      },
      {
        id: "demo-email-4",
        camp_id: DEMO_CAMP_ID,
        original_email:
          "Hi, just checking whether the bus leaves from the church parking lot or the camp itself on Sunday. Thanks!",
        sender_name: "Sam Whitfield",
        sender_email: "sam.whitfield@example.com",
        subject: "Sunday bus",
        source: "manual",
        gmail_message_id: null,
        gmail_thread_id: null,
        category: "logistics",
        urgency: "medium",
        ai_summary: "Asking where the Sunday bus departs from.",
        ai_draft: "",
        edited_draft:
          "Hi Sam,\n\nThe bus leaves from the church parking lot at 2:00 PM on Sunday - please arrive about fifteen minutes early so we can check everyone in.\n\nSee you then,\nThe Camp Office",
        suggested_task_title: null,
        suggested_task_due: null,
        suggested_task_accepted: false,
        status: "approved",
        created_at: isoTime(-60 * 24 * 2),
        updated_at: isoTime(-60 * 24 * 2 + 30),
      },
    ],

    gmail_accounts: [],
  };
}
