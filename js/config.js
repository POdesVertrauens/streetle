/* ============================================
   CONFIG — zentrale Einstellungen
   ============================================ */

/* Rundendauer (in Sekunden) */
export const ROUND_TIMES = {
  "15": 15,
  "30": 30,
  "60": 60,
  "120": 120
};

/* Basemap-URLs */
export const BASEMAPS = {
  withContext: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  withoutContext: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
};

/* Liste wichtiger Straßen (vollständig erweiterbar) */
export const WICHTIGE_STRASSEN = [
"Friedrichstraße",
"Unter den Linden",
"Karl-Marx-Allee",
"Kurfürstendamm",
"Tauentzienstraße",
"Alexanderplatz",
"Potsdamer Platz",
"Leipziger Straße",
"Oranienstraße",
"Schönhauser Allee",
"Karl-Liebknecht-Straße",
"Straße des 17. Juni",
"Invalidenstraße",
"Torstraße",
"Frankfurter Allee",
"Müllerstraße",
"Seestraße",
"Hardenbergstraße",
"Wilhelmstraße",
"Reinhardtstraße",
"Chausseestraße",
"Gendarmenmarkt",
"Pariser Platz",
"Bebelplatz",
"Hackescher Markt",
"Wittenbergplatz",
"Nollendorfplatz",
"Winterfeldtplatz",
"Hermannplatz",
"Kaiserdamm",
"Bismarckstraße",
"Kantstraße",
"Budapester Straße",
"Grunewaldstraße",
"Hauptstraße",
"Sonnenallee",
"Karl-Marx-Straße",
"Hermannstraße",
"Mehringdamm",
"Skalitzer Straße",
"Kottbusser Damm",
"Gitschiner Straße",
"Hasenheide",
"Prenzlauer Allee",
"Greifswalder Straße",
"Landsberger Allee",
"Kastanienallee",
"Danziger Straße",
"Bornholmer Straße",
"Bernauer Straße",
"Oranienburger Straße",
"Alt-Moabit",
"Stromstraße",
"Turmstraße",
"Mollstraße",
"Holzmarktstraße",
"Stralauer Allee",
"Bergmannstraße",
"Yorckstraße",
"Knesebeckstraße",
"Fasanenstraße",
"Savignyplatz",
"Strausberger Platz",
"Rosa-Luxemburg-Platz",
"Kollwitzplatz",
"Boxhagener Platz",
"Viktoria-Luise-Platz",
"Leopoldplatz",
"Rosenthaler Platz",
"Moritzplatz",
"Kottbusser Tor"
];
