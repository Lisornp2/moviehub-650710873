

const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://week6-lab-2.onrender.com'
).replace(/\/+$/, '');


export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {};

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;

  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined && body !== null
        ? JSON.stringify(body)
        : undefined,
    });
  } catch {
    throw new Error(
      'ไม่สามารถเชื่อมต่อ Server Backend ได้ กรุณาตรวจสอบ URL และสถานะ Server'
    );
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get('content-type') || '';
  let data = {};

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server ส่ง JSON ไม่ถูกต้อง (HTTP ${res.status})`);
    }
  } else {
    const err = new Error(
      `Server ไม่ได้ตอบเป็น JSON (HTTP ${res.status})`
    );
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    const errorMessage =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message ||
          data.message ||
          `Server ตอบกลับ ${res.status}`;

    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ---------- หนัง ----------
export function getMovies(query = '') {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  params.set('limit', '100');

  return apiFetch(`/api/movies?${params.toString()}`);
}

export function getMovieById(id) {
  return apiFetch(`/api/movies/${Number(id)}`);
}

export async function getMovie(movieId) {
  const items = await getMovies();

  const movies = Array.isArray(items)
    ? items
    : Array.isArray(items?.data)
      ? items.data
      : Array.isArray(items?.movies)
        ? items.movies
        : [];

  const movie = movies.find(
    m => String(m.id) === String(movieId)
  );

  if (!movie) {
    const err = new Error('ไม่พบหนังเรื่องนี้');
    err.status = 404;
    throw err;
  }

  return movie;
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: { email, password, displayName },
  });
}

export function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- รีวิว ----------
export function getReviews(movieId) {
  return apiFetch(`/api/movies/${Number(movieId)}/reviews`);
}

export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${Number(movieId)}/reviews`, {
    method: 'POST',
    body: { text },
    token,
  });
}

export function deleteReview(reviewId, token) {
  return apiFetch(`/api/reviews/${Number(reviewId)}`, {
    method: 'DELETE',
    token,
  });
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
  return apiFetch(`/api/movies/${Number(movieId)}/vote`, {
    method: 'DELETE',
    token,
  });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });
}

export function addToWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${Number(movieId)}`, {
    method: 'PUT',
    token,
  });
}

export function removeFromWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${Number(movieId)}`, {
    method: 'DELETE',
    token,
  });
}
