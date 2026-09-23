import { useState } from 'react';
import { CARDS, CATEGORIES, getCard } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';

export default function Compare() {
  const [idA, setIdA] = useState(CARDS[0].id);
  const [idB, setIdB] = useState(CARDS[Math.min(1, CARDS.length - 1)].id);
  const a = getCard(idA)!;
  const b = getCard(idB)!;

  const options = CARDS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>);

  return (
    <>
      <h2>Compare two cards</h2>
      <p className="panel-sub">Any card in the database, not just the ones you hold — useful before deciding what to request or apply for.</p>
      <div className="field-group"><span className="field-label">Card A</span><select value={idA} onChange={(e) => setIdA(e.target.value)}>{options}</select></div>
      <div className="field-group"><span className="field-label">Card B</span><select value={idB} onChange={(e) => setIdB(e.target.value)}>{options}</select></div>

      <div className="cmp-table">
        <div className="cmp-name-row">
          <div className="cmp-label" />
          <div className="cmp-name-cell"><CardChip cardId={a.id} /><div className="name">{a.name}</div></div>
          <div className="cmp-name-cell"><CardChip cardId={b.id} /><div className="name">{b.name}</div></div>
        </div>
        <div className="cmp-row"><div className="cmp-label">Annual fee</div><div className="cmp-cell" style={{ fontSize: '0.72rem' }}>{a.fee}</div><div className="cmp-cell" style={{ fontSize: '0.72rem' }}>{b.fee}</div></div>
        <div className="cmp-row"><div className="cmp-label">Forex markup</div><div className="cmp-cell">{a.forexRate}</div><div className="cmp-cell">{b.forexRate}</div></div>
        <div className="cmp-row"><div className="cmp-label">UPI-capable</div><div className="cmp-cell">{a.upi ? 'Yes' : 'No'}</div><div className="cmp-cell">{b.upi ? 'Yes' : 'No'}</div></div>
        {CATEGORIES.map((cat) => {
          const va = a.rates[cat.id], vb = b.rates[cat.id];
          return (
            <div className="cmp-row" key={cat.id}>
              <div className="cmp-label">{cat.label}</div>
              <div className={'cmp-cell' + (va > vb ? ' win' : '')}>{va}%</div>
              <div className={'cmp-cell' + (vb > va ? ' win' : '')}>{vb}%</div>
            </div>
          );
        })}
      </div>
      {[a, b].map((c, i) => (
        <div className="dash-section" key={i}>
          <h3>{c.name} benefits</h3>
          {c.benefits.length ? c.benefits.map((x) => <div className="benefit-line" key={x}>{x}</div>) : <div className="empty-hint">None on record.</div>}
        </div>
      ))}
    </>
  );
}
