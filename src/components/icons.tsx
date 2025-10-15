import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function MedbookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
        </svg>
    );
}

export function PageTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <h1 className={cn("text-3xl sm:text-4xl font-headline font-semibold", className)}>
      {children}
    </h1>
  );
}
