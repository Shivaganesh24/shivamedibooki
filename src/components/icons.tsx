import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function VAIQIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2D63C1" />
                    <stop offset="100%" stopColor="#25B8C9" />
                </linearGradient>
                 <linearGradient id="cross-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#63D77B" />
                    <stop offset="100%" stopColor="#32B89C" />
                </linearGradient>
            </defs>
            
            {/* V */}
            <path d="M5 10 L 25 50 L 45 10" stroke="url(#logo-gradient)" strokeWidth="10" fill="none" />

            {/* A (Caduceus) */}
            <g transform="translate(65, 30)">
                {/* Staff */}
                <path d="M0 -20 V 20" stroke="url(#logo-gradient)" strokeWidth="4" />
                
                {/* Wings */}
                <path d="M-15 -15 C -5 -25, 5 -25, 15 -15" stroke="url(#logo-gradient)" strokeWidth="3" fill="none"/>

                {/* Snakes */}
                <path d="M-5 20 C -15 10, 15 0, 5 -10" stroke="url(#logo-gradient)" strokeWidth="3" fill="none"/>
                <path d="M5 20 C 15 10, -15 0, -5 -10" stroke="url(#logo-gradient)" strokeWidth="3" fill="none"/>
                
                {/* Cross */}
                <g transform="translate(0, -25)">
                    <path d="M0 -4 V 4" stroke="url(#cross-gradient)" strokeWidth="2.5"/>
                    <path d="M-4 0 H 4" stroke="url(#cross-gradient)" strokeWidth="2.5"/>
                </g>
            </g>

            {/* Q */}
            <path d="M130 30 A 20 20 0 1 1 170 30 A 20 20 0 1 1 130 30" stroke="url(#logo-gradient)" strokeWidth="10" fill="none" />
            <path d="M160 40 L 180 60" stroke="url(#logo-gradient)" strokeWidth="8" />

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
