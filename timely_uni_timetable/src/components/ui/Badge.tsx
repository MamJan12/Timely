import { cn } from "../../utils/cn";
type Variant = "default" | "success" | "secondary" | "destructive" | "outline"
interface BadgeProps
{
    className?: string
    variant?: Variant
    children: React.ReactNode
}

const Badge = ({ className, variant = "default", children }: BadgeProps) =>
{
    // bg - gray - 100 px - 2 py - 1 rounded - full text - gray - 800  text - xs px - 2 py - 1 rounded - full whitespace - nowrap
    const variants: Record<Variant, string> = {
        default: "bg-blue-100 text-blue-700",
        secondary: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-700",
        destructive: "bg-red-100 text-red-700",
        outline: "bg-gray-100 text-gray-700",
    }
    return (
        <span className={cn("inline-flex gap-1 items-center py-1 px-3 text-xs rounded-full whitespace-nowrap", className, variants[variant])}>{children}</span>
    )
}

export default Badge;