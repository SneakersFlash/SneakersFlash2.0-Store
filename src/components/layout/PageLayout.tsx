import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
    return (
        <main className={`min-h-screen bg-white text-black ${className}`}>
            {children}
        </main>
    );
}