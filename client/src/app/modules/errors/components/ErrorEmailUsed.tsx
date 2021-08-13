import {FC} from 'react'

const ErrorEmailUsed: FC = () => {
  return (
    <>
      <h1 className='fw-bolder fs-4x text-gray-700 mb-10'>Email is already in use</h1>

      <div className='fw-bold fs-3 text-gray-400 mb-15'>
       Go back to register with an unused email <br /> Umm thanks?
      </div>
    </>
  )
}

export {ErrorEmailUsed}
