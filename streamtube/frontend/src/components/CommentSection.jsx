import { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Flag, Trash2, MoreVertical } from 'lucide-react';
import Avatar from './Avatar';
import { timeAgo, formatCount } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast, extractErrorMessage } from '../context/ToastContext';
import * as socialApi from '../api/social';

export default function CommentSection({ video }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [sort, setSort] = useState('top');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = () => {
    setLoading(true);
    socialApi.fetchComments(video.slug, { sort }).then((d) => setComments(d.results)).finally(() => setLoading(false));
  };

  useEffect(load, [video.slug, sort]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const c = await socialApi.postComment(video.id, text.trim());
      setComments((prev) => [c, ...prev]);
      setText('');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setPosting(false);
    }
  };

  if (!video.allow_comments) {
    return <p className="muted" style={{ marginTop: 24 }}>Comments are disabled for this video.</p>;
  }

  return (
    <div className="comments-section">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{formatCount(video.comment_count)} Comments</h3>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="chip" style={{ background: 'transparent' }}>
          <option value="top">Top comments</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <Avatar src={user.avatar} name={user.username} size="sm" />
          <textarea
            className="comment-input" rows={1} placeholder="Add a public comment..."
            value={text} onChange={(e) => setText(e.target.value)}
          />
          {text.trim() && (
            <button className="btn btn-primary btn-sm" disabled={posting}>{posting ? 'Posting...' : 'Comment'}</button>
          )}
        </form>
      ) : (
        <p className="muted" style={{ marginBottom: 16, fontSize: 13.5 }}>Sign in to leave a comment.</p>
      )}

      {loading ? <p className="muted">Loading comments...</p> : comments.length === 0 ? (
        <p className="muted">No comments yet. Be the first to say something.</p>
      ) : (
        comments.map((c) => (
          <CommentItem key={c.id} comment={c} videoId={video.id} videoSlug={video.slug} currentUser={user} />
        ))
      )}
    </div>
  );
}

function CommentItem({ comment, videoId, videoSlug, currentUser }) {
  const { showToast } = useToast();
  const [liked, setLiked] = useState(comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deleted, setDeleted] = useState(comment.is_deleted);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLike = async () => {
    if (!currentUser) return showToast('Sign in to like comments.', 'error');
    try {
      const r = await socialApi.toggleCommentLike(comment.id);
      setLiked(r.liked);
      setLikeCount(r.like_count);
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const loadReplies = async () => {
    setShowReplies((v) => !v);
    if (!showReplies && replies.length === 0 && comment.reply_count > 0) {
      const d = await socialApi.fetchComments(videoSlug, { parent: comment.id });
      setReplies(d.results);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const r = await socialApi.postComment(videoId, replyText.trim(), comment.id);
    setReplies((prev) => [...prev, r]);
    setReplyText('');
    setReplyOpen(false);
    setShowReplies(true);
  };

  const remove = async () => {
    try {
      await socialApi.deleteComment(comment.id);
      setDeleted(true);
      setMenuOpen(false);
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const report = async () => {
    try {
      await socialApi.reportContent({ target_type: 'comment', comment: comment.id, reason: 'other' });
      showToast('Comment reported.', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
    setMenuOpen(false);
  };

  const isOwner = currentUser && currentUser.id === comment.user.id;

  return (
    <div className="comment-item">
      <Avatar src={comment.user.avatar} name={comment.user.username} size="sm" />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.user.username}</span>
          <span className="comment-time">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="comment-text">{deleted ? <em className="muted">[deleted]</em> : comment.text}</p>
        {!deleted && (
          <div className="comment-actions">
            <button className={liked ? 'active' : ''} onClick={toggleLike}><ThumbsUp size={13} /> {likeCount > 0 ? likeCount : ''}</button>
            {!comment.parent && <button onClick={() => setReplyOpen((v) => !v)}><MessageSquare size={13} /> Reply</button>}
            {comment.reply_count > 0 && (
              <button onClick={loadReplies}>{showReplies ? 'Hide replies' : `${comment.reply_count} replies`}</button>
            )}
            <div style={{ position: 'relative', marginLeft: 'auto' }}>
              <button onClick={() => setMenuOpen((v) => !v)}><MoreVertical size={13} /></button>
              {menuOpen && (
                <div className="dropdown-menu" style={{ minWidth: 140 }}>
                  {isOwner ? (
                    <button className="dropdown-item" onClick={remove}><Trash2 size={14} /> Delete</button>
                  ) : (
                    <button className="dropdown-item" onClick={report}><Flag size={14} /> Report</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {replyOpen && (
          <form className="comment-form" onSubmit={submitReply} style={{ marginTop: 10 }}>
            <textarea className="comment-input" rows={1} placeholder="Reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} autoFocus />
            {replyText.trim() && <button className="btn btn-primary btn-sm">Reply</button>}
          </form>
        )}
        {showReplies && replies.length > 0 && (
          <div className="reply-block">
            {replies.map((r) => <CommentItem key={r.id} comment={r} videoId={videoId} videoSlug={videoSlug} currentUser={currentUser} />)}
          </div>
        )}
      </div>
    </div>
  );
}
