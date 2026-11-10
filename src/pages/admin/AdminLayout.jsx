
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

function AdminLayout() {
  const { member, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'จัดการเกม', icon: '🎮' },
    { name: 'จัดการ CD-Key', icon: '🔑' },
    { name: 'จัดการคำสั่งซื้อ', icon: '📦' },
    { name: 'จัดการสมาชิก', icon: '👥' },
    { name: 'รายงานยอดขาย', icon: '📈' }
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white md:flex">
      <aside className="w-full border-b border-white/10 bg-[#10101a] md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-white/10 px-6 py-6">
          <Link to="/" className="text-2xl font-black tracking-tight">
            <span className="text-purple-500">GAME</span>KEY
            <span className="ml-2 text-xs font-normal text-gray-500">
              ADMIN
            </span>
          </Link>
          <p className="mt-2 text-xs text-gray-500">
            ระบบจัดการร้านค้า
          </p>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            เมนูหลัก
          </p>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const isCurrent = item.path === location.pathname;

              return item.path ? (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isCurrent
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              ) : (
                <div
                  key={item.name}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600"
                  title="กำลังพัฒนา"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <span className="ml-auto text-[10px]">เร็ว ๆ นี้</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5">
          <p className="text-sm font-semibold text-white">
            {member?.displayName || 'Admin'}
          </p>
          <p className="mt-1 text-xs text-purple-400">
            Administrator
          </p>

          <Link
            to="/"
            className="mb-2 mt-4 block rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            ← กลับหน้าร้านค้า
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="border-b border-white/10 bg-[#0c0c14] px-6 py-5 md:px-8">
          <p className="text-sm text-gray-500">
            GAMEKEY STORE / ADMIN
          </p>
          <h1 className="mt-1 text-xl font-bold">
            ระบบจัดการร้านค้า
          </h1>
        </header>

        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
