import { cn } from "../../utils/cn"

interface InputProps
{
    id?: string;
    value: string | number,
    name?: string,
    type?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    className?: string,
    placeholder?: string,
    disabled?: boolean,
    error?: string
}
const Input = ({ id, type = "text", value, name, error, onChange, className, placeholder, disabled = false }: InputProps) =>
{
    return (
        <>
            <input id={id}
                type={type} value={value} name={name} onChange={onChange} className={cn("w-full px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent placeholder:font-extralight placeholder:text-xs  placeholder:text-gray-400", className)} placeholder={placeholder} disabled={disabled} />
            {
                error && (
                    <span className="text-xs text-red-500 mt-1">{error}</span>
                )
            }
        </>

    )
}

export default Input