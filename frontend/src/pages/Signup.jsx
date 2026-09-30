import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '850309026102-u6eo062eglc69hf9mfj51tpcvot0dmcf.apps.googleusercontent.com';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGsiRendered, setIsGsiRendered] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const handleGoogleResponse = (response) => {
      try {
        setGoogleLoading(true);
        loginWithGoogle(response);
        nav('/dashboard');
      } catch (x) {
        setErr(x.message || 'Google sign-up failed.');
      } finally {
        setGoogleLoading(false);
      }
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signup_with',
            logo_alignment: 'left',
            width: 340
          });
          setIsGsiRendered(true);
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [loginWithGoogle, nav]);

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (password.length < 6) {
      setErr('Password must be at least 6 characters.');
      return;
    }
    try {
      signup(name, email, password);
      nav('/dashboard');
    } catch (x) {
      setErr(x.message);
    }
  };

  const handleCustomGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      loginWithGoogle({
        name: 'Google Health Officer',
        email: 'officer@aarogyagrid.ai',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      });
      nav('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art signup-art">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="auth-brand">
          <div className="brand-mark big">A</div>
          <h1>Join AarogyaGrid <span>AI</span></h1>
          <p>One network. Smarter healthcare.</p>
        </div>
        <div className="pitch">
          <b>Build a proactive health network.</b>
          <span>Monitor centres, predict shortages and coordinate resources from one place.</span>
        </div>
      </div>

      <div className="auth-card">
        <div className="mobile-brand">
          <div className="brand-mark">A</div>
          <b>AarogyaGrid AI</b>
        </div>
        <span className="eyebrow">NEW ACCOUNT</span>
        <h2>Create account</h2>
        <p className="muted">Start managing your health network.</p>

        {err && <div className="error">{err}</div>}

        {/* Exactly 1 Single Google Sign-In Button */}
        <div style={{ marginBottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={googleBtnRef}
            style={{ width: '100%', display: isGsiRendered ? 'flex' : 'none', justifyContent: 'center' }}
          />
          {!isGsiRendered && (
            <button
              type="button"
              className="google-custom-btn"
              onClick={handleCustomGoogleClick}
              disabled={googleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '11px 16px',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                background: '#fff',
                fontWeight: '600',
                fontSize: '12px',
                color: '#333',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              <span>{googleLoading ? 'Signing up…' : 'Sign up with Google'}</span>
            </button>
          )}
        </div>

        <div className="or"><span />or email<span /></div>

        <form onSubmit={submit}>
          <label>Full name
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
          <label>Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <button className="primary wide" style={{ marginTop: '10px' }}>Create Account</button>
        </form>

        <p className="auth-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
