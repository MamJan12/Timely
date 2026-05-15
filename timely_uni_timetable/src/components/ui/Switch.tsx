import { cn } from "../../utils/cn";

interface SwitchProps
{
    className?: string,
    checked?: boolean,
    onChange: (newValue: boolean) => void,
}
const Switch = ({ className, checked, onChange }: SwitchProps) =>
{
    return (
        <button onClick={() => onChange(!checked)} className={cn(`relative inline-flex h-5 w-10 items-center transition-colors rounded-full duration-200 ease-in-out cursor-pointer ${checked ? "bg-primary-200" : "bg-gray-300"}`, className)}>
            <span className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : "translate-x-1"}`}></span>
        </button>
    )
}

export default Switch;