import type { Dictionary } from "@/lib/dictionaries/en";

// Estonian is the default locale (decision 0001: default to Estonia). The
// wording here is a first pass by the agent — worth a native read-through
// before launch.
export const et: Dictionary = {
  nav: {
    checkBike: "Kontrolli ratast",
    stolenBikes: "Varastatud rattad",
    dashboard: "Minu rattad",
  },
  notFound: {
    title: "Lehte ei leitud",
    body: "Seda lehte pole olemas või on ratta registreering eemaldatud.",
    checkSerial: "Kontrolli seerianumbrit",
    stolenBikes: "Varastatud rattad",
  },
  stolen: {
    metaTitle: "Varastatud rattad",
    metaDescription:
      "Hiljuti varastatuks teatatud rattad. Kontrolli enne ostmist.",
    title: "Varastatud rattad",
    intro: "Hiljuti teatatud vargused. Kaalud kasutatud ratta ostmist?",
    introLink: "Kontrolli selle seerianumbrit",
    empty: "Praegu pole ükski ratas varastatuks märgitud.",
    badge: "Varastatud",
    stolenOn: (date: string) => `Varastatud ${date}`,
    reportedOn: (date: string) => `Teatatud ${date}`,
  },
  bikeType: {
    fallback: "Ratas",
    city: "Linnaratas",
    gravel: "Kruusaratas",
    electric: "Elektriratas",
    BMX: "BMX",
    hybrid: "Hübriidratas",
    mountain: "Maastikuratas",
    road: "Maanteeratas",
    fatbike: "Fatbike",
    kids: "Lasteratas",
    cargo: "Kaubaratas",
  },
};
