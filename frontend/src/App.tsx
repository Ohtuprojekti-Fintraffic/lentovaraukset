import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './components/Navigation'

const App = () => {
  return(
    <>
      <Navigation/>
      <div id="content">
        <Outlet/>
      </div>
    </>
  )
}

export default App