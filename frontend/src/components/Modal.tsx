import React from "react"

type Props = {
    show: boolean,
    handleClose: any,
    closeButton?: boolean
    children?: React.ReactNode
}

const Modal: React.FC<Props> = ({ show, handleClose, children, closeButton = true }) => {

    const showClass = show ? "flex" : "hidden"

    return (
        <div
            className={`${showClass} flex flex-col fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-40 justify-center items-center z-50`}
            onClick={() => handleClose()}
        >
            <div className='flex flex-col w-1/2 max-w-md h-fit bg-white' onClick={(event) => event.stopPropagation()}>
                <div className="p-8">
                    <p className="text-2xl">test</p>
                    {children}
                </div>
                <div className="flex flex-row justify-between p-4 bg-gray-100 border-t-2 border-gray-200 w-full">
                    <div>
                        <button
                            className="bg-black text-white p-2 rounded-md"
                            onClick={() => handleClose()}>
                            Sulje
                        </button>
                    </div>
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal