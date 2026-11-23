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
    statusStolen: "Stolen",
    statusRegistered: "Registered",
    stolenLead: "The registered owner has reported this bike stolen.",
    registeredLead: "This bike is registered and has no active theft report.",
    theftHeading: "Theft report",
    seenHeading: "Seen this bike?",
    contactLead: "The owner asked to be contacted directly:",
    policeLead:
      "The owner has not published a contact. If you have information about this bike, contact the local police.",
    specsHeading: "Registration",
    photoAlt: (name: string) => `Photo of ${name}`,
    footerLead: "Anyone can check a bike here — no account needed.",
    checkAnother: "Check a serial number",
    browseStolen: "Stolen bikes",
    theft: {
      stolenOn: "Stolen on",
      location: "Location",
      details: "Details",
      reportedOn: "Reported",
    },
    specs: {
      make: "Make",
      model: "Model",
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
  // Landing page. Decision 0006: the page leads with what the registry is,
  // and a visitor's first action (checking a serial) needs no account —
  // two of the four personas in the brief never sign up.
  home: {
    metaDescription:
      "A public register for bicycles. Check a serial number before you buy, free and without an account.",
    eyebrow: "Register once. Check any time.",
    headline: "A public register for bicycles",
    body: "Owners record a bike's serial number, specs and photos. Anyone can look that serial number up afterwards — free, no account. If a bike is stolen, its owner publishes it as stolen in minutes, and from then on every check shows it. A QR tag on the frame opens the same page with one scan.",
    checkCta: "Check a bike's serial number",
    registerCta: "Register your bike",
    ctaNote: "Checking needs no account. Registering signs you in with Google.",
    howItWorks: "How it works",
    features: {
      checkTitle: "Anyone can check",
      checkBody:
        "A buyer, a finder or a police officer looks up the serial number or scans the tag. No account, no app, nothing to install.",
      publishTitle: "Published in minutes",
      publishBody:
        "Report a theft and publish it the same minute. The bike's public page turns to STOLEN and it appears in the public stolen-bike feed.",
      tagTitle: "A tag on the frame",
      tagBody:
        "Print a QR tag for each bike you register. One scan opens its status page, so the check happens where the bike is.",
    },
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
