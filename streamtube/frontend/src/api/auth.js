import client, { setTokens } from './client';

export async function register(payload) {
  const { data } = await client.post('/auth/register/', payload);
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function login(username, password) {
  const { data } = await client.post('/auth/login/', { username, password });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function logout() {
  const tokens = JSON.parse(localStorage.getItem('streamtube_tokens') || 'null');
  try {
    if (tokens?.refresh) await client.post('/auth/logout/', { refresh: tokens.refresh });
  } catch { /* ignore */ }
  setTokens(null);
}

export async function fetchMe() {
  const { data } = await client.get('/auth/me/');
  return data;
}

export async function updateProfile(payload) {
  const isFormData = payload instanceof FormData;
  const { data } = await client.patch('/auth/me/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
}

export async function changePassword(old_password, new_password) {
  const { data } = await client.post('/auth/change-password/', { old_password, new_password });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await client.post('/auth/password-reset/', { email });
  return data;
}

export async function confirmPasswordReset(uid, token, new_password) {
  const { data } = await client.post('/auth/password-reset/confirm/', { uid, token, new_password });
  return data;
}

export async function verifyEmail(token) {
  const { data } = await client.post('/auth/verify-email/', { token });
  return data;
}
