interface ModalProps
{
    children: React.ReactNode
}
const Modal = ({ children }: ModalProps) =>
{
    return (
        <div className="fixed bg-black/75 inset-0 z-50 animate-fadeIn">
            <div className="fixed top-1/2 left-1/2  z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg animate-zoomIn">
                {children}
            </div>
        </div>
    )
}

export default Modal