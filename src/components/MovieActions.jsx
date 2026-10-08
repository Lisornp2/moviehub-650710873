import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { putVote, addToWishlist, removeFromWishlist, getWishlist } from '../api/backend';

function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();
  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);

  const safeId = Number(movieId);

  // ดึงรายการ Wishlist เพื่อเช็คสถานะเริ่มต้นของปุ่มหัวใจ
  useEffect(() => {
    if (isLoggedIn && token) {
      getWishlist(token)
        .then((data) => {
          const items = Array.isArray(data) ? data : (data?.items || []);
          const exists = items.some((item) => (item.id || item.movieId) === safeId);
          setInWishlist(exists);
        })
        .catch(() => {});
    }
  }, [isLoggedIn, token, safeId]);

  if (!isLoggedIn) {
    return (
      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
        กรุณา <Link to="/login" className="font-semibold text-emerald-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </div>
    );
  }

  async function handleVote(score) {
    setMessage(null);
    try {
      await putVote(safeId, score, token);
      setMyScore(score);
      setMessage(`ให้คะแนน ${score}/10 เรียบร้อยแล้ว!`);
    } catch (err) {
      setMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกคะแนน');
    }
  }

  async function handleWishlist() {
    setMessage(null);
    try {
      if (inWishlist) {
        await removeFromWishlist(safeId, token);
        setInWishlist(false);
        setMessage('นำออกจากรายการที่อยากดูแล้ว');
      } else {
        await addToWishlist(safeId, token);
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากดูแล้ว!');
      }
    } catch (err) {
      setMessage(err.message || 'เกิดข้อผิดพลาดในการอัปเดตรายการที่อยากดู');
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm font-medium text-slate-600">ให้คะแนน</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleVote(n)}
            className={
              'h-8 w-8 rounded-lg border text-sm font-medium transition ' +
              (myScore === n
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
            }
          >
            {n}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleWishlist}
        className={
          'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ' +
          (inWishlist
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
        }
      >
        {inWishlist ? '❤️ อยู่ในรายการที่อยากดูแล้ว' : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
    </div>
  );
}

export default MovieActions;