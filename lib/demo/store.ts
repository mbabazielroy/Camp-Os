// A small in-memory stand-in for the subset of PostgREST the app uses, so the
// product can be explored without a database. Data lives for the lifetime of
// the server process and resets when it restarts.

import { buildSeed, type DemoRow } from "./seed";

type Tables = Record<string, DemoRow[]>;

// Survives hot reloads in development, where modules are re-evaluated.
const globalForDemo = globalThis as unknown as { __millstreamDemo?: Tables };

function tables(): Tables {
  if (!globalForDemo.__millstreamDemo) {
    globalForDemo.__millstreamDemo = buildSeed();
  }
  return globalForDemo.__millstreamDemo;
}

function rowsOf(table: string): DemoRow[] {
  const all = tables();
  if (!all[table]) all[table] = [];
  return all[table];
}

type Comparison = { column: string; op: string; value: unknown };

function valueOf(row: DemoRow, column: string): unknown {
  return row[column];
}

function matchesOne(row: DemoRow, { column, op, value }: Comparison): boolean {
  const actual = valueOf(row, column);

  switch (op) {
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
    case "in":
      return Array.isArray(value) && value.includes(actual as never);
    case "is":
      return value === null ? actual === null || actual === undefined : actual === value;
    case "lt":
      return actual != null && String(actual) < String(value);
    case "lte":
      return actual != null && String(actual) <= String(value);
    case "gt":
      return actual != null && String(actual) > String(value);
    case "gte":
      return actual != null && String(actual) >= String(value);
    case "ilike": {
      if (actual == null) return false;
      const pattern = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*");
      return new RegExp(`^${pattern}$`, "i").test(String(actual));
    }
    default:
      return true;
  }
}

/**
 * Parses PostgREST's `.or()` syntax, e.g.
 *   "due_date.lte.2026-01-01,due_date.is.null"
 *   "first_name.ilike.%ama%,last_name.ilike.%ama%"
 * Callers strip commas from user input, so splitting on commas is safe here.
 */
function parseOr(filter: string): Comparison[] {
  return filter
    .split(",")
    .map((clause) => clause.trim())
    .filter(Boolean)
    .map((clause) => {
      const first = clause.indexOf(".");
      const second = clause.indexOf(".", first + 1);
      const column = clause.slice(0, first);
      const op = clause.slice(first + 1, second);
      const raw = clause.slice(second + 1);
      return { column, op, value: raw === "null" ? null : raw };
    });
}

interface OrderSpec {
  column: string;
  ascending: boolean;
  nullsFirst: boolean;
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// Highest priority sorts first when ordering descending, matching how the
// app relies on priority ordering.
const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };

function sortRows(rows: DemoRow[], specs: OrderSpec[]): DemoRow[] {
  if (specs.length === 0) return rows;
  return [...rows].sort((rowA, rowB) => {
    for (const spec of specs) {
      const a = valueOf(rowA, spec.column);
      const b = valueOf(rowB, spec.column);

      const aNull = a === null || a === undefined;
      const bNull = b === null || b === undefined;
      if (aNull && bNull) continue;
      if (aNull) return spec.nullsFirst ? -1 : 1;
      if (bNull) return spec.nullsFirst ? 1 : -1;

      const isPriority = spec.column === "priority";
      const cmp = isPriority
        ? (PRIORITY_RANK[String(a)] ?? 0) - (PRIORITY_RANK[String(b)] ?? 0)
        : compareValues(a, b);
      if (cmp !== 0) return spec.ascending ? cmp : -cmp;
    }
    return 0;
  });
}

export interface DemoResult<T = DemoRow[] | DemoRow | null> {
  data: T;
  error: { message: string; code?: string } | null;
  count?: number | null;
}

type Pending =
  | { kind: "select"; head: boolean; wantCount: boolean }
  | { kind: "insert"; rows: DemoRow[]; returning: boolean }
  | { kind: "update"; patch: DemoRow }
  | { kind: "delete" }
  | { kind: "upsert"; rows: DemoRow[]; conflictKey: string };

function newId(table: string): string {
  return `${table}-${Math.random().toString(36).slice(2, 10)}`;
}

// Column defaults from supabase/schema.sql. Without them an inserted row is
// missing fields the app filters on (a new task with no `status` would never
// appear in the open list).
const COLUMN_DEFAULTS: Record<string, DemoRow> = {
  camps: { name: "My Camp" },
  profiles: { role: "director", full_name: null, camp_id: null },
  camp_invites: { role: "staff", accepted_at: null, invited_by: null },
  tasks: {
    description: null,
    due_date: null,
    priority: "medium",
    status: "open",
    source_email_id: null,
    created_by: null,
  },
  knowledge_base: { category: "other" },
  guardians: { email: null, phone: null, relationship: null, notes: null },
  campers: { cabin: null, age: null, guardian_id: null, notes: null },
  staff: { role: null, email: null, phone: null, notes: null },
  email_drafts: {
    sender_name: null,
    sender_email: null,
    subject: null,
    source: "manual",
    gmail_message_id: null,
    gmail_thread_id: null,
    category: null,
    urgency: null,
    ai_summary: null,
    ai_draft: null,
    edited_draft: null,
    suggested_task_title: null,
    suggested_task_due: null,
    suggested_task_accepted: false,
    status: "pending",
  },
  gmail_accounts: { last_synced_at: null, connected_by: null },
};

