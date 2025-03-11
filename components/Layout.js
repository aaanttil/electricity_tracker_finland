import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationButtons } from './NavigationButtons'; // Import the NavigationButtons component
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationMenu from './NavigationMenu'; // Import the NavigationMenu component

process.env.TZ = 'Europe/Helsinki';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-dark bg-opacity-75 text-light">
        <div className="container">
          <Link href="/" className="navbar-brand text-light">
            Pörssisähkö
          </Link>

          {/* Dropdown Menu Button with Small Screens */}
          <div className="d-lg-none position-relative">
            <button
              className="navbar-toggler btn btn-light"
              type="button"
              onClick={handleMenuToggle}
              aria-controls="navbarNav"
              aria-expanded={menuOpen ? 'true' : 'false'}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            {menuOpen && <NavigationMenu closeMenu={closeMenu} />}
          </div>

          {/* Normal Navbar for Larger Screens */}
          <div className="collapse navbar-collapse d-none d-lg-block">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavigationButtons />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
