import React from "react";

interface SectionWrapperProps {
    children: React.ReactNode;
    className?: string;
    tight?: boolean;
}

export default function SectionWrapper({
    children,
    className = "",
    tight = false,
}: SectionWrapperProps) {
    return (
        <section
        className={`px-5 md:px-10 lg:px-20 py-16 md:py-24 max-w-screen-xl mx-auto ${
            tight ? "max-w-3xl" : ""
        } ${className}`}
        >
            {children}
        </section>
    );
}