export class DemoQuery implements PromiseLike<DemoResult> {
  private comparisons: Comparison[] = [];
  private orGroups: Comparison[][] = [];
  private orders: OrderSpec[] = [];
  private limitCount: number | null = null;
  private pending: Pending = { kind: "select", head: false, wantCount: false };
  private singleMode: "none" | "maybe" | "one" = "none";

  constructor(private readonly table: string) {}

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    if (this.pending.kind === "insert" || this.pending.kind === "upsert") {
      this.pending = { ...this.pending, returning: true } as Pending;
      return this;
    }
    this.pending = {
      kind: "select",
      head: Boolean(options?.head),
      wantCount: options?.count === "exact",
    };
    return this;
  }

  eq(column: string, value: unknown) {
    this.comparisons.push({ column, op: "eq", value });
    return this;
  }
  neq(column: string, value: unknown) {
    this.comparisons.push({ column, op: "neq", value });
    return this;
  }
  in(column: string, value: unknown[]) {
    this.comparisons.push({ column, op: "in", value });
    return this;
  }
  is(column: string, value: unknown) {
    this.comparisons.push({ column, op: "is", value });
    return this;
  }
  lt(column: string, value: unknown) {
    this.comparisons.push({ column, op: "lt", value });
    return this;
  }
  lte(column: string, value: unknown) {
    this.comparisons.push({ column, op: "lte", value });
    return this;
  }
  gt(column: string, value: unknown) {
    this.comparisons.push({ column, op: "gt", value });
    return this;
  }
  gte(column: string, value: unknown) {
    this.comparisons.push({ column, op: "gte", value });
    return this;
  }
  ilike(column: string, value: string) {
    this.comparisons.push({ column, op: "ilike", value });
    return this;
  }
  or(filter: string) {
    this.orGroups.push(parseOr(filter));
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orders.push({
      column,
      ascending: options?.ascending !== false,
      nullsFirst: options?.nullsFirst ?? false,
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(rows: DemoRow | DemoRow[]) {
    this.pending = {
      kind: "insert",
      rows: Array.isArray(rows) ? rows : [rows],
      returning: false,
    };
    return this;
  }

  upsert(rows: DemoRow | DemoRow[], options?: { onConflict?: string }) {
    this.pending = {
      kind: "upsert",
      rows: Array.isArray(rows) ? rows : [rows],
      conflictKey: options?.onConflict ?? "camp_id",
    };
    return this;
  }

  update(patch: DemoRow) {
    this.pending = { kind: "update", patch };
    return this;
  }

  delete() {
    this.pending = { kind: "delete" };
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybe";
    return this;
  }

  single() {
    this.singleMode = "one";
    return this;
  }

  private matching(): DemoRow[] {
    return rowsOf(this.table).filter((row) => {
      if (!this.comparisons.every((c) => matchesOne(row, c))) return false;
      return this.orGroups.every((group) => group.some((c) => matchesOne(row, c)));
    });
  }

  private run(): DemoResult {
    const now = new Date().toISOString();

    switch (this.pending.kind) {
      case "insert":
      case "upsert": {
        const inserted: DemoRow[] = [];
        for (const incoming of this.pending.rows) {
          if (this.pending.kind === "upsert") {
            const key = this.pending.conflictKey;
            const existing = rowsOf(this.table).find((r) => r[key] === incoming[key]);
            if (existing) {
              Object.assign(existing, incoming, { updated_at: now });
              inserted.push(existing);
              continue;
            }
          }
          const row: DemoRow = {
            id: incoming.id ?? newId(this.table),
            created_at: now,
            updated_at: now,
            ...COLUMN_DEFAULTS[this.table],
            ...incoming,
          };
          rowsOf(this.table).push(row);
          inserted.push(row);
        }
        const payload = this.singleMode === "none" ? inserted : inserted[0] ?? null;
        return { data: payload as DemoRow[], error: null };
      }

      case "update": {
        const updated = this.matching();
        for (const row of updated) {
          Object.assign(row, this.pending.patch, { updated_at: now });
        }
        const payload = this.singleMode === "none" ? updated : updated[0] ?? null;
        return { data: payload as DemoRow[], error: null };
      }

      case "delete": {
        const doomed = new Set(this.matching());
        const kept = rowsOf(this.table).filter((row) => !doomed.has(row));
        tables()[this.table] = kept;
        return { data: [] as DemoRow[], error: null };
      }

      case "select":
      default: {
        let rows = sortRows(this.matching(), this.orders);
        const total = rows.length;
        if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);

        if (this.pending.kind === "select" && this.pending.head) {
          return { data: null, error: null, count: total };
        }

        // Return copies so callers can't mutate the store by accident.
        const copies = rows.map((row) => ({ ...row }));

        if (this.singleMode !== "none") {
          const first = copies[0] ?? null;
          if (!first && this.singleMode === "one") {
            return {
              data: null,
              error: { message: "No rows found", code: "PGRST116" },
            };
          }
          return { data: first, error: null, count: total };
        }

        return {
          data: copies as DemoRow[],
          error: null,
          count: this.pending.kind === "select" && this.pending.wantCount ? total : null,
        };
      }
    }
  }

  then<TResult1 = DemoResult, TResult2 = never>(
    onfulfilled?: ((value: DemoResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    try {
      return Promise.resolve(this.run()).then(onfulfilled, onrejected);
    } catch (error) {
      return Promise.reject(error).then(onfulfilled, onrejected);
    }
  }
}

export function demoFrom(table: string): DemoQuery {
  return new DemoQuery(table);
}

export function resetDemoData(): void {
  globalForDemo.__millstreamDemo = buildSeed();
}
