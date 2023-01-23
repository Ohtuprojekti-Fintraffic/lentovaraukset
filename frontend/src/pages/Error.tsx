import React from 'react'
import { Link, useRouteError } from 'react-router-dom'
import Logo from '../../assets/logos/Horizontal-White.png'

const Error = () => {

  const error:any = useRouteError()
  console.error(error)

  return(
    <div className='h-full w-full grid place-items-center'>
      <div className='w-fit h-fit bg-black p-4 flex flex-col justify-center text-center text-white space-y-3'>
        <img src={Logo} alt="" className='h-7 m-2'/>
        <h2>Tapahtui virhe</h2>
        <p>
          {error.statusText || error.message}
        </p>
        <Link to={'/'}>Etusivulle</Link>
      </div>
    </div>
  )
}

export default Error