import { cn } from "../../utils/cn";

type Variant = "primary" | "success" | "destructive" | "outline";

type Size = "default" | "sm" | "lg";

interface ButtonProps
{
    variant?: Variant,
    type?: "submit" | "button" | "reset",
    disabled?: boolean,
    size?: Size,
    children: React.ReactNode,
    className?: string,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
}
const Button = ({ variant = "primary", type = "button", size = "default", disabled = false, children, className, onClick }: ButtonProps) =>
{
    const baseStyle = "inline-flex justify-center items-center px-3 py-2 gap-2 text-base whitespace-nowrap transition-colors rounded-full cursor-pointer outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
    const variants: Record<Variant, string> = {
        primary: "bg-primary-400 text-white",
        success: "bg-success text-white",
        destructive: "bg-danger text-white",
        outline: "border-1 border-danger text-danger"
    }

    const sizes: Record<Size, string> = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6 ",
    }
    return (
        <button disabled={disabled} type={type} onClick={onClick} className={cn(baseStyle, variants[variant], sizes[size], className)}>{ children}</button>
    )
}

export default Button;