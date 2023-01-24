import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/logos/Horizontal-White.png';

function Navigation() {
  return (
    <div className="bg-black text-white p-6 flex flex-row items-center justify-between text-lg">
      <div className="flex flex-row items-center space-x-10">
        <img src={Logo} alt="" className="h-7" />
        <p>Koululentovaraus</p>
      </div>
      <nav className="space-x-10 text-l">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive
            ? 'active font-bold'
            : '')}
        >
          Etusivu
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => (isActive
            ? 'active font-bold'
            : '')}
        >
          Kalenteri
        </NavLink>
      </nav>
    </div>
  );
}

export default Navigation;
