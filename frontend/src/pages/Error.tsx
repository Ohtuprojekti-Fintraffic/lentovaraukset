import React from 'react'
import { useRouteError } from 'react-router-dom'

const Error = () => {

  const error:any = useRouteError()
  console.error(error)

  return(
    <div>
      <h2>Tapahtui virhe</h2>
      <p>
        {error.statusText || error.message}
      </p>
    </div>
  )
}

export default Error