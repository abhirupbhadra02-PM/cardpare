import { CARD_LIST } from './cards';
import type { Card } from './card';

export const CARDS: readonly Card[] = CARD_LIST;

export function getCard(id: string): Card | undefined {
  return CARDS.find((c) => c.id === id);
}

export function heldCardObjects(heldIds: readonly string[]): Card[] {
  return CARDS.filter((c) => heldIds.includes(c.id));
}
