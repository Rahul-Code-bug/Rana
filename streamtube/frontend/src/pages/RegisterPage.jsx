import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <h1 className="form-title">Create your account</h1>
      <p className="form-subtitle">Join StreamTube to upload, comment, and subscribe.</p>
      {error && <div className="form-error-box">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Username</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoFocus />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <p className="field-hint">At least 8 characters.</p>
        </div>
        <div className="field">
          <label>Confirm password</label>
          <input type="password" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="form-footer">Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link></p>
    </div>
  );
}
