const BASE = import.meta.env.VITE_API_BASE_URL || 'https://week6-lab-2.onrender.com';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('ไม่สามารถเชื่อมต่อ Server Backend ได้ (กรุณาเช็คว่ารัน npm run mock หรือยัง)');
  }

  // กรณีตอบกลับ 204 No Content (ไม่มี body)
  if (res.status === 204) return null;

  // รองรับกรณี fakeResponse ที่ไม่มี res.headers
  const contentType = res.headers?.get ? res.headers.get('content-type') : 'application/json';
  let data = {};

  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => {
      // เมื่อ res.json() พัง (เช่น เจอ SyntaxError / ไม่ใช่ JSON)
      throw new Error('server ไม่ได้ตอบเป็น JSON');
    });
  } else {
    throw new Error('server ไม่ได้ตอบเป็น JSON');
  }

  if (!res.ok) {
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- หนัง ----------
export function getMovies(query = '') {
  // เพิ่มการส่ง limit เพื่อปลดล็อกให้ Backend ส่งหนังกลับมาครบ 100 เรื่อง (ไม่ติด Pagination Default)
  let url = '/api/movies';
  
  if (query) {
    url += `?q=${encodeURIComponent(query)}&limit=100&_limit=100`;
  } else {
    url += '?limit=100&_limit=100&limit=0';
  }

  return apiFetch(url);
}

export function getMovieById(id) {
  return apiFetch(`/api/movies/${Number(id)}`);
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}

export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- รีวิว ----------
export function getReviews(movieId) {
  return apiFetch(`/api/movies/${Number(movieId)}/reviews`);
}

export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${Number(movieId)}/reviews`, { method: 'POST', body: { text }, token });
}

export function deleteReview(reviewId, token) {
  return apiFetch(`/api/reviews/${Number(reviewId)}`, { method: 'DELETE', token });
}

// ---------- คะแนน ----------
export function putVote(movieId, score, token) {
  return apiFetch(`/api/movies/${Number(movieId)}/vote`, {
    method: 'PUT',
    body: { score: Number(score) },
    token,
  });
}

export function deleteVote(movieId, token) {
  return apiFetch(`/api/movies/${Number(movieId)}/vote`, { method: 'DELETE', token });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });
}

export function addToWishlist(movieId, token) {
  const numId = Number(movieId);
  return apiFetch(`/api/me/wishlist/${numId}`, {
    method: 'PUT',
    token,
  });
}

export function removeFromWishlist(movieId, token) {
  const numId = Number(movieId);
  return apiFetch(`/api/me/wishlist/${numId}`, {
    method: 'DELETE',
    token,
  });
}
export async function getMovie(movieId) {
  const items = await getMovies();
  const movie = items.find(m => String(m.id) === String(movieId));
  if (!movie) {
    const err = new Error('ไม่พบหนังเรื่องนี้');
    err.status = 404;
    throw err;
  }
  return movie;
}