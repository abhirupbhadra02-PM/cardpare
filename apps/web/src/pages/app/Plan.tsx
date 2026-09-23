import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CATEGORIES, categoryLabel, fmtMoney, planInsight, rankCardsFor, type CategoryId, type Ranked } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';
import { useAppData } from '../../data/AppDataProvider';

export interface LogPrefill { cat: CategoryId; amt: number; cardId: string }

export default function Plan() {
  const { held, transactions, plannedPurchases, addPlanned, removePlanned } = useAppData();
  const navigate = useNavigate();

  const [cat, setCat] = useState<CategoryId>('fuel');
  const [amt, setAmt] = useState('');
  const [result, setResult] = useState<{ kind: 'msg'; text: string } | { kind: 'ranked'; ranked: Ranked[] } | null>(null);

  const [futName, setFutName] = useState('');
  const [futCat, setFutCat] = useState<CategoryId>('fuel');
  const [futAmt, setFutAmt] = useState('');
  const [futMonth, setFutMonth] = useState('');

  const showBest = () => {
    const a = parseFloat(amt);
    if (!a || a <= 0) return setResult({ kind: 'msg', text: 'Enter an amount to compare your cards.' });
    if (held.length === 0) return setResult({ kind: 'msg', text: 'Select the cards you hold under "My Cards" first.' });
    const ranked = rankCardsFor(held, cat, a);
    if (ranked.length === 0) return setResult({ kind: 'msg', text: 'None of your selected cards are UPI-capable (RuPay). Add one under My Cards to optimize UPI spend.' });
    setResult({ kind: 'ranked', ranked });
  };

  const addFuture = async () => {
    const a = parseFloat(futAmt);
    const name = futName.trim();
    if (!name || !a || a <= 0) return;
    if (await addPlanned({ name, cat: futCat, amt: a, month: futMonth || null })) {
      setFutName(''); setFutAmt(''); setFutMonth('');
    }
  };

  const now = new Date();
  const sortedPlans = [...plannedPurchases].sort((a, b) => (a.month || '').localeCompare(b.month || ''));

  return (
    <>
      <h2>Which card should this go on?</h2>
      <p className="panel-sub">Pick a category and amount — ranked against the cards you've selected under My Cards.</p>
      <div className="field-group"><span className="field-label">Category</span><CategorySelect value={cat} onChange={setCat} /></div>
      <div className="field-group"><span className="field-label">Amount (₹)</span><input type="number" min="0" placeholder="e.g. 15000" value={amt} onChange={(e) => setAmt(e.target.value)} /></div>
      <button className="btn accent" onClick={showBest}>Show me the best card</button>
      {result?.kind === 'msg' && <div className="result-empty" style={{ marginTop: 16 }}>{result.text}</div>}
      {result?.kind === 'ranked' && (
        <div className="result-card">
          {result.ranked.map((r, i) => (
            <div className={'rank-row' + (i === 0 ? ' top' : '')} key={r.card.id}>
              <div className="rank-left">
                <CardChip cardId={r.card.id} small />
                <div><div className="rank-name">{r.card.name}</div><div className="rank-note">{r.card.note}</div></div>
              </div>
              <div className="rank-val">{fmtMoney(r.value)}</div>
            </div>
          ))}
        </div>
      )}

      <hr className="divider" />

      <h2>Planning something bigger?</h2>
      <p className="panel-sub">A future trip, a laptop, a big-ticket purchase — add it here and see which card fits, whether EMI or a milestone is worth thinking about, before you buy.</p>
      <div className="field-group"><span className="field-label">What is it</span><input type="text" placeholder="e.g. Vietnam flights, new laptop" value={futName} onChange={(e) => setFutName(e.target.value)} /></div>
      <div className="field-group"><span className="field-label">Category</span><CategorySelect value={futCat} onChange={setFutCat} /></div>
      <div className="field-group"><span className="field-label">Estimated amount (₹)</span><input type="number" min="0" placeholder="e.g. 80000" value={futAmt} onChange={(e) => setFutAmt(e.target.value)} /></div>
      <div className="field-group"><span className="field-label">Target month</span><input type="month" value={futMonth} onChange={(e) => setFutMonth(e.target.value)} /></div>
      <button className="btn" onClick={addFuture}>Add to plan</button>

      <div style={{ marginTop: 16 }}>
        {sortedPlans.length === 0 && <div className="empty-hint">Nothing planned yet.</div>}
        {sortedPlans.map((p) => {
          const { top, extras } = planInsight(p, held, transactions, now);
          return (
            <div className="plan-item" key={p.id}>
              <div className="plan-top">
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-meta">{categoryLabel(p.cat)} · {fmtMoney(p.amt)}{p.month ? ' · ' + p.month : ''}</div>
                </div>
                <button className="plan-del" aria-label={`Remove ${p.name}`} onClick={() => removePlanned(p.id)}>×</button>
              </div>
              <div className="plan-rec">
                {top
                  ? <>Use <b>{top.card.name}</b> — about {fmtMoney(top.value)} back.</>
                  : <>No held card fits "{categoryLabel(p.cat)}" yet — check My Cards.</>}
              </div>
              {extras.length > 0 && <div className="plan-extra">{extras.map((e) => <div key={e}>· {e}</div>)}</div>}
              {top && (
                <div className="plan-actions">
                  <button className="btn small ghost" onClick={() => navigate('/app/audit', { state: { prefill: { cat: p.cat, amt: p.amt, cardId: top.card.id } satisfies LogPrefill } })}>
                    Ready to log this purchase
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function CategorySelect({ value, onChange }: { value: CategoryId; onChange: (v: CategoryId) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as CategoryId)}>
      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
    </select>
  );
}
