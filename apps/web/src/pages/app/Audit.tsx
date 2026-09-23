import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { categoryLabel, fmtMoney, verdictFor, type CategoryId } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';
import { useAppData } from '../../data/AppDataProvider';
import { CategorySelect, type LogPrefill } from './Plan';

const today = () => new Date().toISOString().slice(0, 10);

export default function Audit() {
  const { held, transactions, addTransaction, removeTransaction } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  // "Ready to log this purchase" from Plan lands here pre-filled.
  const prefill = (location.state as { prefill?: LogPrefill } | null)?.prefill;
  const [cat, setCat] = useState<CategoryId>(prefill?.cat ?? 'fuel');
  const [cardId, setCardId] = useState(prefill?.cardId ?? '');
  const [amt, setAmt] = useState(prefill ? String(prefill.amt) : '');
  const [emi, setEmi] = useState(false);
  const [tenure, setTenure] = useState('');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [tenureError, setTenureError] = useState(false);

  // Clear the prefill from history so a reload doesn't re-apply it.
  useEffect(() => {
    if (prefill) navigate(location.pathname, { replace: true, state: null });
  }, [prefill, location.pathname, navigate]);

  // Default the card picker to the first held card, and keep it valid if cards change.
  useEffect(() => {
    if (!held.some((c) => c.id === cardId)) setCardId(held[0]?.id ?? '');
  }, [held, cardId]);

  const submit = async () => {
    const a = parseFloat(amt);
    const t = emi ? parseInt(tenure, 10) : 1;
    if (!a || a <= 0 || !cardId) return;
    if (emi && (!t || t < 2)) { setTenureError(true); return; }
    const ok = await addTransaction({
      date: new Date(date || today()).toISOString(), cat, cardId, amt: a, note: note.trim(), emi, tenure: emi ? t : 1,
    });
    if (ok) { setAmt(''); setNote(''); setTenure(''); setEmi(false); setTenureError(false); }
  };

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <h2>Log a spend</h2>
      <p className="panel-sub">Tell us what you actually used. We'll show what you should have used, and what the gap cost you.</p>
      <div className="field-group"><span className="field-label">Category</span><CategorySelect value={cat} onChange={setCat} /></div>
      <div className="field-group">
        <span className="field-label">Card you used</span>
        <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
          {held.length === 0
            ? <option value="">No cards selected — go to My Cards</option>
            : held.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="emi-toggle">
        <input type="checkbox" id="emiCheck" checked={emi} onChange={(e) => setEmi(e.target.checked)} />
        <label htmlFor="emiCheck">This is being converted to EMI</label>
      </div>
      <div className="amt-tenure-row">
        <div className="field-group">
          <span className="field-label">{emi ? 'Total purchase amount (₹)' : 'Amount (₹)'}</span>
          <input type="number" min="0" placeholder="e.g. 3200" value={amt} onChange={(e) => setAmt(e.target.value)} />
        </div>
        {emi && (
          <div className="field-group">
            <span className="field-label">Tenure (months)</span>
            <input type="number" min="2" max="60" placeholder="e.g. 6" value={tenure} autoFocus={tenureError}
              style={tenureError ? { borderColor: 'var(--warn)' } : undefined}
              onChange={(e) => { setTenure(e.target.value); setTenureError(false); }} />
          </div>
        )}
      </div>

      <div className="field-group"><span className="field-label">Date of purchase</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div className="field-group"><span className="field-label">Note (optional)</span><input type="text" placeholder="e.g. groceries, dinner with team" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <button className="btn" onClick={submit}>Log &amp; audit</button>

      <div style={{ marginTop: 26 }}>
        {sorted.length === 0 && <div className="empty-hint">Nothing logged yet — add your first spend above.</div>}
        {sorted.map((t) => {
          const v = verdictFor(held, t.cat, t.cardId, t.amt);
          if (!v) return null;
          return (
            <div className="txn-row" key={t.id}>
              <button className="txn-del" aria-label="Delete" onClick={() => removeTransaction(t.id)}>×</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CardChip cardId={t.cardId} small />
                <div style={{ flex: 1 }}>
                  <div className="txn-top">{categoryLabel(t.cat)} — {fmtMoney(t.amt)}</div>
                  <div className="txn-meta">
                    {v.cardUsed.name}{t.note ? ' · ' + t.note : ''} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
              {t.emi && <span className="emi-badge">EMI · {fmtMoney(t.amt / t.tenure)}/mo × {t.tenure} · reward booked once, at purchase</span>}
              {v.isMiss && v.best
                ? <div className="txn-verdict miss">{v.cardUsed.name} earned {fmtMoney(v.usedValue)} — {v.best.card.name} would have earned {fmtMoney(v.best.value)} (−{fmtMoney(v.gap)})</div>
                : <div className="txn-verdict match">Right call — {v.cardUsed.name} was your best option ({fmtMoney(v.usedValue)})</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
