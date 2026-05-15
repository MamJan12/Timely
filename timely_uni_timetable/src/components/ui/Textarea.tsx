import { cn } from "../../utils/cn";

interface TextareaProps
{
    className?: string,
    value: string,
    placeholder?: string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    rows?: number,
    name?: string,
    error?: string
}
const Textarea = ({ className, value, onChange, name, error, placeholder, rows=3 }: TextareaProps) =>
{
    return (
        <>        <textarea className={cn("w-full px-2 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent  placeholder:text-gray-400", className)} placeholder={placeholder} rows={rows} name={name} value={value} onChange={onChange} />
            {
                error && (
                    <span className="text-xs text-red-500 mt-1">{error}</span>
                )
            }
</>    )
}

export default Textarea;