import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as authApi from '../api/auth';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="auth-shell">
      <h1 className="form-title">Email verification</h1>
      {status === 'verifying' && <p className="muted">Verifying your email...</p>}
      {status === 'success' && <div className="form-success-box">Your email has been verified!</div>}
      {status === 'error' && <div className="form-error-box">This verification link is invalid or has expired.</div>}
      <Link to="/" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Continue to StreamTube</Link>
    </div>
  );
}
