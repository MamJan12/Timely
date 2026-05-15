import { Users, Plus } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps
{
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({
    title,
    description,
    actionLabel = "Add Admin",
    onAction
}: EmptyStateProps) =>
{
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-6 p-4 bg-gray-100 rounded-full">
                <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-center mb-8 max-w-md">{description}</p>
            {onAction && (
                <Button onClick={onAction} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;