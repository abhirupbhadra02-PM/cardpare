import { CardSchema } from './schema';

// Returns human-readable problems with the catalog; empty means it's valid.
// Run by the test suite, which runs before every build — so a bad card blocks a deploy.
export function validateCatalog(cards: readonly unknown[], today: Date = new Date()): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const todayStr = today.toISOString().slice(0, 10);
  cards.forEach((raw, i) => {
    const label = (raw as { id?: string })?.id ?? `card #${i + 1}`;
    const parsed = CardSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push(`${label}: ${issue.path.join('.') || '(card)'} — ${issue.message}`);
      }
      return;
    }
    const c = parsed.data;
    if (seen.has(c.id)) problems.push(`${c.id}: duplicate id`);
    seen.add(c.id);
    if (c.verified > todayStr) problems.push(`${c.id}: verified date ${c.verified} is in the future`);
  });
  return problems;
}
