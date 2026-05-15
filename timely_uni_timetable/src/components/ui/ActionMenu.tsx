import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface ActionProps
{
    label: string,
    onClick: () => void,
}

interface ActionMenuProps
{
    actions: ActionProps[],
    trigger: React.ReactNode
}
const ActionMenu = ({ actions, trigger }: ActionMenuProps) =>
{
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() =>
    {
        function handleClickOutside(e: MouseEvent)
        {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
            {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])
    return (
        <div className="relative " ref={menuRef}>
            <button className="cursor-pointer" onClick={() => setOpen(prev => !prev)}>
                {trigger}
            </button>
            {open && (
                <div className="absolute right-0 translate-x-6  mt-2 w-32 bg-white shadow-md rounded-md border border-gray-300 z-10">
                    {actions.map((action, i) => (
                        <button key={i} onClick={() => { action.onClick(); setOpen(false) }} className={cn("block w-full text-left px-3 py-2 hover:bg-primary-200 text-sm cursor-pointer")}>{action.label}</button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ActionMenu;