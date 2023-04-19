import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Logo from '../../assets/logos/Horizontal-White.png';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="bg-black text-white p-6 flex flex-row items-center justify-between text-lg h-full max-h-20 top-0 overflow-x-auto">
        <div className="flex flex-row items-center space-x-10 w-fit">
          <img src={Logo} alt="" className="h-7" />
          <p className="hidden lg:inline">Koululentovaraus</p>
        </div>
        <nav className="md:hidden flex flex-row items-center py-2 h-full">
          <button
            type="button"
            className="font-sans text-white text-md font-medium leading-7 focus:outline-none flex flex-row"
            onClick={toggleMenu}
          >
            <p className="font-sans text-white text-md font-medium leading-7">Valikko</p>
            {menuOpen ? (
              <ChevronUp strokeWidth="1.5" color="white" className="h-6 w-6 ml-2" />
            ) : (
              <ChevronDown strokeWidth="1.5" color="white" className="h-6 w-6 ml-2" />
            )}
          </button>
        </nav>
        <nav className="hidden md:flex flex-row space-x-10 text-l">
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
          <NavLink
            to="/yllapito"
            className={({ isActive }) => (isActive
              ? 'active font-bold'
              : '')}
          >
            Ylläpito
          </NavLink>
        </nav>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-black border-custom-gray z-10 shadow-lg w-full flex flex-col text-right">
          <NavLink
            to="/"
            className={({ isActive }) => `border-b border-ft-neutral-400 bg-black p-4 text-white ${
              isActive ? 'active font-bold' : ''
            }`}
            onClick={toggleMenu}
          >
            Varaukset
          </NavLink>
          <NavLink
            to="/varausikkunat"
            className={({ isActive }) => `border-b border-ft-neutral-400 bg-black p-4 text-white ${
              isActive ? 'active font-bold' : ''
            }`}
            onClick={toggleMenu}
          >
            Varausikkunat
          </NavLink>
          <NavLink
            to="/hallinta"
            className={({ isActive }) => `border-b border-ft-neutral-400 bg-black p-4 text-white ${
              isActive ? 'active font-bold' : ''
            }`}
            onClick={toggleMenu}
          >
            Hallinta
          </NavLink>
          <NavLink
            to="/yllapito"
            className={({ isActive }) => `border-b border-ft-neutral-400 bg-black p-4 text-white ${
              isActive ? 'active font-bold' : ''
            }`}
            onClick={toggleMenu}
          >
            Ylläpito
          </NavLink>
        </div>
      )}
    </>
  );
}

export default Navigation;
