import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../../assets/logos/Horizontal-White.png'
  
const Navigation = () => {
  return(
    <div className='bg-black text-white p-6 flex flex-row items-center justify-between text-lg h-full max-h-20 top-0'>
      <div className='flex flex-row items-center space-x-10'>
        <img src={Logo} alt="" className='h-7'/>
        <p>Koululentovaraus</p>
      </div>
      <nav className='space-x-10 text-l'>
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
          Kalenteri
        </NavLink>
        <NavLink
          to={'/landing'}
          className={({ isActive, isPending }) =>
              isActive
                ? 'active font-bold'
                : isPending
                ? 'pending'
                : ''
            }
        >
          Hallinta
        </NavLink>
      </nav>
    </div>
  )
}

export default Navigation