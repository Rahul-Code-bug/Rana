import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '../api/auth';
import { extractErrorMessage } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <h1 className="form-title">Reset your password</h1>
      <p className="form-subtitle">We'll email you a link to reset it.</p>
      {error && <div className="form-error-box">{error}</div>}
      {sent ? (
        <div className="form-success-box">If that email exists, a reset link has been sent. Check the server console in development.</div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
        </form>
      )}
      <p className="form-footer"><Link to="/login" style={{ color: 'var(--accent)' }}>Back to sign in</Link></p>
    </div>
  );
}
