import { useState } from 'react';
import { CARDS } from '@cardpare/core';
import { CardChip } from '../../components/CardChip';
import { useAppData } from '../../data/AppDataProvider';

export default function MyCards() {
  const { heldCards, toggleCard, cardRequests, myVotes, requestCard, toggleVote } = useAppData();
  const [openDetails, setOpenDetails] = useState<Set<string>>(new Set());
  const [reqName, setReqName] = useState('');
  const [reqNote, setReqNote] = useState('');

  const toggleDetails = (id: string) => setOpenDetails((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const submitRequest = async () => {
    const name = reqName.trim();
    if (!name) return;
    if (await requestCard(name, reqNote.trim())) { setReqName(''); setReqNote(''); }
  };

  return (
    <>
      <h2>My cards</h2>
      <p className="panel-sub">Select the cards you actually hold. Plan and Audit only recommend from this list.</p>
      {CARDS.map((c) => {
        const held = heldCards.includes(c.id);
        const isOpen = openDetails.has(c.id) !== held;
        return (
          <div className="my-card-row" key={c.id}>
            <div className="my-card-top">
              <CardChip cardId={c.id} />
              <div className="my-card-info">
                <div className="my-card-name">{c.name}</div>
                <div className="my-card-meta">{c.type} · {c.fee}</div>
              </div>
              <div className="my-card-actions">
                <div className={'switch' + (held ? ' on' : '')} role="switch" aria-checked={held} aria-label={`I hold ${c.name}`} tabIndex={0}
                  onClick={() => toggleCard(c.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleCard(c.id))} />
              </div>
            </div>
            <button className="details-link" onClick={() => toggleDetails(c.id)}>{isOpen ? 'Hide details' : 'View benefits & details'}</button>
            <div className={'card-detail-panel' + (isOpen ? ' open' : '')}>
              <div className="detail-row"><div className="detail-label">Reward highlight</div><div className="detail-value">{c.note}</div></div>
              <div className="detail-row">
                <div className="detail-label">Benefits</div>
                {c.benefits.length ? c.benefits.map((b) => <div className="benefit-line" key={b}>{b}</div>) : <div className="benefit-line">No additional benefits on record.</div>}
              </div>
              <div className="detail-row"><div className="detail-label">Forex markup</div><div className="detail-value small">{c.forexRate}</div></div>
              <div className="detail-row"><div className="detail-label">Redemption</div><div className="detail-value small">{c.redeem}</div></div>
              <div className="detail-row"><div className="detail-label">Last verified</div><div className="detail-value small">{c.verified}</div></div>
            </div>
          </div>
        );
      })}

      <div className="dash-section">
        <h3>Don't see your card?</h3>
        <div className="share-note">Requests and votes here are visible to everyone using Cardpare — don't include anything you wouldn't want public.</div>
        <div className="field-group"><span className="field-label">Card name</span><input type="text" placeholder="e.g. Yes Bank Marquee" value={reqName} onChange={(e) => setReqName(e.target.value)} /></div>
        <div className="field-group"><span className="field-label">Note (optional)</span><input type="text" placeholder="e.g. I use this mostly for dining" value={reqNote} onChange={(e) => setReqNote(e.target.value)} /></div>
        <button className="btn ghost" onClick={submitRequest}>Request this card</button>
        <div style={{ marginTop: 16 }}>
          {cardRequests.length === 0 && <div className="empty-hint">No requests yet — be the first.</div>}
          {[...cardRequests].sort((a, b) => b.votes - a.votes).map((r) => (
            <div className="req-row" key={r.id}>
              <div><div className="req-name">{r.name}</div>{r.note && <div className="req-note">{r.note}</div>}</div>
              <div className={'upvote' + (myVotes.includes(r.id) ? ' voted' : '')} role="button" tabIndex={0} aria-pressed={myVotes.includes(r.id)}
                aria-label={`Upvote ${r.name}`} onClick={() => toggleVote(r.id)} onKeyDown={(e) => e.key === 'Enter' && toggleVote(r.id)}>
                <div className="arrow">▲</div><div className="count">{r.votes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
