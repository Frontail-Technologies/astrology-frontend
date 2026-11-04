/**
 * Tithi and nakshatra names exactly as the API's panchang calculator returns them
 * (`api/src/modules/astrology/daily/panchang.ts` `tithiNames` / `nakshatraNames`); the API rejects any other value.
 */
const tithiRoots = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"] as const;

export const tithiNames: readonly string[] = [
  ...tithiRoots.map((name) => `Shukla ${name}`),
  "Purnima",
  ...tithiRoots.map((name) => `Krishna ${name}`),
  "Amavasya",
];

export const nakshatraNames: readonly string[] = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
