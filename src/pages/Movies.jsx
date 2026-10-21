import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../api/backend';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // ---------- ระบบ Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // กำหนดจำนวนหนังต่อ 1 หน้า (ปรับเปลี่ยนได้ตามต้องการ)

  const fetchMoviesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMovies();

      let extractedMovies = [];
      if (Array.isArray(response)) {
        extractedMovies = response;
      } else if (response && typeof response === 'object') {
        const possibleArray = 
          response.movies || 
          response.data || 
          response.results || 
          response.items || 
          response.payload ||
          Object.values(response).find((val) => Array.isArray(val));

        extractedMovies = Array.isArray(possibleArray) ? possibleArray : [];
      }

      setMovies(extractedMovies);
    } catch (err) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, []);

  // เมื่อเปลี่ยนคำค้นหาหรือหมวดหมู่ ให้รีเซ็ตกลับไปหน้า 1 เสมอ
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre]);

  if (loading) {
    return <div className="p-4 text-center">กำลังโหลด...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">โหลดข้อมูลไม่สำเร็จ</h2>
        <p className="mb-4 text-gray-600">{error}</p>
        <button 
          onClick={fetchMoviesData}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  const movieList = Array.isArray(movies) ? movies : [];

  // ดึงรายการหมวดหมู่
  const genres = Array.from(
    new Set(
      movieList
        .map((m) => m?.genre || m?.category)
        .filter((g) => Boolean(g) && typeof g === 'string')
    )
  );

  // กรองหนัง
  const filteredMovies = movieList.filter((movie) => {
    const titleText = (movie?.title || movie?.titleTh || movie?.name || '').toString().toLowerCase();
    const queryText = searchQuery.trim().toLowerCase();

    const matchesSearch = queryText === '' ? true : titleText.includes(queryText);
    const movieGenre = movie?.genre || movie?.category;
    const matchesGenre = selectedGenre ? movieGenre === selectedGenre : true;

    return matchesSearch && matchesGenre;
  });

  // คำนวณการแบ่งหน้า (Pagination Logic)
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันดึง URL รูปโปสเตอร์
  const getPosterUrl = (movie) => {
    const path = movie?.poster_path || movie?.poster || movie?.image || movie?.cover;
    if (!path) return 'https://via.placeholder.com/300x450?text=No+Image';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w500${path}`;
    return path;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* ช่องค้นหา */}
      <input
        type="text"
        placeholder="พิมพ์ชื่อหนัง..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-md"
      />

      {/* ปุ่มเลือกประเภทหนัง */}
      {genres.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3 py-1 rounded transition ${selectedGenre === '' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
          >
            ทั้งหมด
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
              className={`px-3 py-1 rounded transition ${selectedGenre === genre ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* รายการหนังประจำหน้านั้นๆ */}
      {filteredMovies.length === 0 ? (
        <div className="text-gray-500 py-4">ไม่พบรายการหนัง</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
            {currentMovies.map((movie, index) => {
              const movieId = movie.id || movie._id || index;
              const movieTitle = movie.title || movie.titleTh || movie.name || 'ไม่มีชื่อเรื่อง';
              const movieGenre = movie.genre || movie.category;
              const posterSrc = getPosterUrl(movie);

              return (
                <Link 
                  key={movieId} 
                  to={`/movies/${movieId}`}
                  className="group border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white flex flex-col"
                >
                  <div className="aspect-[2/3] w-full bg-gray-100 overflow-hidden relative">
                    <img 
                      src={posterSrc} 
                      alt={movieTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-base text-gray-800 line-clamp-2">{movieTitle}</h3>
                    {movieGenre && <span className="text-xs text-gray-500 mt-1 block">{movieGenre}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ---------- แถบปุ่มเลือกหน้าข้างล่าง (Pagination) ---------- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 my-8">
              {/* ปุ่ม ก่อนหน้า */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-emerald-600 border-emerald-600 disabled:opacity-40 disabled:border-gray-300 disabled:text-gray-400 hover:bg-emerald-50 transition"
              >
                ก่อนหน้า
              </button>

              {/* ข้อความแสดงสถานะหน้า เช่น "ชุดที่ 1 จาก 9" */}
              <span className="text-sm text-gray-600 px-2">
                ชุดที่ <strong className="text-emerald-600">{currentPage}</strong> จาก <strong>{totalPages}</strong>
              </span>

              {/* ปุ่ม ถัดไป */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-emerald-600 border-emerald-600 disabled:opacity-40 disabled:border-gray-300 disabled:text-gray-400 hover:bg-emerald-50 transition"
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}