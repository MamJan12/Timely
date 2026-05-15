import { useRouteError } from "react-router-dom";

const ErrorPage = () =>
{
    const error = useRouteError();

    let message: string;

    if (error instanceof Error)
    {
        message = error.message;
    } else if (typeof error === "object" && error !== null && "statusText" in error)
    {
        message = (error as { statusText?: string }).statusText || "Unknown error";
    } else
    {
        message = "Unknown error";
    }

    console.error(error);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
            <p className="mt-2 text-gray-600">{message}</p>
        </div>
    );
};

export default ErrorPage;