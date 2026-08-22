# -*- coding: utf-8 -*-
"""
Font Awesome auf die tatsaechlich benutzten Symbole eindampfen.

Font Awesome bringt 1970 Symbole mit - die Seite benutzt rund 60 davon.
Bezahlt wurde bisher trotzdem alles: 310 KB pro Seitenaufruf (73 KB CSS und
drei Schriftdateien mit zusammen 237 KB). Zum Vergleich: die kompletten
Textschriften der Seite (Inter, Outfit, Orbitron) wiegen 89 KB.

Dieses Werkzeug sammelt alle Symbolnamen ein, die irgendwo vorkommen, und
schreibt aus den Originalen unter tools/schriften-quelle/ verkleinerte
Fassungen nach css/ und webfonts/.

Gesucht wird an vier Stellen - alles, was ein Symbol auf die Seite bringen
kann:
  *.html, pages/*.html   fest im Markup
  js/*.js                zur Laufzeit eingesetzt (Wetter, Suche, Live-Timing)
  tools/*.py             von den Pflege-Werkzeugen eingefuegt
  data/*.json            aus gepflegten Daten

Aufruf:
    python tools/icons_bauen.py                 ausduennen
    python tools/icons_bauen.py --nur-liste     nur zeigen, was gefunden wurde
    python tools/icons_bauen.py --alles-zurueck Originale wiederherstellen

Benoetigt: pip install fonttools brotli
"""
import glob
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUELLE = os.path.join(ROOT, "tools", "schriften-quelle")

# Schriftdatei -> (Zielname, Familienklasse)
SCHRIFTEN = {
    "solid":   ("fa-solid-900.woff2",   "fa-solid"),
    "regular": ("fa-regular-400.woff2", "fa-regular"),
    "brands":  ("fa-brands-400.woff2",  "fa-brands"),
}

# Symbole, die immer mit hinein muessen, auch wenn sie gerade nirgends
# stehen: Rueckfallwerte im Code, die erst im Fehlerfall auftauchen.
IMMER_DABEI = {
    "solid": {"fa-file"},        # js/suche.js: Rueckfall fuer unbekannte Seiten
}

FAMILIE_KLASSE = re.compile(r"fa-(solid|regular|brands)\s+(fa-[a-z0-9-]+)")
NAME_ROH = re.compile(r"[\"']\s*(fa-[a-z0-9-]{3,})\s*[\"']")
NAME_IN_KLASSE = re.compile(r"\bfa-[a-z0-9-]{3,}\b")

# Klassennamen von Font Awesome, die kein Symbol sind
KEINE_SYMBOLE = {
    "fa-solid", "fa-regular", "fa-brands", "fa-light", "fa-thin", "fa-duotone",
    "fa-fw", "fa-lg", "fa-sm", "fa-xs", "fa-spin", "fa-pulse", "fa-border",
    "fa-stack", "fa-inverse", "fa-ul", "fa-li", "fa-rotate", "fa-flip",
    "fa-beat", "fa-fade", "fa-shake", "fa-bounce", "fa-2x", "fa-3x",
}


def dateien():
    """Alle Dateien, die ein Symbol enthalten koennen."""
    muster = ["*.html", "pages/*.html", "js/*.js", "tools/*.py", "data/*.json"]
    gefunden = []
    for m in muster:
        for p in glob.glob(os.path.join(ROOT, m)):
            if ".min." in os.path.basename(p):
                continue
            if os.path.basename(p) == "icons_bauen.py":
                continue          # die Beispiele in dieser Datei zaehlen nicht
            gefunden.append(p)
    return sorted(gefunden)


def sammle():
    """Gibt {familie: {symbolnamen}} und {symbol: [fundstellen]} zurueck."""
    je_familie = {"solid": set(), "regular": set(), "brands": set()}
    herkunft = {}

    for pfad in dateien():
        try:
            text = open(pfad, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError):
            continue
        kurz = os.path.relpath(pfad, ROOT).replace(os.sep, "/")

        # 1. mit ausdruecklicher Familie ("fa-brands fa-instagram")
        mit_familie = set()
        for fam, name in FAMILIE_KLASSE.findall(text):
            if name in KEINE_SYMBOLE:
                continue
            je_familie[fam].add(name)
            mit_familie.add(name)
            herkunft.setdefault(name, set()).add(kurz)

        # 2. einzeln in Anfuehrungszeichen ("fa-star") - das benutzen die
        #    Pflege-Werkzeuge und die Tabellen in js/suche.js. Ohne Angabe
        #    der Familie zaehlt es als solid, so setzt der Code es auch ein.
        for name in NAME_ROH.findall(text):
            if name in KEINE_SYMBOLE or name in mit_familie:
                continue
            je_familie["solid"].add(name)
            herkunft.setdefault(name, set()).add(kurz)

    for fam, namen in IMMER_DABEI.items():
        je_familie[fam].update(namen)
        for n in namen:
            herkunft.setdefault(n, set()).add("(Rueckfallwert im Code)")

    return je_familie, herkunft


# Font Awesome fasst gleichbedeutende Namen in EINER Regel zusammen, etwa
#     .fa-bars,.fa-navicon{--fa:"\f0c9"}
# Deshalb erst die ganze Selektorliste greifen und dann aufteilen. Ein
# Muster, das nur ".fa-name{" sucht, findet jeweils bloss den letzten Namen
# und haelt alle anderen faelschlich fuer nicht vorhanden - fa-bars,
# fa-magnifying-glass und fa-location-dot fielen genau darauf herein.
REGEL = re.compile(r"((?:\.fa-[a-z0-9-]+,)*\.fa-[a-z0-9-]+)\{--fa:\"\\([0-9a-f]+)\"\}")


