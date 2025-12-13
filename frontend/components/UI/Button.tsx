import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/Utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed",
                className,
            )}
            {...props}
        />
    );
}
