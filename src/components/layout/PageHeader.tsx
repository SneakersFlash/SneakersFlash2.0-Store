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
            {/* Mengubah kuning terang menjadi yellow-500 agar terbaca di background putih */}
            <span className="text-yellow-500">{accentWord}</span>
            </React.Fragment>
        ) : (
            part
        )
        );
    };

    return (
        // Mengubah bg hitam menjadi bg-white dan border putih transparan menjadi abu-abu
        <section className="relative border-b border-gray-200 bg-white pt-20 pb-14 px-5 md:px-10 lg:px-20 overflow-hidden">
        {/* Decorative grid - warna garis diubah ke hitam (#000) agar terlihat di bg putih */}
        <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
            backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            }}
        />
        {/* Glow top-left - nuansa kuning disesuaikan */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-yellow-400/20 blur-[80px] pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-yellow-600 font-bold mb-4">
            SneakersFlash
            </p>
            {/* Menambahkan text-black untuk judul utama */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black uppercase tracking-tight leading-none mb-5">
            {renderTitle()}
            </h1>
            {/* Mengubah text-white/50 menjadi text-gray-600 */}
            <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
            {subtitle}
            </p>
        </div>
        </section>
    );
}