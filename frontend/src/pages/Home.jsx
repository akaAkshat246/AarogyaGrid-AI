import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

const features = [
  ['01', 'Monitor your network', 'Bring medicine stock, beds, staff and patient demand into one view across your healthcare centres.'],
  ['02', 'Anticipate shortages', 'Use AI demand predictions and risk alerts to spot resource pressure and plan ahead.'],
  ['03', 'Coordinate a response', 'Explore redistribution recommendations, track transfers and ask the Operations Copilot for support.']
];

export default function Home() {
  const { user, demo } = useAuth();
  const navigate = useNavigate();
  const enterDemo = () => {
    if (!user) demo();
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#main-content">Skip to content</a>
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Brand />
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQs</a>
          </nav>
          <div className="landing-actions">
            <Link className="secondary" to="/login">Login</Link>
            <Link className="primary" to="/signup">Sign Up</Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="landing-container">
        <section className="landing-hero" aria-labelledby="home-title">
          <div>
            <span className="eyebrow">CONNECTED CARE. COORDINATED RESOURCES.</span>
            <h1 id="home-title">Predict. Share.<br /><span>Respond.</span></h1>
            <p className="landing-intro">The right resources.<br />Where they matter most.</p>
            <p className="landing-description">AarogyaGrid AI helps healthcare teams monitor capacity, anticipate shortages and coordinate resources across PHCs and hospitals — all from one familiar workspace.</p>
            <div className="landing-actions">
              <Link className="primary" to="/signup">Get started</Link>
              <button className="secondary" onClick={enterDemo}>{user ? 'Open dashboard' : 'Explore demo'} <span aria-hidden="true">→</span></button>
            </div>
            <p className="landing-note">Built by <b>CodeGoblins</b> · {user ? 'Your health network, connected.' : 'Explore the demo without registration.'}</p>
          </div>

          <aside className="card landing-preview" aria-label="Platform overview">
            <div className="landing-preview-heading"><span className="eyebrow">YOUR HEALTH NETWORK</span><span className="landing-preview-label">Platform overview</span></div>
            <h2>One view. Better coordination.</h2>
            <div className="landing-resource-grid">
              <div><span>Medicines</span><b>Stock visibility</b></div>
              <div><span>Beds & staff</span><b>Capacity planning</b></div>
            </div>
            <div className="landing-preview-row"><span className="landing-step-number">01</span><div><b>See the need</b><p>Monitor facilities and resource availability.</p></div></div>
            <div className="landing-preview-row"><span className="landing-step-number">02</span><div><b>Plan ahead</b><p>Review forecasts and priority alerts.</p></div></div>
            <div className="landing-preview-row"><span className="landing-step-number">03</span><div><b>Connect the response</b><p>Find surplus resources and coordinate transfers.</p></div></div>
            <div className="landing-preview-foot">From visibility to action, together.</div>
          </aside>
        </section>

        <section id="features" className="landing-section" aria-labelledby="features-title">
          <div className="landing-section-heading"><span className="eyebrow">BUILT FOR HEALTHCARE OPERATIONS</span><h2 id="features-title">A connected approach to care.</h2><p>Your existing tools, working together across the network.</p></div>
          <div className="landing-feature-grid">{features.map(([number, title, description]) => <article className="card landing-feature" key={number}><span className="landing-step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section id="how-it-works" className="card landing-workflow landing-section" aria-labelledby="workflow-title">
          <div><span className="eyebrow">FROM INSIGHT TO ACTION</span><h2 id="workflow-title">Stay a step ahead.</h2><p>Review your network, understand the risks and decide how to respond.</p></div>
          <ol className="landing-flow"><li>Monitor</li><li>Predict</li><li>Alert</li><li>Recommend</li><li>Act</li></ol>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div><Brand /><p>Smarter coordination for a healthier network.</p><p>Created by <b>CodeGoblins</b>.</p></div>
            <nav className="landing-footer-links" aria-label="Footer navigation"><h2>Useful links</h2><Link to="/">Home</Link><a href="#features">Platform features</a><a href="#how-it-works">How it works</a><Link to="/login">Login</Link><Link to="/signup">Sign Up</Link><Link to="/dashboard">Dashboard</Link></nav>
            <section id="faq" className="landing-faq" aria-labelledby="faq-title">
              <h2 id="faq-title">Frequently asked questions</h2>
              <details><summary>What is AarogyaGrid AI?</summary><p>A healthcare coordination platform for monitoring resources, predicting shortages and recommending redistribution across PHCs and hospitals.</p></details>
              <details><summary>Can I try it without an account?</summary><p>Yes. Choose Explore demo on this page, or use the demo option on the login or sign-up page, to open the dashboard without registration.</p></details>
              <details><summary>What can my team monitor?</summary><p>Medicine inventory, facility capacity, patient demand, alerts, predictions and resource transfers, with a district map and Operations Copilot.</p></details>
              <details><summary>Does the demo need a running backend?</summary><p>No. The app uses demo data when backend services are unavailable. Demo information is illustrative; connected data depends on your configured services.</p></details>
            </section>
          </div>
          <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} AarogyaGrid AI · CodeGoblins</span><span>Predict. Share. Respond.</span></div>
        </div>
      </footer>
    </div>
  );
}
