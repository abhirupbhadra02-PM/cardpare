import { describe, expect, it } from 'vitest';
import { CARDS, getCard } from './catalog';
import { validateCatalog } from './validate';

describe('card catalog', () => {
  // This is the check that blocks a deploy if any card entry is wrong.
  it('every card passes validation', () => {
    expect(validateCatalog(CARDS)).toEqual([]);
  });

  it('has the expected cards, with unique ids', () => {
    expect(CARDS).toHaveLength(14);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    expect(getCard('axis-atlas')?.name).toBe('Axis Atlas');
  });

  it('flags a rate that disagrees with the reward units', () => {
    const atlas = structuredClone(getCard('axis-atlas')!);
    atlas.rates.travel = 3;
    const problems = validateCatalog([atlas]);
    expect(problems.join('\n')).toMatch(/axis-atlas: reward\.perCategory\.travel — rates\.travel is 3%/);
  });

  it('flags missing fields, bad dates, future dates and duplicates', () => {
    const millennia = structuredClone(getCard('hdfc-millennia')!) as unknown as Record<string, unknown>;
    delete millennia.verified;
    expect(validateCatalog([millennia]).join('\n')).toMatch(/hdfc-millennia: verified/);

    const future = { ...structuredClone(getCard('onecard')!), verified: '2099-01-01' };
    expect(validateCatalog([future])).toEqual(['onecard: verified date 2099-01-01 is in the future']);

    const dup = getCard('onecard')!;
    expect(validateCatalog([dup, dup])).toEqual(['onecard: duplicate id']);
  });

  it('requires a user-facing warning on unverified rewards', () => {
    const scapia = structuredClone(getCard('scapia')!);
    delete scapia.reward.warning;
    expect(validateCatalog([scapia]).join('\n')).toMatch(/unverified rewards must carry a warning/);
  });
});
