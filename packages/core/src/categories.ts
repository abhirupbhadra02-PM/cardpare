export const CATEGORY_IDS = [
  'fuel', 'upi', 'amazon', 'ecommerce', 'dining', 'grocery', 'travel', 'forex', 'utilities', 'other',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'fuel', label: 'Fuel' },
  { id: 'upi', label: 'UPI / scan & pay' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'ecommerce', label: 'Other e-commerce (Flipkart, Myntra...)' },
  { id: 'dining', label: 'Dining / food delivery' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'travel', label: 'Flights / hotels' },
  { id: 'forex', label: 'Overseas / forex' },
  { id: 'utilities', label: 'Bills & utilities' },
  { id: 'other', label: 'Everything else' },
];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
