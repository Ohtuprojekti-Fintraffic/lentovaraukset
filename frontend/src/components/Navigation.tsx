import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/logos/Horizontal-White.png';

function Navigation() {
  return (
    <div className="bg-black text-white p-6 flex flex-row items-center justify-between text-lg h-full max-h-20 top-0">
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
          Varaukset
        </NavLink>
        <NavLink
          to="/varausikkunat"
          className={({ isActive }) => (isActive
            ? 'active font-bold'
            : '')}
        >
          Varausikkunat
        </NavLink>
        <NavLink
          to="/hallinta"
          className={({ isActive }) => (isActive
            ? 'active font-bold'
            : '')}
        >
          Hallinta
        </NavLink>
      </nav>
    </div>
  );
}

export default Navigation;
