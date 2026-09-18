import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import * as videosApi from '../api/videos';
import { useToast, extractErrorMessage } from '../context/ToastContext';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB — mirrors backend's recommended chunk size
const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024; // use chunked upload above this size

export default function UploadPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', category: '', language: 'en',
    tags: '', visibility: 'public', status: 'published',
    allow_comments: true, allow_download: false, made_for_kids: false,
  });

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | uploading | done | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { videosApi.fetchCategories().then(setCategories).catch(() => {}); }, []);

  const onFileChange = (f) => {
    if (!f) return;
    setFile(f);
    if (!form.title) setForm((s) => ({ ...s, title: f.name.replace(/\.[^.]+$/, '') }));
  };

  const onThumbChange = (f) => {
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const buildMetadata = (asFormData) => {
    const tagList = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (asFormData) {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.category) fd.append('category', form.category);
      fd.append('language', form.language);
      tagList.forEach((t) => fd.append('tags', t));
      fd.append('visibility', form.visibility);
      fd.append('status', form.status);
      fd.append('allow_comments', String(form.allow_comments));
      fd.append('allow_download', String(form.allow_download));
      fd.append('made_for_kids', String(form.made_for_kids));
      if (thumbFile) fd.append('thumbnail', thumbFile);
      return fd;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return showToast('Select a video file first.', 'error');
    setPhase('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      if (file.size > LARGE_FILE_THRESHOLD) {
        await uploadInChunks();
      } else {
        const fd = buildMetadata(true);
        fd.append('original_file', file);
        await videosApi.uploadVideo(fd, (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        });
      }
      setPhase('done');
      showToast('Video uploaded! Processing will finish shortly.', 'success');
      setTimeout(() => navigate(`/studio/videos`), 1200);
    } catch (err) {
      setPhase('error');
      setErrorMsg(extractErrorMessage(err));
    }
  };

  const uploadInChunks = async () => {
    const { upload_id } = await videosApi.initChunkedUpload(file.name, file.size);
    let uploaded = 0;
    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const chunk = file.slice(start, start + CHUNK_SIZE);
      await videosApi.uploadChunk(upload_id, chunk, (evt) => {
        setProgress(Math.round(((uploaded + evt.loaded) / file.size) * 100));
      });
      uploaded += chunk.size;
    }
    const fd = buildMetadata(true);
    return videosApi.completeChunkedUpload(upload_id, fd);
  };

  return (
    <div>
      <h1 className="page-title">Upload video</h1>
      <form onSubmit={submit} className="upload-grid">
        <div>
          {!file ? (
            <div className="dropzone" onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={40} style={{ marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>Click to select a video file</p>
              <p className="muted" style={{ fontSize: 13 }}>MP4, MOV, MKV, WEBM or AVI — resumable upload for large files</p>
              <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={(e) => onFileChange(e.target.files[0])} />
            </div>
          ) : (
            <div className="panel">
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
              <p className="muted" style={{ fontSize: 13 }}>{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              {phase === 'uploading' && (
                <>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>Uploading... {progress}%</p>
                </>
              )}
              {phase === 'done' && (
                <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <CheckCircle2 size={16} /> Uploaded — processing in the background.
                </p>
              )}
              {phase === 'error' && <div className="form-error-box" style={{ marginTop: 10 }}>{errorMsg}</div>}
              {phase === 'idle' && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFile(null)} style={{ marginTop: 8 }}>Change file</button>
              )}
            </div>
          )}

          <div className="field" style={{ marginTop: 20 }}>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} />
          </div>
          <div className="field">
            <label>Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="cooking, tutorial, recipe" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Language</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 10 }}>Thumbnail</p>
            {thumbPreview ? (
              <img src={thumbPreview} alt="thumbnail preview" className="thumb-preview" />
            ) : (
              <div className="thumb-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={28} className="muted" />
              </div>
            )}
            <button type="button" className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 10 }} onClick={() => thumbInputRef.current.click()}>
              Upload thumbnail
            </button>
            <p className="field-hint">Optional — one will be auto-generated from your video if left blank.</p>
            <input ref={thumbInputRef} type="file" accept="image/*" hidden onChange={(e) => onThumbChange(e.target.files[0])} />
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 10 }}>Visibility</p>
            {['public', 'unlisted', 'private'].map((v) => (
              <label key={v} className="checkbox-row" style={{ marginBottom: 10, textTransform: 'capitalize' }}>
                <input type="radio" name="visibility" checked={form.visibility === v} onChange={() => setForm({ ...form, visibility: v })} />
                {v}
              </label>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
            <label className="checkbox-row" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={form.allow_comments} onChange={(e) => setForm({ ...form, allow_comments: e.target.checked })} />
              Allow comments
            </label>
            <label className="checkbox-row" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={form.allow_download} onChange={(e) => setForm({ ...form, allow_download: e.target.checked })} />
              Allow download
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.made_for_kids} onChange={(e) => setForm({ ...form, made_for_kids: e.target.checked })} />
              Made for kids
            </label>
          </div>

          <button className="btn btn-secondary btn-block" type="submit" onClick={() => setForm((s) => ({ ...s, status: 'draft' }))} style={{ marginBottom: 10 }} disabled={phase === 'uploading'}>
            Save as draft
          </button>
          <button className="btn btn-primary btn-block" type="submit" onClick={() => setForm((s) => ({ ...s, status: 'published' }))} disabled={phase === 'uploading'}>
            {phase === 'uploading' ? 'Uploading...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
