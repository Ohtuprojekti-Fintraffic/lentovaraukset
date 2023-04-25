import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/logos/Horizontal-White.png';

function Navigation() {
  const { t } = useTranslation();

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => {
    const baseStyle = 'hover:text-ft-text-300';
    return isActive ? `${baseStyle} active font-bold` : baseStyle;
  };

  const dropDownLinkStyle = ({ isActive }: { isActive: boolean }) => {
    const baseStyle = 'border-b border-ft-neutral-400 bg-black p-4 text-white';
    return isActive ? `${baseStyle} active font-bold` : baseStyle;
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="bg-black text-white p-6 flex flex-row items-center justify-between text-lg h-full max-h-20 top-0 overflow-x-auto">
        <div className="flex flex-row items-center space-x-10 w-fit">
          <NavLink to="/" className={navLinkStyle}>
            <img src={Logo} alt="" className="h-7" />
          </NavLink>
          <p className="hidden lg:inline">
            {t('navigation.title')}
          </p>
        </div>
        <nav className="md:hidden flex flex-row items-center py-2 h-full">
          <button
            type="button"
            className="font-sans text-white text-md font-medium leading-7 focus:outline-none flex flex-row"
            onClick={toggleMenu}
          >
            <p className="font-sans text-white text-md font-medium leading-7">
              {t('navigation.menu')}
            </p>
            {menuOpen ? (
              <ChevronUp strokeWidth="1.5" color="white" className="h-6 w-6 ml-2" />
            ) : (
              <ChevronDown strokeWidth="1.5" color="white" className="h-6 w-6 ml-2" />
            )}
          </button>
        </nav>
        <nav className="hidden md:flex flex-row space-x-10 text-l">
          <NavLink to="/varaukset" className={navLinkStyle}>
            {t('navigation.reservations')}
          </NavLink>
          <NavLink to="/varausikkunat" className={navLinkStyle}>
            {t('navigation.timeslots')}
          </NavLink>
          <NavLink to="/hallinta" className={navLinkStyle}>
            {t('navigation.management')}
          </NavLink>
          <NavLink to="/yllapito" className={navLinkStyle}>
            {t('navigation.admin')}
          </NavLink>
        </nav>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-black border-custom-gray shadow-lg w-full flex flex-col text-right">
          <NavLink
            to="/varaukset"
            className={dropDownLinkStyle}
            onClick={toggleMenu}
          >
            {t('navigation.reservations')}
          </NavLink>
          <NavLink
            to="/varausikkunat"
            className={dropDownLinkStyle}
            onClick={toggleMenu}
          >
            {t('navigation.timeslots')}
          </NavLink>
          <NavLink
            to="/hallinta"
            className={dropDownLinkStyle}
            onClick={toggleMenu}
          >
            {t('navigation.management')}
          </NavLink>
          <NavLink
            to="/yllapito"
            className={dropDownLinkStyle}
            onClick={toggleMenu}
          >
            {t('navigation.admin')}
          </NavLink>
        </div>
      )}
    </>
  );
}

export default Navigation;
