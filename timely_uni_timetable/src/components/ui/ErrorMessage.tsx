import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

interface ErrorMessageProps
{
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

const ErrorMessage = ({
    title = "Error",
    message,
    onRetry,
    className = ""
}: ErrorMessageProps) =>
{
    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>

            {onRetry && (
                <Button
                    variant="outline"
                    onClick={onRetry}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );
};

export default ErrorMessage;