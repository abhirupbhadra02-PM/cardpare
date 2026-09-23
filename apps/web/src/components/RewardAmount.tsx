import { fmtMoney, fmtUnits, type RewardAmount as Amount } from '@cardpare/core';

// "620 EDGE Miles (~₹310)" for points/miles cards, plain "₹310" for cashback.
export function RewardAmount({ amount }: { amount: Amount }) {
  if (amount.kind === 'cash') return <>{fmtMoney(amount.inr)}</>;
  return (
    <>
      {fmtUnits(amount.units)} {amount.unit}
      {amount.inrEstimate !== null && <span className="reward-est"> (~{fmtMoney(amount.inrEstimate)})</span>}
    </>
  );
}
