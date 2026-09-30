import React from 'react';
import { Link } from 'react-router-dom';

export default function Brand({ className = '' }) {
  return (
    <Link to="/" className={`brand brand-link ${className}`} aria-label="AarogyaGrid home">
      <span className="brand-mark" aria-hidden="true">A</span>
      <span className="brand-copy"><b>AarogyaGrid</b><small>AI HEALTH NETWORK</small></span>
    </Link>
  );
}
