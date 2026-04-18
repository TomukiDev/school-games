export type GameTile = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const GAMES: GameTile[] = [
  {
    id: "tabelline",
    title: "Tabelline",
    href: "/games/tabelline",
    imageSrc: "/games/tabelline.svg",
    imageAlt: "Illustrazione del gioco Tabelline",
  },
  {
    id: "orologio",
    title: "Che ora è?",
    href: "/games/orologio",
    imageSrc: "/games/orologio.svg",
    imageAlt: "Illustrazione del gioco Che ora è?",
  },
];
