// src/pages/Wishlist.jsx

import { useEffect, useState } from 'react';
import MovieGrid from '../components/MovieGrid';
import { useAuth } from '../auth/AuthContext';
import { getWishlist } from '../api/backend';

function Wishlist() {
  const { token, member, isLoggedIn } = useAuth();

  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus('loading');
      try {
        const data = await getWishlist(token);
        if (!ignore) {
          const rawItems = Array.isArray(data) ? data : (data?.items || []);
          
          // แปลง Format ข้อมูลรูปภาพและชื่อเรื่องให้ตรงกับ MovieCard
          const formattedMovies = rawItems.map((item) => {
            const m = item.movie || item;
            return {
              ...m,
              id: Number(m.id || m.movieId),
              title: m.title || m.titleTh || m.name,
              posterPath: m.posterPath || m.poster_path || m.poster,
              voteAverage: m.voteAverage || m.vote_average || m.memberRating || 0,
              releaseYear: m.releaseYear || m.year || (m.releaseDate ? m.releaseDate.substring(0, 4) : ''),
            };
          });

          setMovies(formattedMovies);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }

    if (isLoggedIn && token) {
      load();
    } else {
      setStatus('error');
      setError(new Error('กรุณาเข้าสู่ระบบก่อนดูรายการที่อยากดู'));
    }

    return () => {
      ignore = true;
    };
  }, [token, isLoggedIn]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        รายการที่อยากดูของ {member?.displayName || member?.email || 'สมาชิก'}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        รายการหนังที่คุณได้กดปุ่มหัวใจเพิ่มไว้
      </p>
      <MovieGrid movies={movies} status={status} error={error} />
    </div>
  );
}

export default Wishlist;