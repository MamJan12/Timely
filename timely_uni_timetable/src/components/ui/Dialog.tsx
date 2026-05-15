import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface DialogProps
{
    title: string,
    children: React.ReactNode,
    onClose: () => void,
    className?: string,
}
const Dialog = ({ title, children, className, onClose }: DialogProps) =>
{
    return (
        <div className="fixed inset-0 bg-black/75 z-50 animate-fadeIn">
            <div className={cn("fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg animate-zoomIn max-h-[90vh] overflow-y-auto ", className)}>
                <div className="flex justify-between items-center pb-1 border-b border-black mb-4">
                    <h4 className="text-black-dark font-semibold text-2xl">{title}</h4>
                    <button onClick={onClose} className="cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}

export default Dialog;