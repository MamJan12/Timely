import { cn } from "../../utils/cn";

interface Option
{
    label: string,
    value: string | number, 
}

interface SelectProps
{
    selectedValue: string | number ,
    onValueChange: (value: string | number) => void,
    options: Option[],
    placeholder?: string,
    className?: string,
    name?: string
    error?: string,
    disabled?: boolean,
}
const Select = ({ selectedValue, onValueChange, options, disabled, name, placeholder, className, error }: SelectProps) =>
{
    return (
        <div className="flex flex-col gap-2">
            <select value={selectedValue || ""} name={name} onChange={(e) => onValueChange?.(e.target.value)} disabled={disabled} className={cn("w-full px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent   placeholder:text-gray-400", className)}>
                <option value="" className="font-extralight text-xs" disabled>{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {
                error && (
                    <span className="text-xs text-red-500 mt-1">{error}</span>
                )
            }
        </div>
    )
}

export default Select;