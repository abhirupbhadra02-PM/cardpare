import { useNavigate } from 'react-router';
import { CATEGORIES, computeMonthlySummary, rewardForUnits } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';
import { RewardAmount } from '../../components/RewardAmount';
import { useAppData } from '../../data/AppDataProvider';

export default function Rewards() {
  const { held, transactions } = useAppData();
  const navigate = useNavigate();
  const summary = computeMonthlySummary(transactions, held, new Date());

  return (
    <>
      <h2>What you're actually earning</h2>
      <p className="panel-sub">Cashback, points or miles — in each card's real unit, not a flattened rupee figure. The ₹ figure alongside is an estimate for comparison, not a guarantee.</p>

      {held.length === 0 && (
        <div className="onboard-empty show">
          <div className="onboard-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F5D50" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
          </div>
          <h3>Add your cards to see this</h3>
          <p>Select the cards you hold under My Cards, and this page will show what each one actually pays out.</p>
          <button className="btn accent" onClick={() => navigate('/app/cards')}>Select your cards</button>
        </div>
      )}

      {held.map((c) => {
        const r = c.reward;
        const usesUnits = !r.isCash && !!r.perCategory;
        const rateOf = (cat: (typeof CATEGORIES)[number]['id']) => (r.perCategory ? r.perCategory[cat] : c.rates[cat]);
        const baseline = rateOf('other');
        // Only show categories that differ from "everything else", to keep each card scannable.
        const rows = CATEGORIES.filter((cat) => cat.id === 'other' || rateOf(cat.id) !== baseline);
        const month = summary.byCard.find((b) => b.card.id === c.id);
        return (
          <div className="reward-card" key={c.id}>
            <div className="reward-card-top">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CardChip cardId={c.id} small />
                  <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>{c.name}</div>
                </div>
                <div>
                  <span className="reward-unit-badge">{r.unit || 'Cashback'}</span>
                  {r.confidence === 'unverified' && <span className="reward-unverified-badge">Unverified</span>}
                </div>
              </div>
              <div>
                <div className="reward-month">
                  {month && month.spend > 0 ? <RewardAmount amount={rewardForUnits(c, month.units, month.earned)} /> : 'Nothing logged yet'}
                </div>
                <div className="reward-month-label">this month</div>
              </div>
            </div>
            {r.warning && <div className="reward-warning">{r.warning}</div>}
            <div className="reward-table">
              {rows.map((cat) => (
                <div className="reward-table-row" key={cat.id}>
                  <span>{cat.label}</span>
                  <span>{usesUnits ? `${rateOf(cat.id)} ${r.unit}/₹100` : `${rateOf(cat.id)}% cashback`}</span>
                </div>
              ))}
            </div>
            <div className="reward-note">{r.valueNote ?? ''}{r.capNote ? ' ' + r.capNote : ''}</div>
            <div className="verified-tag">Last verified {c.verified}</div>
          </div>
        );
      })}
    </>
  );
}
