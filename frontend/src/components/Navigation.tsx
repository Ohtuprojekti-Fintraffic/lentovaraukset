import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../../assets/logos/Horizontal-White.png'
  
const Navigation = () => {
  return(
    <div className='bg-black text-white p-6 flex flex-row items-center justify-between'>
      <img src={Logo} alt="" className='h-7'/>
      <nav className='space-x-10 text-l text-lg'>
        <NavLink
          to={'/'}
          className={({ isActive, isPending }) =>
              isActive
                ? 'active font-bold'
                : isPending
                ? 'pending'
                : ''
            }
        >
          Etusivu
        </NavLink>
        <NavLink
          to={'/calendar'}
          className={({ isActive, isPending }) =>
              isActive
                ? 'active font-bold'
                : isPending
                ? 'pending'
                : ''
            }
        >
          Kalenteri
        </NavLink>
      </nav>
    </div>
  )
}

export default Navigation