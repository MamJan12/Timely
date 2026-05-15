

import { cn } from "../../utils/cn";

interface CheckBoxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const CheckBox = ({ label, checked, onChange, className }: CheckBoxProps) => {
    return (
        <label
            className={cn(
                "flex items-center gap-2 text-xs text-black cursor-pointer select-none",
                className
            )}
        >
            {/* Square box */}
            <span
                className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-[3px] border border-gray-400 bg-white",
                    checked && "bg-primary-400 border-primary-400"
                )}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M3 8l3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>

            {/* Label text */}
            <span className="tracking-wide">{label}</span>

            {/* Actual HTML checkbox (hidden) */}
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
};

export default CheckBox;




// interface CheckBoxProps
// {
//     classname?: boolean,
//     checked: boolean,
//     onChange: (newValue: boolean) => void,
//     disabled?: boolean,
//     children?: React.ReactNode
// }

// const CheckBox = ({ classname, checked, onChange, disabled = false, children }: CheckBoxProps) =>
// {
//     return (
//         <label className={cn("inline-flex items-center cursor-pointer", classname && "cursor-not-allowed")}>
//             <input type="checkbox" className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
//             {children && <span className="ml-2">{children}</span>}
//         </label>
//     )
// }