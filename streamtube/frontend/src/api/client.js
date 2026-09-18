import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
});

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem('streamtube_tokens') || 'null');
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (tokens) localStorage.setItem('streamtube_tokens', JSON.stringify(tokens));
  else localStorage.removeItem('streamtube_tokens');
}

client.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const tokens = getTokens();

    if (error.response?.status === 401 && tokens?.refresh && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE}/api/auth/login/refresh/`, { refresh: tokens.refresh })
            .finally(() => { refreshPromise = null; });
        }
        const { data } = await refreshPromise;
        setTokens({ ...tokens, access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch {
        setTokens(null);
        window.dispatchEvent(new Event('streamtube:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default client;
