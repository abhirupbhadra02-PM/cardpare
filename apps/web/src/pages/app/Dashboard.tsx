import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { categoryLabel, computeMonthlySummary, fmtMoney, getCard, rewardFor, rewardForUnits } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';
import { RewardAmount } from '../../components/RewardAmount';
import { useAppData } from '../../data/AppDataProvider';

export default function Dashboard() {
  const { held, heldCards, transactions, monthlyLimit, saveLimit } = useAppData();
  const navigate = useNavigate();
  const [showEarned, setShowEarned] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  const s = computeMonthlySummary(transactions, held, new Date());
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <>
      <h2>This month, at a glance</h2>
      <p className="panel-sub">A quick read on how your spend has actually mapped to your cards.</p>

      {heldCards.length === 0 ? (
        <div className="onboard-empty show">
          <div className="onboard-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F5D50" strokeWidth="1.6"><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
          </div>
          <h3>Add your cards to get started</h3>
          <p>Nothing to show yet — Cardpare only works with the cards you tell it you hold. Pick a few under My Cards and this dashboard fills in.</p>
          <button className="btn accent" onClick={() => navigate('/app/cards')}>Select your cards</button>
        </div>
      ) : (
        <div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Logged this month</div>
              <div className="value">{fmtMoney(s.totalSpend)}</div>
              <div className="caption">Cash actually spent, EMI installments counted at their monthly slice.</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-top">
                <div className="label">Earned</div>
                <button className="info-btn" aria-label="Show breakdown" aria-expanded={showEarned} onClick={() => setShowEarned((v) => !v)}>i</button>
              </div>
              <div className="value">{fmtMoney(s.totalEarned)}</div>
              <div className="caption">Rupee estimate of the reward earned from the card you actually used. See the Rewards tab for the real cashback, points or miles.</div>
            </div>
            <div className={'stat-card' + (!s.anyLogged ? '' : s.anyMiss ? ' warn' : ' good')}>
              <div className="label">Left on the table</div>
              <div className="value">{fmtMoney(s.totalMissed)}</div>
              {s.anyLogged && (
                <span className={'status-badge ' + (s.anyMiss ? 'bad' : 'good')}>{s.anyMiss ? 'Worth reviewing' : 'Good — on target'}</span>
              )}
              <div className="caption">
                {!s.anyLogged
                  ? 'Nothing logged this month yet.'
                  : s.anyMiss
                    ? "The gap between what you earned and what your best held card would've earned."
                    : 'Every purchase this month matched its best available card — genuinely ₹0.'}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Cards in rotation</div>
              <div className="value">{heldCards.length}</div>
              <div className="caption">Cards you've marked as held under My Cards.</div>
            </div>
          </div>

          <div className={'earned-detail' + (showEarned ? ' open' : '')}>
            {s.earnedRows.length === 0 ? (
              <div className="empty-hint">Nothing earned yet this month — log a spend to see the breakdown.</div>
            ) : (
              s.earnedRows.map((r, i) => (
                <div className="earned-detail-row" key={i}>
                  <div><div>{r.catLabel}</div><div className="earned-detail-sub">{r.card.name} · {fmtMoney(r.amt)} spent</div></div>
                  <div className="mini-val"><RewardAmount amount={rewardFor(r.card, r.cat, r.amt)} /></div>
                </div>
              ))
            )}
            <div className="earned-formula">
              Formula: <code>(card's rate for the category ÷ 100) × amount spent</code>. For EMI purchases, the full amount is credited once, in the purchase month — later installments add to spend but not to Earned.
            </div>
          </div>

          <Budget spend={s.totalSpend} limit={monthlyLimit}>
            <div className="budget-edit">
              <input type="number" min="0" placeholder="e.g. 60000" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} aria-label="Monthly limit" />
              <button className="btn small accent" onClick={() => {
                const v = parseFloat(limitInput);
                void saveLimit(v > 0 ? v : null);
                setLimitInput('');
              }}>Save</button>
            </div>
          </Budget>

          <div className="dash-section">
            <h3>By card this month</h3>
            <div className="bycard-header"><span>Card</span><span>Earned</span></div>
            {s.byCard.length === 0 ? (
              <div className="empty-hint">No spend logged this month yet.</div>
            ) : (
              s.byCard.map((c) => (
                <div className="mini-row" key={c.card.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CardChip cardId={c.card.id} small />
                    <div><div>{c.card.name}</div><div className="mini-sub">{fmtMoney(c.spend)} spent</div></div>
                  </div>
                  <div className="mini-val"><RewardAmount amount={rewardForUnits(c.card, c.units, c.earned)} /></div>
                </div>
              ))
            )}
          </div>

          <div className="dash-section">
            <h3>Recent activity</h3>
            {recent.length === 0 ? (
              <div className="empty-hint">No activity yet.</div>
            ) : (
              recent.map((t) => (
                <div className="mini-row" key={t.id}>
                  <div>
                    <div>{categoryLabel(t.cat)}</div>
                    <div className="mini-sub">
                      {getCard(t.cardId)?.name ?? ''}{t.emi ? ' · EMI' : ''} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="mini-val">{fmtMoney(t.amt)}</div>
                </div>
              ))
            )}
          </div>

          <div className="reward-cta" role="link" tabIndex={0} onClick={() => navigate('/app/rewards')} onKeyDown={(e) => e.key === 'Enter' && navigate('/app/rewards')}>
            <div>
              <div className="reward-cta-text">See what you're actually earning</div>
              <div className="reward-cta-sub">Cashback, points or miles — per card, in their real units, not just ₹.</div>
            </div>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
          </div>
        </div>
      )}
    </>
  );
}

function Budget({ spend, limit, children }: { spend: number; limit: number | null; children: ReactNode }) {
  let val = 'Not set', pct = 0, fill = 'budget-fill', status = 'Set a limit below to track it here.';
  if (limit && limit > 0) {
    pct = Math.min(100, (spend / limit) * 100);
    val = `${fmtMoney(spend)} / ${fmtMoney(limit)}`;
    fill += spend > limit ? ' over' : pct >= 80 ? ' amber' : '';
    status = spend > limit
      ? `You're ${fmtMoney(spend - limit)} over your limit this month.`
      : pct >= 80
        ? `Close to your limit — ${fmtMoney(limit - spend)} left this month.`
        : `${fmtMoney(limit - spend)} left before you hit your limit.`;
  }
  return (
    <div className="budget-box">
      <div className="budget-top">
        <h3 style={{ margin: 0 }}>Monthly limit</h3>
        <span className="val">{val}</span>
      </div>
      <div className="budget-bar"><div className={fill} style={{ width: pct + '%' }} /></div>
      <div className="budget-status">{status}</div>
      {children}
    </div>
  );
}
