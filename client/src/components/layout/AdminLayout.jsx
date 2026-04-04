import { NavLink } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
];

export default function AdminLayout({ children, title }) {
  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <div className="card p-3 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin Panel</p>
            <nav className="space-y-0.5">
              {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="text-sm shrink-0" /> {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <h1 className="section-heading text-2xl mb-6">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  );
}
