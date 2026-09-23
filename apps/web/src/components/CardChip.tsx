import { getCard } from '@cardpare/core';

export function CardChip({ cardId, small }: { cardId: string; small?: boolean }) {
  const s = getCard(cardId)?.style ?? { color: '#6B6F76', initials: '??' };
  return (
    <div className={'card-chip' + (small ? ' sm' : '')} style={{ background: `linear-gradient(135deg, ${s.color}cc, ${s.color})` }}>
      {s.initials}
    </div>
  );
}
