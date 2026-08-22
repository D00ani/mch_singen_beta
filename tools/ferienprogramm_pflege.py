# -*- coding: utf-8 -*-
"""
Sommerferienprogramm an- und ausschalten.

Das Ferienprogramm ist ein paar Wochen im Jahr aktuell und den Rest der Zeit
vorbei. Beides steht an vier Stellen im HTML:

  pages/sommerferienprogramm.html
      FP:TERMINKASTEN   der gelbe Kasten oben mit Terminen und Ort
      FP:BLICK          die Zeile "Termine:" in "Auf einen Blick"
      FP:ANMELDUNG      der Kasten ganz unten mit den Portal-Knoepfen
  pages/aktuelles.html
      FP:NEWS           die Karte im Abschnitt Sommerferienprogramm

Dieses Werkzeug haelt alle vier Stellen aus EINEM Datensatz aktuell
(data/ferienprogramm.json). Von Hand muss nichts mehr nachgezogen werden.

Zwei Zustaende:
  an   Termine stehen fest, die Anmeldeknoepfe zeigen auf die Portale
  aus  Programm ist gelaufen, die Seite sagt "Termine <Jahr+1> folgen"

Aufruf ohne Fenster:
    python tools/ferienprogramm_pflege.py            zeigt den Stand
    python tools/ferienprogramm_pflege.py --an
    python tools/ferienprogramm_pflege.py --aus
Im Pflege-Fenster: "Inhalte pflegen" -> "Sommerferienprogramm".
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pflege_hilfen as h

ROOT = h.ROOT
DATEI = os.path.join(ROOT, "data", "ferienprogramm.json")
SEITE = os.path.join(ROOT, "pages", "sommerferienprogramm.html")
NEWS = os.path.join(ROOT, "pages", "aktuelles.html")

STANDARD = {
    "aktiv": False,
    "jahr": 2026,
    "ort": "Münchriedstraße 10, 78224 Singen (Hohentwiel)",
    "singen": {
        "datum": "Sa, 08.08.2026",
        "link": "https://www.unser-ferienprogramm.de/singen/",
    },
    "rielasingen": {
        "datum": "So, 09.08.2026",
        "link": "https://rielasingen-worblingen.ferienprogramm-online.de/",
    },
}


# ------------------------------------------------------------------
# Datensatz
# ------------------------------------------------------------------

def lies():
    """Liest data/ferienprogramm.json, ergaenzt fehlende Felder."""
    daten = dict(STANDARD)
    if os.path.isfile(DATEI):
        with open(DATEI, encoding="utf-8") as f:
            gelesen = json.load(f)
        for schluessel, wert in gelesen.items():
            if isinstance(wert, dict) and isinstance(daten.get(schluessel), dict):
                daten[schluessel] = {**daten[schluessel], **wert}
            else:
                daten[schluessel] = wert
    daten["jahr"] = int(daten["jahr"])
    daten["aktiv"] = bool(daten["aktiv"])
    return daten


def schreibe(daten):
    os.makedirs(os.path.dirname(DATEI), exist_ok=True)
    with open(DATEI, "w", encoding="utf-8", newline="\n") as f:
        json.dump(daten, f, ensure_ascii=False, indent=2)
        f.write("\n")


def pruefe(daten):
    """Gibt eine Liste von Beanstandungen zurueck (leer = in Ordnung).

    Die LINKS werden immer geprueft: sie stehen in beiden Zustaenden als
    Knopf auf der Seite (im Aus-Zustand als Verweis auf die Portal-
    Startseite). Die DATEN erst, wenn das Programm laeuft - solange die
    Termine nicht feststehen, sollen sie leer bleiben duerfen.
    """
    fehler = []
    if not (2000 <= daten["jahr"] <= 2100):
        fehler.append("Jahr sieht nicht nach einer Jahreszahl aus.")
    for name, beschriftung in (("singen", "Singen"),
                               ("rielasingen", "Rielasingen-Worblingen")):
        teil = daten[name]
        if not teil.get("link", "").strip().startswith("http"):
            fehler.append(f"Link für {beschriftung} ist keine vollständige Adresse.")
        if daten["aktiv"] and not teil.get("datum", "").strip():
            fehler.append(f"Datum für {beschriftung} fehlt.")
    return fehler


# ------------------------------------------------------------------
# HTML-Bausteine
# ------------------------------------------------------------------

def _e(text):
    """Kaufmanns-Und fuer HTML absichern (die Datumsangaben sind Freitext)."""
    return text.replace("&", "&amp;")


GELB = 'style="color: #d4a000; margin-right: 8px;"'
KNOPF = ('style="background-color: #ff9800; color: #fff; font-size: 1rem; '
         'padding: 13px 25px; border-radius: 10px; display: inline-flex;')


def terminkasten(d, z):
    s, r = d["singen"], d["rielasingen"]
    if d["aktiv"]:
        zeilen = [
            f'<div class="note-box" style="margin-top: 20px; margin-bottom: 30px;">',
            f'    <i class="fa-solid fa-calendar-days" {GELB}></i>',
            f'    <strong>Termine {d["jahr"]}:</strong> {_e(s["datum"])} &amp; {_e(r["datum"])} &nbsp;|&nbsp;',
            f'    <i class="fa-solid fa-location-dot" style="color: #d4a000; margin: 0 8px;"></i>',
            f'    {_e(d["ort"])}',
            f'</div>',
        ]
    else:
        zeilen = [
            f'<div class="note-box" style="margin-top: 20px; margin-bottom: 30px;">',
            f'    <i class="fa-solid fa-calendar-days" {GELB}></i>',
            f'    <strong>Das Ferienprogramm {d["jahr"]} ist gelaufen.</strong>',
            f'    Die Termine für {d["jahr"] + 1} stehen noch nicht fest - sie erscheinen hier,',
            f'    sobald die Ferienprogramme von Singen und Rielasingen-Worblingen',
            f'    veröffentlicht sind.',
            f'    <br>',
            f'    <i class="fa-solid fa-location-dot" {GELB}></i>',
            f'    Stattgefunden hat es wie immer bei uns auf dem Gelände: {_e(d["ort"])}',
            f'</div>',
        ]
    return "\n".join(z + x for x in zeilen)


def blickzeile(d, z):
    s, r = d["singen"], d["rielasingen"]
    if d["aktiv"]:
        text = (f'Termine: {_e(s["datum"])} (Ferienprogramm Singen) &amp; '
                f'{_e(r["datum"])} (Ferienprogramm Rielasingen-Worblingen)')
    else:
        text = (f'Termine: für {d["jahr"] + 1} noch offen - zuletzt {_e(s["datum"])} '
                f'(Ferienprogramm Singen) &amp; {_e(r["datum"])} '
                f'(Ferienprogramm Rielasingen-Worblingen)')
    return z + f"<li>{text}</li>"


def _portalknopf(link, text, z, zusatz=""):
    stil = KNOPF + (f' {zusatz}"' if zusatz else '"')
    return "\n".join([
        z + f'<a href="{link}"',
        z + f'   target="_blank" rel="noopener noreferrer" class="action-btn"',
        z + f'   {stil}>',
        z + f'    <i class="fa-solid fa-external-link-alt" style="margin-right: 10px;"></i> {text}',
        z + f'</a>',
    ])


def anmeldung(d, z):
    s, r = d["singen"], d["rielasingen"]
    if d["aktiv"]:
        kopf = [
            z + '<h3 style="color: var(--primary-blue); margin-bottom: 10px;">Jetzt anmelden!</h3>',
            z + '<p style="margin-bottom: 20px;">Die Anmeldung und alle weiteren Infos findet ihr '
                'direkt auf dem jeweiligen offiziellen Ferienprogramm-Portal:</p>',
        ]
        knoepfe = [
            _portalknopf(s["link"], f'{_e(s["datum"])} - Portal der Stadt Singen', z),
            z + "<br>",
            _portalknopf(r["link"], f'{_e(r["datum"])} - Portal Rielasingen-Worblingen',
                         z, "margin-top: 12px;"),
        ]
        return "\n".join(kopf + knoepfe)

    kopf = [
        z + f'<h3 style="color: var(--primary-blue); margin-bottom: 10px;">Anmeldung für {d["jahr"] + 1}</h3>',
        z + '<p style="margin-bottom: 20px;">Die Anmeldung läuft immer über die offiziellen '
            'Ferienprogramm-Portale der',
        z + f'Stadt Singen und der Gemeinde Rielasingen-Worblingen. Für {d["jahr"] + 1} ist dort '
            'noch nichts eingestellt -',
        z + 'sobald die Programme erscheinen, sind wir wieder dabei. Ein Blick lohnt sich:</p>',
    ]
    knoepfe = [
        _portalknopf(s["link"], "Ferienprogramm-Portal Singen", z),
        z + "<br>",
        _portalknopf(r["link"], "Ferienprogramm-Portal Rielasingen-Worblingen",
                     z, "margin-top: 12px;"),
        z + '<p style="margin-top: 18px; margin-bottom: 0; font-size: 0.92rem;">',
        z + '    Du willst nichts verpassen? Schreib uns über das',
        z + '    <a href="kontakt.html">Kontaktformular</a>, dann melden wir uns, '
            'sobald die Termine stehen.',
        z + '</p>',
    ]
    return "\n".join(kopf + knoepfe)


def newskarte(d, z):
    s, r = d["singen"], d["rielasingen"]
    if d["aktiv"]:
        datum = f'{_e(s["datum"])} &amp; {_e(r["datum"])}'
        text = ('Kinder &amp; Jugendliche können bei uns Kart fahren, den Trialsport kennenlernen\n'
                + z + '    und einen echten Motorsportverein erleben - keine Vorkenntnisse nötig!')
        knoepfe = [
            z + '<a href="sommerferienprogramm.html" class="action-btn action-btn--orange">',
            z + '    <span class="news-icon"><i class="fa-solid fa-circle-info"></i></span> Mehr Infos',
            z + '</a>',
            z + f'<a href="{s["link"]}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn--gold">',
            z + f'    <span class="news-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span> Anmeldung Singen',
            z + '</a>',
            z + f'<a href="{r["link"]}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn--gold">',
            z + f'    <span class="news-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span> Anmeldung Rielasingen-Worblingen',
            z + '</a>',
        ]
    else:
        datum = f'Termine {d["jahr"] + 1} folgen'
        text = ('Kinder &amp; Jugendliche können bei uns Kart fahren, den Trialsport kennenlernen\n'
                + z + '    und einen echten Motorsportverein erleben - keine Vorkenntnisse nötig!\n'
                + z + f'    Das Programm {d["jahr"]} ist gelaufen; die nächsten Termine stehen hier,\n'
                + z + '    sobald die Ferienprogramme erscheinen.')
        knoepfe = [
            z + '<a href="sommerferienprogramm.html" class="action-btn action-btn--orange">',
            z + '    <span class="news-icon"><i class="fa-solid fa-circle-info"></i></span> Mehr Infos',
            z + '</a>',
        ]
    return "\n".join([
        z + '<div class="news-card news-card--highlight">',
        z + '    <div>',
        z + f'        <span class="news-date">{datum}</span>',
        z + '        <h3>Ferienprogramme Singen &amp; Rielasingen-Worblingen</h3>',
        z + '        <p class="news-card-desc">',
        z + '    ' + text,
        z + '        </p>',
        z + '    </div>',
        z + '    <div class="button-group">',
    ] + ["    " + k for k in knoepfe] + [
        z + '    </div>',
        z + '</div>',
    ])


BAUSTEINE = {
    "TERMINKASTEN": (SEITE, terminkasten),
    "BLICK": (SEITE, blickzeile),
    "ANMELDUNG": (SEITE, anmeldung),
    "NEWS": (NEWS, newskarte),
}


# ------------------------------------------------------------------
# HTML schreiben
# ------------------------------------------------------------------

def _muster(name):
    return re.compile(
        r"([ \t]*)<!-- FP:" + name + r" -->\r?\n"
        r".*?"
        r"[ \t]*<!-- /FP:" + name + r" -->",
        re.DOTALL)


def anwenden(daten):
    """Schreibt alle vier Bausteine neu. Gibt eine Liste der Aenderungen zurueck."""
    fehlend = []
    inhalte = {}
    for name, (pfad, _) in BAUSTEINE.items():
        inhalte.setdefault(pfad, h.lies_datei(pfad))
        if not _muster(name).search(inhalte[pfad]):
            fehlend.append(f"Marker FP:{name} fehlt in {os.path.basename(pfad)}")
    if fehlend:
        raise ValueError("\n".join(fehlend))

    bericht = []
    for name, (pfad, bauer) in BAUSTEINE.items():
        muster = _muster(name)
        treffer = muster.search(inhalte[pfad])
        z = treffer.group(1)
        neu = (f"{z}<!-- FP:{name} -->\n"
               + bauer(daten, z) + f"\n{z}<!-- /FP:{name} -->")
        zeilenende = "\r\n" if "\r\n" in inhalte[pfad] else "\n"
        neu = neu.replace("\n", zeilenende)
        if treffer.group(0) != neu:
            inhalte[pfad] = inhalte[pfad][:treffer.start()] + neu + inhalte[pfad][treffer.end():]
            bericht.append(f"FP:{name} in {os.path.basename(pfad)} aktualisiert")

    for pfad, inhalt in inhalte.items():
        h.schreibe_datei(pfad, inhalt)
    return bericht


def setze(aktiv=None, **felder):
    """Zustand aendern und sofort ins HTML schreiben."""
    daten = lies()
    if aktiv is not None:
        daten["aktiv"] = bool(aktiv)
    for schluessel, wert in felder.items():
        if "_" in schluessel:
            ort, feld = schluessel.split("_", 1)
            if ort in ("singen", "rielasingen"):
                daten[ort][feld] = wert
                continue
        daten[schluessel] = wert
    fehler = pruefe(daten)
    if fehler:
        raise ValueError("\n".join(fehler))
    schreibe(daten)
    return daten, anwenden(daten)


# ------------------------------------------------------------------
# Ohne Fenster
# ------------------------------------------------------------------

def main():
    daten = lies()
    if "--an" in sys.argv or "--aus" in sys.argv:
        daten, bericht = setze(aktiv="--an" in sys.argv)
        print("Zustand:", "AN" if daten["aktiv"] else "AUS")
        for zeile in bericht:
            print(" ", zeile)
        if not bericht:
            print("  (HTML war schon auf diesem Stand)")
        return

    print("=" * 58)
    print("  Sommerferienprogramm")
    print("=" * 58)
    print(f"  Zustand : {'AN - Termine stehen' if daten['aktiv'] else 'AUS - Programm gelaufen'}")
    print(f"  Jahr    : {daten['jahr']}")
    print(f"  Singen  : {daten['singen']['datum']}  {daten['singen']['link']}")
    print(f"  Rielas. : {daten['rielasingen']['datum']}  {daten['rielasingen']['link']}")
    print(f"  Ort     : {daten['ort']}")
    fehler = pruefe(daten)
    if fehler:
        print("\n  Zu klaeren:")
        for f in fehler:
            print("   -", f)
    print("\n  Umschalten: --an oder --aus")
    print("  Termine und Links aendern: Pflege-Fenster -> Sommerferienprogramm")


if __name__ == "__main__":
    main()
