import React from 'react'
import { NavLink } from 'react-router-dom'
  
const Navigation = () => {
  return(
    <div className='bg-black text-white'>
      <nav className='p-3 space-x-3'>
        <NavLink
          to={'/'}
          className={({ isActive, isPending }) =>
              isActive
                ? 'active'
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
                ? 'active'
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