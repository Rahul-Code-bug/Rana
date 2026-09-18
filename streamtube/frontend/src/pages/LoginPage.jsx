import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <h1 className="form-title">Welcome back</h1>
      <p className="form-subtitle">Sign in to continue to StreamTube.</p>
      {error && <div className="form-error-box">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Username</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <span />
          <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)' }}>Forgot password?</Link>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="form-footer">Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link></p>
    </div>
  );
}
