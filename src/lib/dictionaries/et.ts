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
  gender: {
    male: "Meeste",
    female: "Naiste",
    unisex: "Uniseks",
  },
  gearSystem: {
    internal: "Sisemine",
    external: "Väline",
    fixie: "Fikseeritud käik",
  },
  bikePage: {
    notFoundTitle: "Ratast ei leitud",
    stolenTitlePrefix: (name: string) => `VARASTATUD: ${name}`,
    metaReportedStolen: (date: string | null, location: string | null) =>
      ["Teatatud varastatuks", date, location && `· ${location}`]
        .filter(Boolean)
        .join(" "),
    metaRegistered: "Registreeritud — varguseteadet pole.",
    reportedStolen: "Teatatud varastatuks",
    stolenOn: (date: string) => `Varastatud ${date}`,
    reportedOn: (date: string) => `Teatatud ${date}.`,
    contact: (contact: string) => ` Kontakt: ${contact}`,
    policeHint:
      " Kui sul on selle ratta kohta infot, võta ühendust kohaliku politseiga.",
    registered: "Registreeritud — varguseteadet pole",
    specs: {
      type: "Tüüp",
      gender: "Sugu",
      gearSystem: "Käigusüsteem",
      numGears: "Käikude arv",
      wheelSize: "Rattasuurus",
      weight: "Kaal",
      kilograms: (weight: number) => `${weight} kg`,
      empty: "—",
    },
  },
  search: {
    title: "Leia ratas",
    intro:
      "Otsi seerianumbri järgi, et kontrollida registreeringut ja vargusteadet.",
    placeholder: "Sisesta seerianumber…",
    submit: "Otsi",
    failed: "Otsing ebaõnnestus",
    noResults: "Selle seerianumbriga ratast ei leitud.",
    found: (count: number) =>
      count === 1 ? "Leiti 1 ratas" : `Leiti ${count} ratast`,
    badgeStolen: "Varastatud",
    badgeOk: "Korras",
    serial: (serial: string) => `Seerianumber: ${serial}`,
    reportedStolen: (date: string | null, location: string | null) =>
      ["Teatatud varastatuks", date, location && `· ${location}`]
        .filter(Boolean)
        .join(" "),
  },
  auth: {
    signIn: "Logi sisse Google'iga",
    signOut: "Logi välja",
  },
};
