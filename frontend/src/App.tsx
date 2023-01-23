import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './components/Navigation'
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'

const queryClient = new QueryClient()

const App = () => {
  return(
    <>
      <QueryClientProvider client={queryClient}>
        <Navigation/>
        <div id="content" className='p-6 w-full h-full'>
          <Outlet/>
        </div>
      </QueryClientProvider>
    </>
  )
}

export default App