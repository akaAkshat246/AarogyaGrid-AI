import React from 'react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    number: '01',
    title: 'Multi-Horizon AI Demand Forecasting',
    description: 'Predicts 1–7 day medicine consumption trends using Ridge Regression and historical OPD footfall dynamics to detect stockouts 48+ hours in advance.'
  },
  {
    number: '02',
    title: 'Spatial Surplus-Deficit Redistribution',
    description: 'Calculates shortest Haversine routes between neighboring PHCs, identifying surplus stock and generating balanced inter-facility transfer orders.'
  },
  {
    number: '03',
    title: 'Emergency Surge & Outbreak Simulator',
    description: 'Simulates sudden epidemic outbreaks (e.g. Dengue surge with +45% footfall and 2.5x IV fluids demand) to stress-test facility bed and medicine capacity.'
  },
  {
    number: '04',
    title: 'Grounded Operations Copilot',
    description: 'Interactive AI assistant grounded directly in live facility telemetry, answering real-time questions on shortage risks, bed occupancy, and transfer approvals.'
  }
];

const steps = [
  { step: '01', title: 'Telemetry Ingestion', desc: 'Real-time sync of medicine stock, bed occupancy, and OPD footfall.' },
  { step: '02', title: 'Risk Scoring & ML', desc: 'Ridge ML models evaluate multi-day burn rates and alert severity.' },
  { step: '03', title: 'Spatial Discovery', desc: 'Algorithm matches deficit PHCs with nearby surplus donor facilities.' },
  { step: '04', title: 'CMO Authorization', desc: 'Human-in-the-loop review and approval before logistics dispatch.' },
  { step: '05', title: 'Real-Time Tracking', desc: 'Track transit status from dispatch to delivery confirmation.' }
];

