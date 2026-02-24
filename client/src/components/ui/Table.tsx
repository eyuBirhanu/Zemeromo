import { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// 1. Table Wrapper
export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`w-full overflow-hidden rounded-2xl border border-white/5 bg-[#1a1f2b] shadow-xl ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">{children}</table>
            </div>
        </div>
    );
}

// 2. Table Head
export function TableHead({ children }: { children: ReactNode }) {
    return (
        <thead className="bg-white/[0.02] text-gray-400 font-medium uppercase text-xs border-b border-white/5">
            <tr>{children}</tr>
        </thead>
    );
}

// 3. Table Row
export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <tr className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${className}`}>
            {children}
        </tr>
    );
}

// 4. Table Cell (FIXED: Accepts colSpan and other props)
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    children?: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
    return (
        <td
            className={`px-6 py-4 text-gray-300 align-middle ${className}`}
            {...props} // This passes colSpan, onClick, etc. to the DOM
        >
            {children}
        </td>
    );
}

// 5. Header Cell
interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
    children?: ReactNode;
}

export function TableHeaderCell({ children, className = "", ...props }: TableHeaderCellProps) {
    return (
        <th
            className={`px-6 py-4 tracking-wider font-semibold text-gray-400 ${className}`}
            {...props}
        >
            {children}
        </th>
    );
}