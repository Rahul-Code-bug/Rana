import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, extractErrorMessage } from '../context/ToastContext';
import * as authApi from '../api/auth';
import * as socialApi from '../api/social';
import Avatar from '../components/Avatar';

const TABS = ['Profile', 'Channel', 'Security'];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('Profile');

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <div className="tabs">
        {TABS.map((t) => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Profile' && <ProfileTab user={user} refreshUser={refreshUser} showToast={showToast} />}
      {tab === 'Channel' && <ChannelTab showToast={showToast} />}
      {tab === 'Security' && <SecurityTab showToast={showToast} />}
    </div>
  );
}

function ProfileTab({ user, refreshUser, showToast }) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('username', username);
      fd.append('bio', bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      await authApi.updateProfile(fd);
      await refreshUser();
      showToast('Profile updated.', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <form className="panel" style={{ maxWidth: 480 }} onSubmit={submit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Avatar src={preview} name={username} size="lg" />
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          Change avatar
          <input type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files[0];
            if (f) { setAvatarFile(f); setPreview(URL.createObjectURL(f)); }
          }} />
        </label>
      </div>
      <div className="field">
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="field">
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={1000} />
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
    </form>
  );
}

function ChannelTab({ showToast }) {
  const [channel, setChannel] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    socialApi.fetchMyChannel().then((c) => { setChannel(c); setLoaded(true); });
  }, []);

  if (!loaded) return <p className="muted">Loading...</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', channel.name);
      fd.append('description', channel.description || '');
      fd.append('social_links', JSON.stringify(channel.social_links || {}));
      if (bannerFile) fd.append('banner', bannerFile);
      const updated = await socialApi.updateMyChannel(fd);
      setChannel(updated);
      showToast('Channel updated.', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <form className="panel" style={{ maxWidth: 480 }} onSubmit={submit}>
      <div className="field">
        <label>Channel name</label>
        <input value={channel.name} onChange={(e) => setChannel({ ...channel, name: e.target.value })} required />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea value={channel.description} onChange={(e) => setChannel({ ...channel, description: e.target.value })} rows={4} />
      </div>
      <div className="field">
        <label>Website</label>
        <input value={channel.social_links?.website || ''} onChange={(e) => setChannel({ ...channel, social_links: { ...channel.social_links, website: e.target.value } })} />
      </div>
      <div className="field">
        <label>Banner image</label>
        <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save channel'}</button>
    </form>
  );
}

function SecurityTab({ showToast }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      showToast('Password changed successfully.', 'success');
      setOldPw(''); setNewPw('');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <form className="panel" style={{ maxWidth: 420 }} onSubmit={submit}>
      <div className="field">
        <label>Current password</label>
        <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
      </div>
      <div className="field">
        <label>New password</label>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Updating...' : 'Change password'}</button>
    </form>
  );
}
