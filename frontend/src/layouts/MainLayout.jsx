import { NavLink, Outlet, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/invest', label: 'Invest' },
  { to: '/notice', label: 'Notice' },
  { to: '/blog', label: 'Blog' },
  { to: '/account', label: 'Account' },
];

function getTitle(pathname) {
  if (pathname.startsWith('/invest')) return 'Investment Products';
  if (pathname.startsWith('/notice')) return 'System Notices';
  if (pathname.startsWith('/blog')) return 'Investment Blog';
  if (pathname.startsWith('/account')) return 'My Account';
  if (pathname.startsWith('/help')) return 'Help Center';
  return 'Home';
}

function MainLayout() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo-text">TurboWealth</div>
          <div className="app-header-title">{title}</div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `bottom-nav-link${isActive ? ' bottom-nav-link-active' : ''}`
            }
            end={tab.to === '/'}
          >
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default MainLayout;
