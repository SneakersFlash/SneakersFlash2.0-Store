"use client";

import { useEffect, useState } from "react";

/**
 * `tone` menentukan kontras, bukan selera: varian "light" (bawaan) menulis
 * angka putih di atas kaca buram — benar untuk panel gelap, tapi HILANG di
 * atas bidang kuning. Panel yang alasnya terang wajib memakai "dark".
 */
export function CountdownTimer({
    targetDate,
    tone = "light",
}: {
    targetDate: string;
    tone?: "light" | "dark";
}) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // Mencegah hydration error di Next.js

        const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        if (difference > 0) {
            setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!isMounted) return null;

    const timeBlocks = [
        { label: "HARI", value: timeLeft.days },
        { label: "JAM", value: timeLeft.hours },
        { label: "MNT", value: timeLeft.minutes },
        { label: "DTK", value: timeLeft.seconds },
    ];

    // Jangan tampilkan hari jika sisanya kurang dari 24 jam agar lebih ringkas
    const displayBlocks = timeLeft.days > 0 ? timeBlocks : timeBlocks.slice(1);

    return (
        <div className="flex items-center gap-1.5 md:gap-2">
        {displayBlocks.map((block, idx) => (
            <div key={idx} className="flex flex-col items-center">
            <div className={`${tone === "dark" ? "bg-black/10 border-black/20 text-black" : "bg-white/20 border-white/30 text-white"} backdrop-blur-md border font-bold text-sm md:text-lg w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-lg shadow-sm`}>
                {block.value.toString().padStart(2, "0")}
            </div>
            <span className={`${tone === "dark" ? "text-black/70" : "text-white/90"} text-[8px] md:text-[10px] font-medium mt-1 tracking-wider`}>
                {block.label}
            </span>
            </div>
        ))}
        </div>
    );
}