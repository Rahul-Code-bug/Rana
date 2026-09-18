import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../api/auth';
import { extractErrorMessage } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const uid = params.get('uid');
  const token = params.get('token');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await authApi.confirmPasswordReset(uid, token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="auth-shell">
        <h1 className="form-title">Invalid reset link</h1>
        <p className="form-subtitle">This password reset link is missing required information.</p>
        <Link to="/forgot-password" className="btn btn-primary btn-block">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <h1 className="form-title">Choose a new password</h1>
      {error && <div className="form-error-box">{error}</div>}
      {done ? (
        <div className="form-success-box">Password reset! Redirecting to sign in...</div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label>New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Reset password'}</button>
        </form>
      )}
    </div>
  );
}
