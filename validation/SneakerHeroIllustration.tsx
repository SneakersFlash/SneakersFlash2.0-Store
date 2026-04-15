import Image from "next/image";

export default function SneakerHeroIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full">
      <div className="relative z-10 w-64 h-48 md:w-72 md:h-56">
        <Image
          src="/images/sneakers-hero.jpeg" // <- Hapus "public" dan tambahkan "/" di awal
          alt="Sneakers Flash"
          // width={100}
          // height={10}
          fill
          className="object-contain drop-shadow-xl"
          priority
        />
      </div>
    </div>
  );
}