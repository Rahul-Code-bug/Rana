import client from './client';

export async function fetchCategories() {
  const { data } = await client.get('/videos/categories/');
  return data;
}

export async function fetchFeed({ section = 'latest', category, channel, page = 1 } = {}) {
  const { data } = await client.get('/videos/', { params: { section, category, channel, page } });
  return data;
}

export async function searchVideos(params) {
  const { data } = await client.get('/videos/search/', { params });
  return data;
}

export async function fetchVideo(slug) {
  const { data } = await client.get(`/videos/${slug}/`);
  return data;
}

export async function fetchRelated(slug) {
  const { data } = await client.get(`/videos/${slug}/related/`);
  return data;
}

export async function recordView(slug, payload = {}) {
  const { data } = await client.post(`/videos/${slug}/view/`, payload);
  return data;
}

export async function reactToVideo(slug, type) {
  const { data } = await client.post(`/videos/${slug}/react/`, { type });
  return data;
}

export async function uploadVideo(formData, onUploadProgress) {
  const { data } = await client.post('/videos/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return data;
}

export async function fetchMyVideos(q = '') {
  const { data } = await client.get('/videos/manage/', { params: { q } });
  return data;
}

export async function updateVideo(slug, payload) {
  const isFormData = payload instanceof FormData;
  const { data } = await client.patch(`/videos/manage/${slug}/`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
}

export async function deleteVideo(slug) {
  await client.delete(`/videos/manage/${slug}/`);
}

// --- Chunked / resumable upload (for large files) ---

export async function initChunkedUpload(filename, totalSize) {
  const { data } = await client.post('/videos/uploads/init/', { filename, total_size: totalSize });
  return data;
}

export async function uploadChunk(uploadId, chunkBlob, onUploadProgress) {
  const { data } = await client.put(`/videos/uploads/${uploadId}/chunk/`, chunkBlob, {
    headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="chunk.bin"' },
    onUploadProgress,
  });
  return data;
}

export async function completeChunkedUpload(uploadId, metadata) {
  const { data } = await client.post(`/videos/uploads/${uploadId}/complete/`, metadata, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
