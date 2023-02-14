import React from "react"

type Props = {
    show: boolean,
    handleClose: any,
    children?: React.ReactNode
}

const Modal: React.FC<Props> = ({ show, handleClose, children} ) => {

    const showClass = show ? "flex" : "hidden"

    return (
        <div 
            className={`${showClass} flex-col fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-40 justify-center items-center z-50`}
            onClick={() => handleClose(false)}
        >
            <div className='w-1/2 max-w-md h-fit bg-white p-6'>
                <h1>test</h1>
                {children}
            </div>
        </div>
    )
}

export default Modal