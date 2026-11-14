export const en = {
  nav: {
    checkBike: "Check a bike",
    stolenBikes: "Stolen bikes",
    dashboard: "Dashboard",
  },
  notFound: {
    title: "Page not found",
    body: "This page doesn't exist, or the bike registration was removed.",
    checkSerial: "Check a serial number",
    stolenBikes: "Stolen bikes",
  },
  stolen: {
    metaTitle: "Stolen bikes",
    metaDescription: "Recently reported stolen bikes. Check before you buy.",
    title: "Stolen bikes",
    intro: "Recently reported thefts. Looking at a second-hand bike?",
    introLink: "Check its serial number",
    empty: "No stolen bikes are currently reported.",
    badge: "Stolen",
    stolenOn: (date: string) => `Stolen ${date}`,
    reportedOn: (date: string) => `Reported ${date}`,
  },
  bikeType: {
    fallback: "Bike",
    city: "City bike",
    gravel: "Gravel bike",
    electric: "Electric bike",
    BMX: "BMX",
    hybrid: "Hybrid bike",
    mountain: "Mountain bike",
    road: "Road bike",
    fatbike: "Fatbike",
    kids: "Kids' bike",
    cargo: "Cargo bike",
  },
  gender: {
    male: "Men's",
    female: "Women's",
    unisex: "Unisex",
  },
  gearSystem: {
    internal: "Internal",
    external: "External",
    fixie: "Fixed gear",
  },
  bikePage: {
    notFoundTitle: "Bike not found",
    stolenTitlePrefix: (name: string) => `STOLEN: ${name}`,
    metaReportedStolen: (date: string | null, location: string | null) =>
      ["Reported stolen", date && `on ${date}`, location && `in ${location}`]
        .filter(Boolean)
        .join(" "),
    metaRegistered: "Registered — not reported stolen.",
    reportedStolen: "Reported stolen",
    stolenOn: (date: string) => `Stolen ${date}`,
    reportedOn: (date: string) => `Reported on ${date}.`,
    contact: (contact: string) => ` Contact: ${contact}`,
    policeHint:
      " If you have information about this bike, contact local police.",
    registered: "Registered — not reported stolen",
    specs: {
      type: "Type",
      gender: "Gender",
      gearSystem: "Gear system",
      numGears: "Number of gears",
      wheelSize: "Wheel size",
      weight: "Weight",
      kilograms: (weight: number) => `${weight} kg`,
      empty: "—",
    },
  },
  search: {
    title: "Find a bike",
    intro: "Search by serial number to check registration and theft status.",
    placeholder: "Enter serial number...",
    submit: "Search",
    failed: "Search failed",
    noResults: "No bikes found matching that serial number.",
    found: (count: number) =>
      count === 1 ? "Found 1 bike" : `Found ${count} bikes`,
    badgeStolen: "Stolen",
    badgeOk: "OK",
    serial: (serial: string) => `Serial: ${serial}`,
    reportedStolen: (date: string | null, location: string | null) =>
      ["Reported stolen", date && `on ${date}`, location && `in ${location}`]
        .filter(Boolean)
        .join(" "),
  },
  auth: {
    signIn: "Sign in with Google",
    signOut: "Sign out",
  },
};

/**
 * Every locale's dictionary has this shape, so a missing or renamed key is a
 * type error rather than a blank string on the page.
 */
export type Dictionary = typeof en;
