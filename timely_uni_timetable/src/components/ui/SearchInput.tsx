import { Search } from "lucide-react"
import { cn } from "../../utils/cn"

interface SearchInputProps
{
    value?: string,
    placeholder?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    className?: string
}
const SearchInput = ({ value, placeholder, onChange, className }: SearchInputProps) =>
{
    return (
        <div className="relative w-full">
            <Search className="w-5 h-5 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input type="text" value={value} placeholder={placeholder} onChange={onChange} className={cn("w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 placeholder:text-gray-400 text-base", className)} />
        </div>
    )
}

export default SearchInput