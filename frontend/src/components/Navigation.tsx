import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/logos/Horizontal-White.png';

function Navigation() {
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => {
    const baseStyle = 'hover:text-ft-text-300';
    return isActive ? `${baseStyle} active font-bold` : baseStyle;
  };

  return (
    <div className="bg-black text-white p-6 flex flex-row items-center justify-between text-lg h-full max-h-20 top-0 overflow-x-auto">

      <div className="flex flex-row items-center space-x-10 w-fit">

        <NavLink to="/" className={navLinkStyle}>
          <img src={Logo} alt="" className="h-7" />
        </NavLink>
        <p>Koululentovaraus</p>

      </div>

      <nav className="flex flex-row space-x-10 text-l">

        <NavLink to="/varaukset" className={navLinkStyle}>
          Varaukset
        </NavLink>

        <NavLink to="/varausikkunat" className={navLinkStyle}>
          Varausikkunat
        </NavLink>

        <NavLink to="/hallinta" className={navLinkStyle}>
          Hallinta
        </NavLink>
        <NavLink to="/yllapito" className={navLinkStyle}>
          Ylläpito
        </NavLink>

      </nav>

    </div>
  );
}

export default Navigation;
