import { z } from 'zod';
import type { Card, Reward } from './card';
import { CATEGORY_IDS } from './categories';

// Every category must be present, as a percentage (0–100) or per-₹100 unit count.
const perCategory = (max: number) =>
  z.object(Object.fromEntries(CATEGORY_IDS.map((id) => [id, z.number().min(0).max(max)])) as {
    [K in (typeof CATEGORY_IDS)[number]]: z.ZodNumber;
  }).strict();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s + 'T00:00:00Z')), 'not a real date');

export const RewardSchema = z
  .object({
    unit: z.string().min(1),
    // true: the reward is rupees (cashback), so perCategory is a % and unitValue is 1.
    isCash: z.boolean(),
    // ₹ value of one unit, for the redemption path described in valueNote.
    unitValue: z.number().positive().optional(),
    confidence: z.enum(['high', 'medium', 'unverified']),
    // Units earned per ₹100 spent, by category.
    perCategory: perCategory(1000).optional(),
    valueNote: z.string().optional(),
    capNote: z.string().optional(),
    // Shown as a warning banner in the Rewards tab. Required for unverified cards.
    warning: z.string().optional(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (r.confidence !== 'unverified' && (!r.perCategory || r.unitValue === undefined)) {
      ctx.addIssue({ code: 'custom', message: 'verified rewards need both perCategory and unitValue' });
    }
    if (r.confidence === 'unverified' && !r.warning) {
      ctx.addIssue({ code: 'custom', message: 'unverified rewards must carry a warning shown to users' });
    }
    if (r.isCash && r.unitValue !== undefined && r.unitValue !== 1) {
      ctx.addIssue({ code: 'custom', message: 'cashback (isCash) rewards must have unitValue 1' });
    }
  });

export const CardSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be lowercase-kebab-case'),
    name: z.string().min(1),
    type: z.string().min(1),
    fee: z.string().min(1),
    forexRate: z.string().min(1),
    // When a human last checked this card's terms against the issuer. Bump it on any change.
    verified: isoDate,
    upi: z.boolean(),
    waiverTarget: z.number().positive().nullable(),
    tiers: z.array(z.object({ label: z.string().min(1), target: z.number().positive() }).strict()).optional(),
    // Effective reward value as a % of spend, per category — used to rank cards.
    rates: perCategory(100),
    note: z.string().min(1),
    redeem: z.string().min(1),
    benefits: z.array(z.string().min(1)),
    reward: RewardSchema,
    style: z
      .object({
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be #RRGGBB'),
        initials: z.string().min(1).max(3),
      })
      .strict(),
  })
  .strict()
  .superRefine((c, ctx) => {
    // The ranking maths uses `rates`; the Rewards tab uses perCategory × unitValue.
    // If someone updates one and not the other, the two screens would disagree.
    const r = c.reward;
    if (r.perCategory && r.unitValue !== undefined) {
      for (const cat of CATEGORY_IDS) {
        const implied = r.perCategory[cat] * r.unitValue;
        if (Math.abs(implied - c.rates[cat]) > 0.001) {
          ctx.addIssue({
            code: 'custom',
            path: ['reward', 'perCategory', cat],
            message: `rates.${cat} is ${c.rates[cat]}% but reward.perCategory.${cat} × unitValue = ${implied}% — update both together`,
          });
        }
      }
    }
  });

// Compile-time guard: if card.ts and this schema describe different shapes, the build fails.
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type _CardMatchesSchema = Assert<Equals<z.infer<typeof CardSchema>, Card>>;
export type _RewardMatchesSchema = Assert<Equals<z.infer<typeof RewardSchema>, Reward>>;
