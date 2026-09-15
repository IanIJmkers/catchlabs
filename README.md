# CatchLabs — beurzenagenda

De agenda-editor van Denna's Trading, opnieuw gezet in de huisstijl van CatchLabs:
rood, zwart en gebroken wit, met de rode zwaai langs de randen, de zwarte hoeken,
het pokéball-patroon en de Japanse labels uit de eigen kaart van de klant.

| Pagina | Wat het is |
|---|---|
| `site/agenda.html` | De volledige agenda — alle beurzen, één of twee kolommen, jaarbalk waar het jaar wisselt |
| `site/snapshot.html` | Twee maanden, groter gezet — de kaart om te posten als er een beurs aankomt |
| `site/index.html` | Startpagina met een link naar allebei |

Beide kaarten lezen dezelfde lijst. Formaat: 9:16 (1080 × 1920, standaard) of 4:5 (1080 × 1350).

## Renderen

```
npm run render                 # de drie PNG's in out/, met de aangeleverde agenda
npm run render -- pad/naar.json  # met een bestand dat de klant via Opslaan heeft gemaakt
npm run serve                  # editor lokaal op http://localhost:4173
```

`node_modules` is een symlink naar `../dennas-trading/node_modules` (Playwright 1.62.1).
Los daarvan: `npm install`.

## Nog open — vóór posten

| Wat | Waar | Status |
|---|---|---|
| **Plaats Dracoon Collectors Event** | Beurzen | `‹CITY›` |
| **Plaats TCG Madness** | Beurzen | `‹CITY, BELGIUM›` — de kaart zegt alleen "België" |

Elk open veld drukt in blauw (`#1E5BD8`), een kleur die de kaart verder nergens gebruikt,
en de kolom Controle in de editor noemt ze op.

Afgehandeld op verzoek van de klant (sept 2026): kaart in het Engels, Japanse labels weg,
pokéballs vervangen door diagonale strepen (knop *Andere lijnen* in Kleuren verdeelt ze opnieuw),
QR naar `https://www.instagram.com/itscatchlabs/`, handle `@itscatchlabs`.
Logo staat in `site/assets/catchlabs-logo.png` (bijgesneden op het zichtbare beeldmerk, 676 × 472). De opslagsleutel is `catchlabs.agenda.v3`; een oudere Nederlandse kaart in de browser wordt niet meer geladen.

## Wat is overgenomen van de kaart van de klant

- Rode zwaai links (breed boven, smal onder) met zwarte hoek; gespiegeld rechtsonder.
- EVENTS in een brede zwarte letter (Archivo Black), daaronder WHERE TO FIND US in rood, wijd gespatieerd.
- Achtergrond: diagonale strepen, vervaagd naar het midden (was de pokéball-tegel).
- Assen Cardshow: twee regels op de kaart van de klant (26-09, 27-09), hier één weekend.

## Lettertypen (zelf gehost, `site/fonts/`)

Archivo Black (kop, datums) · Oswald (naam beurs) · Inter (labels, plaats, tekst) · Jost (alleen de placeholder-wordmark).
# catchlabs
