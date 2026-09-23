import type { ReactNode } from 'react';
import { Link } from 'react-router';
import '../../styles/legal.css';

function LegalPage({ title, draftNote, children }: { title: string; draftNote: string; children: ReactNode }) {
  return (
    <div className="page-legal">
      <div className="wrap">
        <Link to="/" className="brand" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>Card<span>pare</span></Link>
        <h1>{title}</h1>
        <div className="updated">Last updated: draft — insert date at launch</div>
        <div className="note">{draftNote}</div>
        {children}
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      draftNote="This is a plain-language starting draft, not reviewed by a lawyer. Have it checked before treating it as your actual, binding policy — especially now that accounts exist."
    >
      <h2>What Cardpare stores today</h2>
      <p>You can use Cardpare without an account. If you do, the cards you select, the purchases you log, your planned purchases and any budget limit you set are stored only in your own browser — we don't receive them.</p>
      <p>If you create an account, we store your email address and a securely hashed password (handled by our authentication provider, Supabase — we never see your password), along with the same card, purchase, planned-purchase and budget data, so it's available when you sign in on another device. This data is stored in a database hosted by Supabase and is only readable by your account. Aggregate, non-identifying counts (for example, how many people hold a given card) may be viewed by the Cardpare team to improve the product.</p>

      <h2>Card requests and the waitlist</h2>
      <p>Card requests and their vote counts are public to everyone using Cardpare and aren't linked to your account. If you join the early-access waitlist, we store the email address you give us so we can contact you about access; it isn't shown to other users.</p>

      <h2>Analytics</h2>
      <p>We may use privacy-respecting, aggregate website analytics (such as page views and general location by country) to understand usage. This does not identify you individually. If we ever add more detailed analytics or advertising trackers, this policy will be updated first.</p>

      <h2>Affiliate links</h2>
      <p>Some card recommendations may include a referral link to the issuing bank or a partner network. If you apply for a card through such a link, the bank or network may receive a referral fee, and their own privacy policy governs whatever information you provide during that application — we do not receive your application details.</p>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell your data to third parties.</li>
        <li>We don't read your actual bank or card statements unless you've explicitly connected that feature in a future version, with your clear consent at that time.</li>
        <li>We don't share individually identifiable spend data with card issuers or advertisers.</li>
      </ul>

      <h2>Your choices</h2>
      <p>Without an account, you can clear your data at any time by clearing your browser's site data for Cardpare. With an account, you can ask us to delete your account and everything stored with it by contacting us. You can also ask us to remove a card request or waitlist entry.</p>

      <h2>Contact</h2>
      <p>Questions about this policy: insert contact email at launch.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      draftNote="This is a plain-language starting draft, not reviewed by a lawyer. Have it checked before treating it as your actual, binding terms — particularly the liability and dispute sections."
    >
      <h2>What Cardpare is</h2>
      <p>Cardpare is a planning and record-keeping tool to help you decide which of your own credit cards to use for a purchase, and to review your own past spending against that guidance. It is not a bank, a payments processor, a financial advisor, or a credit counselor, and using it does not create any advisory relationship.</p>

      <h2>Not financial advice</h2>
      <p>Card reward rates, fees, and benefits shown in Cardpare are a hand-curated reference maintained on a best-effort basis and may be outdated, incomplete, or incorrect. Always confirm current terms directly with your card issuer before making a financial decision, especially for a large purchase. Cardpare is not a substitute for professional financial advice.</p>

      <h2>No guarantee of accuracy</h2>
      <p>We do our best to keep the card database current and mark when each entry was last checked, but we make no warranty that any rate, cap, fee, or benefit shown is accurate or current at the time you view it. Your use of any recommendation is at your own discretion and risk.</p>

      <h2>Affiliate relationships</h2>
      <p>Cardpare may earn a referral commission if you apply for a card through a link shown in the app. This does not change the price or terms you receive from the issuer, and recommendation logic is not intended to favor a card because it pays a higher commission — but you should treat any such link as a disclosed affiliate relationship, not a neutral third-party review.</p>

      <h2>Your data</h2>
      <p>See the <Link to="/privacy">Privacy Policy</Link> for what is stored and where. You are responsible for the accuracy of what you log, and for keeping access to your own device or account secure.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don't use Cardpare to submit false card requests, spam the waitlist, or abuse any shared feature.</li>
        <li>Don't attempt to scrape, resell, or redistribute the card database as your own without permission.</li>
        <li>You must be able to legally hold a credit card in your jurisdiction to make meaningful use of this tool.</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>Cardpare is provided "as is," without warranty of any kind. To the fullest extent permitted by law, we are not liable for any financial loss, fee, interest charge, or missed reward arising from your use of, or reliance on, information in this app.</p>

      <h2>Changes</h2>
      <p>These terms may be updated as the product evolves. Continued use after a change means you accept the updated terms.</p>

      <h2>Contact</h2>
      <p>Questions about these terms: insert contact email at launch.</p>
    </LegalPage>
  );
}
