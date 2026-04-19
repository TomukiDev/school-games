import Image from "next/image";

type Props = {
  className?: string;
};

export default function PlayfulMascot({ className = "" }: Props) {
  return (
    <Image
      src="/mascot.svg"
      alt=""
      width={96}
      height={96}
      className={`h-20 w-auto max-h-24 object-contain sm:h-24 ${className}`}
      aria-hidden
    />
  );
}
