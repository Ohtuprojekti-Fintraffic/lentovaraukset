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
        <div id="content" className='w-full h-full'>
          <Navigation/>
          <div className='p-6'>
            <Outlet/>
          </div>
        </div>
      </QueryClientProvider>
    </>
  )
}

export default App