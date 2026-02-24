interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-white/5 rounded-md ${className}`}
        />
    );
}

// A specific skeleton for Table Rows to keep pages clean
export function TableRowsSkeleton({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-white/5 last:border-0">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                            <Skeleton className="h-5 w-full max-w-[80%]" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}