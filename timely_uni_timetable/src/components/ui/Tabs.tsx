import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface TabsContextValue
{
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps
{
    children?: ReactNode;
    className?: string;
    value: string;
    onValueChange: (value: string) => void;
}

export function Tabs({ children, className, value, onValueChange }: TabsProps)
{
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn(className)}>{children}</div>
        </TabsContext.Provider>
    );
}

// TabsList
interface TabsListProps
{
    children: ReactNode;
    className?: string;
}
export function TabsList({ children, className }: TabsListProps)
{
    return <div className={cn("inline-flex items-center bg-gray-light rounded-[10px]", className)}>{children}</div>;
}

// TabsTrigger
interface TabsTriggerProps
{
    children: ReactNode;
    value: string;
    className?: string;
}
export function TabsTrigger({ children, value, className }: TabsTriggerProps)
{
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used inside Tabs");

    const isActive = context.value === value;

    return (
        <button
            className={cn(
                `flex justify-center items-center px-20 py-4 text-base cursor-pointer ${isActive
                    ? "bg-primary-200 border-b-4 border-primary-400 text-primary-400 font-semibold"
                    : "text-black-dark font-light"
                }`,
                className
            )}
            onClick={() => context.onValueChange(value)}
        >
            {children}
        </button>
    );
}

// TabsContent
interface TabsContentProps
{
    children: ReactNode;
    value: string;
    className?: string;
}
export function TabsContent({ children, value, className }: TabsContentProps)
{
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used inside Tabs");

    if (context.value !== value) return null;

    return <div className={cn("mt-3", className)}>{children}</div>;
}
