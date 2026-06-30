import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JoyB Resort — home"
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src="/logo.png"
        alt="JoyB Resort"
        width={180}
        height={84}
        className="h-20 w-auto object-contain"
        priority
      />
    </Link>
  );
}
