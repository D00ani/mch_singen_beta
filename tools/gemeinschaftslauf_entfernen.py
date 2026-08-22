# -*- coding: utf-8 -*-
"""
Entfernt die Fotos vom Gemeinschaftslauf 2026 wieder von der Webseite.

Gedacht als Notausgang: falls die Freigabe fuer die Bilder zurueckgezogen
wird (auf dem Lauf waren auch Fahrerinnen und Fahrer anderer Vereine), holt
dieses Werkzeug alles in einem Rutsch wieder heraus.

Es entfernt
  - jeden Markerblock "FOTOS GEMEINSCHAFTSLAUF 2026" aus den HTML-Seiten
    (aktuell: kartsport.html, ueber-uns.html, statistiken.html)
  - den Bildordner media/bilder/gemeinschaftslauf-2026/

Es laesst bewusst stehen
  - das Foto des Vereinskarts (media/bilder/kartsport/mach1-kart.*). Das ist
    ein dauerhafter Ersatz fuer das fruehere Werksfoto und hat mit der
    Freigabe der Laufbilder nichts zu tun.

Aufruf:
    python tools/gemeinschaftslauf_entfernen.py             (zeigt nur an)
    python tools/gemeinschaftslauf_entfernen.py --entfernen (macht es)

Vor jeder Aenderung wird automatisch gesichert, "Rueckgaengig" im
Pflege-Fenster holt den Stand also zurueck. Danach einmal
    python tools/build_assets.py
ist nicht noetig - es wurde nur HTML geaendert, kein CSS und kein JS.
"""
import glob
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pflege_hilfen as h

ROOT = h.ROOT
BILDORDNER = os.path.join(ROOT, "media", "bilder", "gemeinschaftslauf-2026")

# Alles zwischen ANFANG- und ENDE-Marker, samt der Marker selbst und der
# Leerzeile dahinter. Nicht gierig, damit mehrere Bloecke je Datei gehen.
# \r?\n ist Absicht: die Seiten haben gemischte Zeilenenden (kartsport.html
# LF, ueber-uns.html und statistiken.html CRLF), und lies_datei() laesst sie
# bewusst so, wie sie sind.
BLOCK = re.compile(
    r"[ \t]*<!-- FOTOS GEMEINSCHAFTSLAUF 2026 - ANFANG.*?"
    r"<!-- FOTOS GEMEINSCHAFTSLAUF 2026 - ENDE[^>]*-->\r?\n(?:[ \t]*\r?\n)?",
    re.DOTALL)


def html_dateien():
    return sorted(glob.glob(os.path.join(ROOT, "*.html"))
                  + glob.glob(os.path.join(ROOT, "pages", "*.html")))


def main():
    entfernen = "--entfernen" in sys.argv
    treffer = []

    for pfad in html_dateien():
        inhalt = h.lies_datei(pfad)
        neu, anzahl = BLOCK.subn("", inhalt)
        if not anzahl:
            continue
        treffer.append((pfad, anzahl))
        if entfernen:
            h.schreibe_datei(pfad, neu)

    print("=" * 60)
    print("  Fotos vom Gemeinschaftslauf 2026")
    print("=" * 60)

    if not treffer:
        print("\nKeine Markerbloecke gefunden - die Bilder sind bereits raus")
        print("(oder wurden nie eingebaut).")
    else:
        for pfad, anzahl in treffer:
            print(f"  {os.path.relpath(pfad, ROOT)}: {anzahl} Block/Bloecke")

    if os.path.isdir(BILDORDNER):
        dateien = os.listdir(BILDORDNER)
        groesse = sum(os.path.getsize(os.path.join(BILDORDNER, d))
                      for d in dateien) // 1024
        print(f"  media/bilder/gemeinschaftslauf-2026/: "
              f"{len(dateien)} Dateien, {groesse} KB")
        if entfernen:
            shutil.rmtree(BILDORDNER)
    else:
        print("  Bildordner ist bereits weg.")

    if entfernen:
        print("\nEntfernt. Das Foto des Vereinskarts (mach1-kart) bleibt.")
        print("Zum Pruefen:  python tools/pruefe_seite.py")
    elif treffer or os.path.isdir(BILDORDNER):
        print("\nNoch nichts geaendert.")
        print("Wirklich entfernen:  python tools/gemeinschaftslauf_entfernen.py --entfernen")


if __name__ == "__main__":
    main()
