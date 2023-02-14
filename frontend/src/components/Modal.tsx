import React from "react"

type Props = {
    show: boolean,
    handleClose: () => void,
    children: React.ReactNode
}

const Modal: React.FC<Props> = ({ show, handleClose, children} ) => {

    const showClass = show ? "" : ""

    return (
        <div className={`h-full w-full p-5 ${showClass}`}>
            {children}
        </div>
    )
}

export default Modal