

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "./Navbar.css";




function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleLogoutClick() {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  }



  return (
    <nav className='navbar'>
      <h1>Grocery Store</h1>
      <ul>
        {isLoggedIn && (
        <li>
          <Link to="/billing" className={location.pathname.startsWith('/billing') ? 'active-tab' : ''}>Billing</Link>
        </li>
        )}
        {isLoggedIn && (
        <li>
          <Link to="/stock" className={location.pathname.startsWith('/stock') ? 'active-tab' : ''}>Stock</Link>
        </li>
        )}
        {isLoggedIn && (
        <li>
          <Link to="/analysis" className={location.pathname.startsWith('/analysis') ? 'active-tab' : ''}>Analysis</Link>
        </li>
        )}

        {isLoggedIn && (
          <li style={{ position: 'relative' }} ref={menuRef}>
            <div
              className={`profile-avatar${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              tabIndex={0}
            >
              <span className='profile-avatar-icon'>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#fff"/><rect x="4" y="16" width="16" height="6" rx="3" fill="#fff"/></svg>
              </span>
            </div>
            {menuOpen && (
              <div className='profile-menu-dropdown'>
                <a
                  className='profile-menu-item'
                  onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                >
                  Account Settings
                </a>
                <a
                  className='profile-menu-item logout'
                  onClick={() => { setMenuOpen(false); handleLogoutClick(); }}
                >
                  Logout
                </a>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
