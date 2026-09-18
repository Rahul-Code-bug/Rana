import client from './client';

// --- Channels ---
export async function fetchChannel(slug) {
  const { data } = await client.get(`/channels/${slug}/`);
  return data;
}
export async function fetchMyChannel() {
  const { data } = await client.get('/channels/me/');
  return data;
}
export async function updateMyChannel(payload) {
  const isFormData = payload instanceof FormData;
  const { data } = await client.patch('/channels/me/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
}

// --- Comments ---
export async function fetchComments(videoSlug, { parent, sort = 'top' } = {}) {
  const { data } = await client.get('/comments/', { params: { video: videoSlug, parent, sort } });
  return data;
}
export async function postComment(videoId, text, parent = null) {
  const { data } = await client.post('/comments/', { video: videoId, text, parent });
  return data;
}
export async function updateComment(id, text) {
  const { data } = await client.patch(`/comments/${id}/`, { text });
  return data;
}
export async function deleteComment(id) {
  await client.delete(`/comments/${id}/`);
}
export async function toggleCommentLike(id) {
  const { data } = await client.post(`/comments/${id}/like/`);
  return data;
}
export async function reportContent(payload) {
  const { data } = await client.post('/comments/reports/', payload);
  return data;
}

// --- Subscriptions ---
export async function toggleSubscription(channelSlug) {
  const { data } = await client.post(`/subscriptions/${channelSlug}/toggle/`);
  return data;
}
export async function fetchMySubscriptions() {
  const { data } = await client.get('/subscriptions/');
  return data;
}
export async function fetchSubscriptionFeed(page = 1) {
  const { data } = await client.get('/subscriptions/feed/', { params: { page } });
  return data;
}

// --- Playlists ---
export async function fetchPlaylists() {
  const { data } = await client.get('/playlists/');
  return data;
}
export async function fetchPlaylist(id) {
  const { data } = await client.get(`/playlists/${id}/`);
  return data;
}
export async function createPlaylist(payload) {
  const { data } = await client.post('/playlists/', payload);
  return data;
}
export async function deletePlaylist(id) {
  await client.delete(`/playlists/${id}/`);
}
export async function addToPlaylist(id, videoSlug) {
  const { data } = await client.post(`/playlists/${id}/items/`, { video_slug: videoSlug });
  return data;
}
export async function removeFromPlaylist(id, itemId) {
  await client.delete(`/playlists/${id}/items/${itemId}/`);
}

// --- History / Watch later ---
export async function fetchHistory() {
  const { data } = await client.get('/history/');
  return data;
}
export async function upsertHistory(videoSlug, progressSeconds) {
  const { data } = await client.post('/history/upsert/', { video_slug: videoSlug, progress_seconds: progressSeconds });
  return data;
}
export async function deleteHistoryItem(id) {
  await client.delete(`/history/${id}/`);
}
export async function clearHistory() {
  await client.delete('/history/clear/');
}
export async function fetchWatchLater() {
  const { data } = await client.get('/history/watch-later/');
  return data;
}
export async function addWatchLater(videoSlug) {
  const { data } = await client.post('/history/watch-later/', { video_slug: videoSlug });
  return data;
}
export async function removeWatchLater(id) {
  await client.delete(`/history/watch-later/${id}/`);
}

// --- Notifications ---
export async function fetchNotifications() {
  const { data } = await client.get('/notifications/');
  return data;
}
export async function fetchUnreadCount() {
  const { data } = await client.get('/notifications/unread-count/');
  return data;
}
export async function markNotificationRead(id) {
  await client.post(`/notifications/${id}/read/`);
}
export async function markAllNotificationsRead() {
  await client.post('/notifications/read-all/');
}

// --- Analytics ---
export async function fetchAnalyticsSummary() {
  const { data } = await client.get('/analytics/summary/');
  return data;
}
export async function fetchAnalyticsTimeseries(days = 30) {
  const { data } = await client.get('/analytics/timeseries/', { params: { days } });
  return data;
}
