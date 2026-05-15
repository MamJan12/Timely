import React from "react";
import { cn } from "../../utils/cn";

interface TableProps
{
    className?: string;
    children: React.ReactNode;
}
export function Table({ className, children }: TableProps)
{
    return <table className={cn("w-full border-collapse", className)}>{children}</table>;
}

interface TableHeaderProps
{
    children: React.ReactNode;
    className?: string;
}
export function TableHeader({ children, className }: TableHeaderProps)
{
    return <thead className={cn(className)}>{children}</thead>;
}

interface TableBodyProps
{
    children: React.ReactNode;
    className?: string;
}
export function TableBody({ children, className }: TableBodyProps)
{
    return <tbody className={cn(className)}>{children}</tbody>;
}

interface TableRowProps
{
    children: React.ReactNode;
    className?: string;
}
export function TableRow({ children, className }: TableRowProps)
{
    return <tr className={cn(className)}>{children}</tr>;
}

interface TableHeadProps
{
    children: React.ReactNode;
    className?: string;
}
export function TableHead({ children, className }: TableHeadProps)
{
    return <th className={cn("text-left px-4 py-2 bg-primary-400 text-white font-semibold", className)}>{children}</th>;
}

interface TableCellProps
{
    children: React.ReactNode;
    className?: string;
}
export function TableCell({ children, className }: TableCellProps)
{
    return <td className={cn("px-6 py-4 font-light text-black-dark", className)}>{children}</td>;
}
