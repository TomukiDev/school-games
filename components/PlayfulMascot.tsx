import Image from "next/image";

type Props = {
  className?: string;
  mood?: "neutral" | "celebrate" | "encourage";
  skin?: "classic" | "sunny" | "galaxy";
};

const SKIN_STYLE: Record<NonNullable<Props["skin"]>, string> = {
  classic: "",
  sunny: "drop-shadow-[0_0_10px_rgba(250,204,21,0.55)]",
  galaxy: "drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]",
};

const MOOD_STYLE: Record<NonNullable<Props["mood"]>, string> = {
  neutral: "",
  celebrate: "animate-bounce",
  encourage: "scale-[1.03]",
};

export default function PlayfulMascot({ className = "", mood = "neutral", skin = "classic" }: Props) {
  return (
    <Image
      src="/mascot.svg"
      alt=""
      width={96}
      height={96}
      className={`h-20 w-auto max-h-24 object-contain sm:h-24 ${MOOD_STYLE[mood]} ${SKIN_STYLE[skin]} ${className}`}
      aria-hidden
    />
  );
}
