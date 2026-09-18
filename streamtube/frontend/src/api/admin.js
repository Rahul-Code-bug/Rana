import client from './client';

export async function adminListUsers(q = '') {
  const { data } = await client.get('/admin-panel/users/', { params: { q } });
  return data;
}
export async function adminUpdateUser(id, payload) {
  const { data } = await client.patch(`/admin-panel/users/${id}/`, payload);
  return data;
}
export async function adminDeleteUser(id) {
  await client.delete(`/admin-panel/users/${id}/`);
}

export async function adminListVideos(q = '') {
  const { data } = await client.get('/admin-panel/videos/', { params: { q } });
  return data;
}
export async function adminUpdateVideo(id, payload) {
  const { data } = await client.patch(`/admin-panel/videos/${id}/`, payload);
  return data;
}
export async function adminDeleteVideo(id) {
  await client.delete(`/admin-panel/videos/${id}/`);
}

export async function adminListComments() {
  const { data } = await client.get('/admin-panel/comments/');
  return data;
}
export async function adminDeleteComment(id) {
  await client.delete(`/admin-panel/comments/${id}/`);
}

export async function adminListReports(status) {
  const { data } = await client.get('/admin-panel/reports/', { params: { status } });
  return data;
}
export async function adminResolveReport(id, action, removeContent = false) {
  const { data } = await client.post(`/admin-panel/reports/${id}/resolve/`, { action, remove_content: removeContent });
  return data;
}

export async function adminListCategories() {
  const { data } = await client.get('/admin-panel/categories/');
  return data;
}
export async function adminCreateCategory(payload) {
  const { data } = await client.post('/admin-panel/categories/', payload);
  return data;
}
export async function adminUpdateCategory(id, payload) {
  const { data } = await client.patch(`/admin-panel/categories/${id}/`, payload);
  return data;
}
export async function adminDeleteCategory(id) {
  await client.delete(`/admin-panel/categories/${id}/`);
}