const faqs = [
  {
    q: 'What is AarogyaGrid AI?',
    a: 'AarogyaGrid AI is a national healthcare resource intelligence and redistribution platform designed to monitor primary health centres, predict supply shortages, and coordinate inter-facility stock transfers.'
  },
  {
    q: 'How does the platform access protected operational data?',
    a: 'All dashboard analytics, inventory management, patient telemetry, and AI forecasting tools are protected behind certified health officer authentication (Google Sign-In or verified account credentials).'
  },
  {
    q: 'Can transfers occur automatically without medical supervision?',
    a: 'No. AarogyaGrid AI uses a strict Human-in-the-Loop workflow. The AI proposes optimized transfer quantities, but Chief Medical Officers must review and approve each order before physical dispatch.'
  },
  {
    q: 'How does the AI handle seasonal disease outbreaks?',
    a: 'The platform includes an Emergency Surge Simulator that stress-tests regional networks against dengue, viral fevers, and localized epidemics, automatically recalculating safety buffer stocks.'
  },
  {
    q: 'Does it integrate with Google Cloud Platform?',
    a: 'Yes. AarogyaGrid AI is integrated with Google BigQuery for long-term analytics data warehousing and Google Cloud Pub/Sub for real-time emergency alert dispatching.'
  }
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#main-content">Skip to main content</a>
      
      {/* Top Header Navbar */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Brand />
          
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#architecture">Architecture</a>
            <a href="#faq">FAQs</a>
          </nav>

          <div className="landing-actions">
            {user ? (
              <Link className="primary" to="/dashboard">Open Dashboard →</Link>
            ) : (
              <>
                <Link className="secondary" to="/login">Sign In</Link>
                <Link className="primary" to="/signup">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="landing-container">
        
        {/* Hero Section */}
        <section className="landing-hero" aria-labelledby="home-title">
          <div className="landing-hero-copy">
            <span className="eyebrow">NATIONAL HEALTHCARE RESOURCE INTELLIGENCE</span>
            <h1 id="home-title">Predict. Share.<br /><span>Respond.</span></h1>
            <p className="landing-intro">The right resources. Where they matter most.</p>
            <p className="landing-description">
              AarogyaGrid AI empowers health administrators to monitor real-time medicine stock, 
              forecast patient footfall surges, automate inter-facility stock transfers, 
              and eliminate critical stockouts across Primary Health Centres.
            </p>
            
            <div className="landing-hero-actions">
              {user ? (
                <Link className="primary" to="/dashboard">Access Health Portal →</Link>
              ) : (
                <>
                  <Link className="primary" to="/login">Access Health Portal</Link>
                  <a className="secondary" href="#features">Explore Capabilities</a>
                </>
              )}
            </div>
            
            <div className="landing-badges">
              <span>Google Cloud BigQuery & Pub/Sub</span>
              <span>•</span>
              <span>Scikit-Learn ML</span>
              <span>•</span>
              <span>Human-in-the-Loop</span>
            </div>
          </div>

          {/* Right Column Preview Card */}
          <aside className="card landing-preview" aria-label="Network Telemetry Overview">
            <div className="landing-preview-heading">
              <span className="eyebrow">LIVE NETWORK TELEMETRY</span>
              <span className="landing-preview-label">Active Monitoring</span>
            </div>
            
            <h2>Delhi-NCR Health Grid</h2>
            
            <div className="landing-resource-grid">
              <div>
                <span>Monitored Facilities</span>
                <b>16 Primary Centres</b>
              </div>
              <div>
                <span>Available Bed Capacity</span>
                <b>112 Beds Available</b>
              </div>
            </div>

            <div className="landing-preview-timeline">
              <div className="landing-preview-row">
                <span className="landing-step-number">01</span>
                <div>
                  <b>Real-Time Facility Visibility</b>
                  <p>Continuous tracking of essential drugs, ICU beds, and on-duty doctors.</p>
                </div>
              </div>
              
              <div className="landing-preview-row">
                <span className="landing-step-number">02</span>
                <div>
                  <b>Predictive Shortage Alerting</b>
                  <p>Ridge regression models signal stockout risks 48–72 hours in advance.</p>
                </div>
              </div>
              
              <div className="landing-preview-row">
                <span className="landing-step-number">03</span>
                <div>
                  <b>Optimized Redistribution</b>
                  <p>Automated transfer orders route surplus stock via shortest transit routes.</p>
                </div>
              </div>
            </div>

            <div className="landing-preview-foot">
              <span>Verified System Health: <b>100% Operational</b></span>
            </div>
          </aside>
        </section>

        {/* Features Section */}
        <section id="features" className="landing-section" aria-labelledby="features-title">
          <div className="landing-section-heading">
            <span className="eyebrow">ENTERPRISE PLATFORM CAPABILITIES</span>
            <h2 id="features-title">Intelligent Care Coordination</h2>
            <p>Designed for District Medical Officers, Inventory Managers, and Health Administrators.</p>
          </div>

          <div className="landing-feature-grid">
            {features.map((f) => (
              <article className="card landing-feature" key={f.number}>
                <span className="landing-step-number">{f.number}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="landing-section" aria-labelledby="workflow-title">
          <div className="card landing-workflow">
            <div className="landing-workflow-header">
              <span className="eyebrow">FIVE-STAGE PIPELINE</span>
              <h2 id="workflow-title">From Telemetry to Coordinated Action</h2>
              <p>How AarogyaGrid AI processes facility data into actionable medical redistribution.</p>
            </div>

            <div className="landing-steps-list">
              {steps.map((s) => (
                <div className="landing-step-item" key={s.step}>
                  <div className="landing-step-badge">{s.step}</div>
                  <div>
                    <b>{s.title}</b>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cloud Architecture Section */}
        <section id="architecture" className="landing-section" aria-labelledby="arch-title">
          <div className="landing-section-heading">
            <span className="eyebrow">CLOUD & EDGE ARCHITECTURE</span>
            <h2 id="arch-title">Secure, Scalable & Interoperable</h2>
            <p>Built upon Google Cloud infrastructure and privacy-preserving federated AI.</p>
          </div>

          <div className="landing-arch-grid">
            <div className="card landing-arch-card">
              <span className="eyebrow">DATA WAREHOUSING</span>
              <h3>Google BigQuery & Pub/Sub</h3>
              <p>Streaming telemetry ingestion into BigQuery analytical datasets with event-driven emergency alerts dispatched via Cloud Pub/Sub.</p>
            </div>
            <div className="card landing-arch-card">
              <span className="eyebrow">MACHINE LEARNING</span>
              <h3>Scikit-Learn & Gemini AI</h3>
              <p>Ridge regression models for multi-step consumption forecasts combined with Grounded Gemini 2.0 operations copilot.</p>
            </div>
            <div className="card landing-arch-card">
              <span className="eyebrow">EDGE PRIVACY</span>
              <h3>Federated Averaging (FedAvg)</h3>
              <p>Simulated multi-node regional federated learning rounds that aggregate model weights without transmitting sensitive patient records.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="landing-section" aria-labelledby="faq-title">
          <div className="landing-section-heading">
            <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2 id="faq-title">Everything You Need to Know</h2>
            <p>Common questions about security, integration, and platform usage.</p>
          </div>

          <div className="landing-faq-container">
            {faqs.map((faq, idx) => (
              <details className="card landing-faq-item" key={idx}>
                <summary><b>{faq.q}</b></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="card landing-cta-banner">
          <div>
            <span className="eyebrow">READY TO OPTIMIZE HEALTHCARE LOGISTICS?</span>
            <h2>Access the AarogyaGrid Operations Portal</h2>
            <p>Sign in with your certified health administrator credentials to access real-time telemetry and AI redistribution.</p>
          </div>
          <div className="landing-cta-actions">
            {user ? (
              <Link className="primary" to="/dashboard">Go to Dashboard →</Link>
            ) : (
              <Link className="primary" to="/login">Sign In to Portal →</Link>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <Brand />
              <p>AarogyaGrid AI is a predictive healthcare resource intelligence platform for primary health facilities.</p>
              <p className="landing-credit">Created by <b>CodeGoblins</b> · National Health Resource Network</p>
            </div>
            
            <nav className="landing-footer-links" aria-label="Footer navigation">
              <h2>Navigation</h2>
              <a href="#main-content">Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#architecture">Cloud Architecture</a>
              <a href="#faq">FAQs</a>
            </nav>

            <nav className="landing-footer-links" aria-label="Portal access">
              <h2>Portal Access</h2>
              <Link to="/login">Health Officer Login</Link>
              <Link to="/signup">Register Facility</Link>
              <a href="#faq">Security & Privacy</a>
              <a href="#faq">Compliance Standards</a>
            </nav>
          </div>

          <div className="landing-footer-bottom">
            <span>© {new Date().getFullYear()} AarogyaGrid AI · CodeGoblins · All Rights Reserved</span>
            <span>Predict. Share. Respond.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
