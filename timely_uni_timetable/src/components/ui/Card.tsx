import { cn } from "../../utils/cn";

interface CardProps
{
    children: React.ReactNode;
    className?: string;
}

const Card = ({ children, className }: CardProps) =>
{
    return (
        <div className={cn(
            'bg-white rounded-lg border border-gray-200 shadow-sm p-2 px-4',
            className
        )}>
            {children}
        </div>
    );
};

export default Card;