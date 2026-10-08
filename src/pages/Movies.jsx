import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../api/backend';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const fetchMoviesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovies();
      setMovies(data || []);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, []);

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>โหลดข้อมูลไม่สำเร็จ</h2>
        <p>{error}</p>
        <button onClick={fetchMoviesData}>ลองใหม่</button>
      </div>
    );
  }

  const genres = Array.from(new Set(movies.map((m) => m.genre).filter(Boolean)));

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.titleTh?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre ? movie.genre === selectedGenre : true;
    return matchesSearch && matchesGenre;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="พิมพ์ชื่อหนัง..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <div>
        {filteredMovies.map((movie) => (
          <Link key={movie.id} to={`/movies/${movie.id}`}>
            <h3>{movie.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}