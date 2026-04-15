import React from "react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    accentWord?: string;
}

export default function PageHeader({ title, subtitle, accentWord }: PageHeaderProps) {
    const renderTitle = () => {
        if (!accentWord) return title;
        return title.split(accentWord).map((part, i, arr) =>
        i < arr.length - 1 ? (
            <React.Fragment key={i}>
            {part}
            <span className="text-[#f5f500]">{accentWord}</span>
            </React.Fragment>
        ) : (
            part
        )
        );
    };

    return (
        <section className="relative border-b border-white/10 bg-[#0a0a0a] pt-20 pb-14 px-5 md:px-10 lg:px-20 overflow-hidden">
        {/* Decorative grid */}
        <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
            backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            }}
        />
        {/* Glow top-left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#f5f500]/10 blur-[80px] pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-[#f5f500] font-semibold mb-4">
            SneakersFlash
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mb-5">
            {renderTitle()}
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed">
            {subtitle}
            </p>
        </div>
        </section>
    );
}