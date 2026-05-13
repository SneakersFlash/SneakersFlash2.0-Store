import Image from "next/image";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative w-[50px] h-[50px]">
        <Image
          src="/images/petir.svg"
          alt="Loading"
          fill
          className="object-contain animate-bounce"
        />
      </div>
    </div>
  );
}
