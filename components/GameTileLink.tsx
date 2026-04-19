import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const gameTileLinkClassName =
  "flex aspect-square min-h-[120px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-kid-sky/35 bg-kid-surface p-4 text-center shadow-md shadow-kid-sky/10 transition duration-200 hover:-translate-y-0.5 hover:border-kid-sky/70 hover:shadow-lg hover:shadow-kid-sun/15 active:scale-[0.97] dark:border-kid-sky/30 dark:bg-kid-surface dark:shadow-black/20 dark:hover:border-kid-mint/50";

type Props = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  children?: ReactNode;
};

export default function GameTileLink({ href, title, imageSrc, imageAlt, children }: Props) {
  return (
    <Link href={href} className={gameTileLinkClassName}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={80}
        height={80}
        unoptimized
        className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
      />
      <span className="text-base font-bold text-kid-ink sm:text-lg">{title}</span>
      {children}
    </Link>
  );
}
