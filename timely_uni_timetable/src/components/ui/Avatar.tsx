import { cn } from "../../utils/cn";

interface AvatarProps
{
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar = ({ src, alt, size = 'md', className }: AvatarProps) =>
{
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
    };

    if (src)
    {
        return (
            <img
                src={src}
                alt={alt || 'Avatar'}
                className={cn(
                    'rounded-full object-cover',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full bg-gray-200 flex items-center justify-center',
                sizeClasses[size],
                className
            )}
        >
            <span className="text-gray-500 font-medium">
                {alt?.charAt(0).toUpperCase() || 'U'}
            </span>
        </div>
    );
};

export default Avatar;