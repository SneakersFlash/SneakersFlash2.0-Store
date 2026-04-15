import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
    return (
        <main className={`min-h-screen bg-[#0a0a0a] text-white ${className}`}>
            {children}
        </main>
    );
}
