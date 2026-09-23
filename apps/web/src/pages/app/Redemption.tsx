import { useAppData } from '../../data/AppDataProvider';

export default function Redemption() {
  const { held } = useAppData();
  return (
    <>
      <h2>Redemption guide</h2>
      <p className="panel-sub">What your points or miles are worth, and where to spend them. Informational only — no live balance sync yet.</p>
      {held.length === 0 && <div className="empty-hint">Select cards under "My Cards" to see redemption info here.</div>}
      {held.map((c) => (
        <div className="redeem-card" key={c.id}>
          <div className="redeem-name">{c.name}</div>
          <div className="redeem-fee">{c.fee} · Forex: {c.forexRate}</div>
          <div className="redeem-body">{c.redeem}</div>
          <div className="verified-tag">Last verified {c.verified}</div>
        </div>
      ))}
    </>
  );
}
