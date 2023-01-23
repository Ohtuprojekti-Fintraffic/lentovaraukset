import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './components/Navigation'

const App = () => {
  return(
    <>
      <Navigation/>
      <div id="content" className='p-6'>
        <Outlet/>
      </div>
    </>
  )
}

export default App