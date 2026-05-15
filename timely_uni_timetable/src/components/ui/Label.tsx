import { cn } from "../../utils/cn"

interface LabelProps
{
    htmlFor?: string,
    className?: string,
    children: React.ReactNode
}
const Label = ({ htmlFor, className, children }: LabelProps) =>
{
    return (
        <label htmlFor={htmlFor} className={cn("text-base text-black-dark block mb-1", className)}>{children}</label>
    )
}

export default Label;