def zeichen_tabelle():
    """{symbolname: codepoint} aus dem vollstaendigen Font-Awesome-CSS."""
    css = open(os.path.join(QUELLE, "all.min.css"), encoding="utf-8").read()
    tabelle = {}
    for auswahl, code in REGEL.findall(css):
        for name in auswahl.split(","):
            tabelle[name.lstrip(".")] = int(code, 16)
    return tabelle


def schriften_ausduennen(je_familie, tabelle):
    """Verkleinert die drei woff2-Dateien. Gibt Berichtzeilen zurueck."""
    from fontTools import subset

    bericht = []
    for fam, (dateiname, _) in SCHRIFTEN.items():
        namen = sorted(je_familie[fam])
        codes = [tabelle[n] for n in namen if n in tabelle]
        quelle = os.path.join(QUELLE, dateiname)
        ziel = os.path.join(ROOT, "webfonts", dateiname)
        vorher = os.path.getsize(quelle) // 1024

        if not codes:
            # Keine Symbole aus dieser Familie - Datei trotzdem erzeugen,
            # damit das CSS nicht ins Leere zeigt.
            codes = [0x20]

        einstellungen = subset.Options()
        einstellungen.flavor = "woff2"
        einstellungen.desubroutinize = True
        einstellungen.layout_features = []
        einstellungen.name_IDs = []
        einstellungen.notdef_outline = True
        schrift = subset.load_font(quelle, einstellungen)
        subsetter = subset.Subsetter(options=einstellungen)
        subsetter.populate(unicodes=codes)
        subsetter.subset(schrift)
        subset.save_font(schrift, ziel, einstellungen)
        schrift.close()

        nachher = os.path.getsize(ziel) // 1024
        bericht.append(f"  {dateiname:24} {vorher:4} -> {nachher:4} KB "
                       f"({len(codes)} Symbole)")
    return bericht


def css_ausduennen(je_familie, tabelle):
    """Schreibt css/all.min.css mit nur den benutzten Symbolregeln."""
    css = open(os.path.join(QUELLE, "all.min.css"), encoding="utf-8").read()
    vorher = len(css)

    benutzt = set()
    for namen in je_familie.values():
        benutzt |= namen

    def ersetze(treffer):
        namen = {n.lstrip(".") for n in treffer.group(1).split(",")}
        gebraucht = sorted(namen & benutzt)
        if not gebraucht:
            return ""
        # Regel behalten, aber nur mit den Namen, die wir wirklich benutzen -
        # die Zweitnamen (fa-navicon fuer fa-bars) braucht die Seite nicht.
        auswahl = ",".join("." + n for n in gebraucht)
        return auswahl + treffer.group(0)[treffer.group(0).index("{"):]

    schlank = REGEL.sub(ersetze, css)

    kopf = ("/* Font Awesome, eingedampft auf die Symbole, die diese Seite\n"
            "   wirklich benutzt. Erzeugt von tools/icons_bauen.py aus\n"
            "   tools/schriften-quelle/ - nicht von Hand aendern.\n"
            f"   {len(benutzt)} von 1970 Symbolen. */\n")
    ziel = os.path.join(ROOT, "css", "all.min.css")
    with open(ziel, "w", encoding="utf-8", newline="\n") as f:
        f.write(kopf + schlank)
    nachher = os.path.getsize(ziel)
    return f"  all.min.css              {vorher//1024:4} -> {nachher//1024:4} KB"


def zurueck():
    for name in os.listdir(QUELLE):
        if name.endswith(".woff2"):
            shutil.copy(os.path.join(QUELLE, name), os.path.join(ROOT, "webfonts", name))
        elif name == "all.min.css":
            shutil.copy(os.path.join(QUELLE, name), os.path.join(ROOT, "css", name))
    print("Vollstaendige Font-Awesome-Fassung wiederhergestellt.")


def main():
    if "--alles-zurueck" in sys.argv:
        zurueck()
        return

    je_familie, herkunft = sammle()
    gesamt = sum(len(v) for v in je_familie.values())

    print("=" * 62)
    print("  Symbole der Webseite")
    print("=" * 62)
    for fam in ("solid", "regular", "brands"):
        namen = sorted(je_familie[fam])
        print(f"\n{fam} ({len(namen)}):")
        for i in range(0, len(namen), 4):
            print("   " + "  ".join(n.ljust(26) for n in namen[i:i + 4]).rstrip())
    print(f"\nZusammen {gesamt} Symbole aus {len(dateien())} Dateien.")

    tabelle = zeichen_tabelle()
    fehlend = [n for namen in je_familie.values() for n in namen if n not in tabelle]
    if fehlend:
        print("\nWARNUNG - in Font Awesome nicht gefunden (Tippfehler?):")
        for n in sorted(fehlend):
            print(f"   {n}   benutzt in: {', '.join(sorted(herkunft.get(n, [])))}")

    if "--nur-liste" in sys.argv:
        print("\n(nur Liste - nichts geaendert)")
        return

    print("\nSchriften und CSS werden neu geschrieben ...")
    zeilen = schriften_ausduennen(je_familie, tabelle)
    zeilen.append(css_ausduennen(je_familie, tabelle))
    print("\n".join(zeilen))
    print("\nFertig. Danach einmal:  python tools/pruefe_seite.py")


if __name__ == "__main__":
    main()
