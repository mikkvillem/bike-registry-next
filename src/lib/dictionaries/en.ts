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
};

/**
 * Every locale's dictionary has this shape, so a missing or renamed key is a
 * type error rather than a blank string on the page.
 */
export type Dictionary = typeof en;
