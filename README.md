media-impact
============

Using various data sources to visualize the digital impact of meteorites

https://cpietsch.github.io/media-impact

There is already a foto-stream of the process online.
http://www.flickr.com/photos/58821321@N06/sets/72157634070386066/

This project is part of the http://visualizing.org/contests/visualizing-meteorites Challenge.

Created at the course "Dataviz Challenges 2013" at FH Potsdam
https://github.com/FH-Potsdam/dataviz-2013
https://incom.org/workspace/4324

![](https://raw.githubusercontent.com/cpietsch/media-impact/master/dataviz-pietsch/dataviz-pietsch.004.jpeg)

# GERMAN Documentation

## Idee
Wie groß ist der mediale Einschlag der Meteoriten im Internet und wie kann man diesen Einschlag in Verbindung mit der Masse, Jahr des Einschlags und anderen Parametern setzen?
http://zeigma.com/impact
Datenbeschaffung

## Wie beschafft man sich Bekanntheitswerte für mehr als 30000 Meteoriten?
Zu erst einmal muss man klären was relevante Daten sind. Dazu haben wir Google, Bing, Flickr, Youtube und Twitter mit einem bestimmten Suchwort-Satz durchsucht: "NAME DES METEROITEN meteorite". Dieser Suchsatz lieferte die eindeutigsten Ergebnisse zu dem tatsächlich gesuchten Meteoriten. Andere Kombinationen lieferten sehr ungenaue Ergebnisse und hätten dadurch unser Ranking verfälscht. Darauf hin haben wir die Anzahl der Suchergebnisse genommen um den Bekanntheitsgrad zu ermitteln.
Scraping: Der Begriff Screen Scraping (engl., etwa: „Bildschirm auskratzen“) umfasst generell alle Verfahren zum auslesen von Texten aus Computerbildschirmen. Gegenwärtig wird der Ausdruck jedoch beinahe ausschließlich in Bezug auf Webseiten verwendet (daher auch Web Scraping) http://de.wikipedia.org/wiki/Screen_Scraping
Google

## Scrape the shit out of it, the google way
Am relevantesten kam uns am Anfang der Recherche die Trefferanzahl bei Google vor. Deswegen versuchten wir auch als erstes Daten von Google zu aggregieren, was sich leider als schwieriger als gedacht erwies.
Es gibt 2 Varianten um an die Inhalte der Trefferlisten von google zu kommen: dafür bezahlen oder mit ein bisschen Aufwand die Daten selbst scrapen.
Bei der ersten Variante bedient man sich der sehr gut dokumentierten google search api https://developers.google.com/web-search/docs/ und bezahlt für 1000 Requests 5$. Das macht bei 30000 Meteoriten knapp 150$. Fuck. Ganz schön dreist, wenn man sich überlegt, dass google sich kostenlos der Daten bedient mit denen es arbeitet.
Die zweite Variante bedient sich dem automatisierten scrapen von google. Laut google ist das illegal, und versucht auch desgleichen mit Captcha-Stopseiten zu unterbinden. Also wie scrape ich Seiten die nicht gescraped werden wollen.
Ein guter Einstieg gab mir der Talk von Asheesh Laroia (http://www.youtube.com/watch?v=52wxGESwQSA) den ich nach ca einer Stunde abbrechen musste weil mein Kopf explodierte. Ganz so lowlevel wollte ich dann doch nicht arbeiten und suchte nach Alternativen in einer mir akzeptablen Programmiersprache: Javascript
Ich fand in Phantom.js ein akzeptablen Begleiter in meiner Reise durch den Scraping-Djungel. Phantom.js ist ein Kopfloser Webkit Browser, was so viel heißt, dass man mit Javascript Webseiten im Verborgenen öffnen kann und diese steuern kann. Besonders die Screenshot-Funktion erwies sich als nützlich um die Captcha Seiten von Google aus zu tricksen. Diese kommen hin und wieder wenn man google scraped.
Mein phantom.js Algoritmus funktioniert folgendermaßen:
erstelle einen Browser mit zufälliger Bildschirmgröße und BrowserAgent
öffne Google.com und warte ein bisschen
füll das Suchfeld aus, warte ein bischen und schick es ab
wenn kein captcha kommt, speichere die page und mach weiter
wenn ein captcha kommt, mach ein screenshot vom captcha und warte 20 sekunden. ließ dann das gelöste captcha aus und füll es in das feld. speichere die darauffolgende seite ab
warte ein bisschen und fang von vorne an

## Captcha
Wie löst man ein Captcha automatisiert?
Man bedient sich der Api von deathbycaptcha.com. Dieser Dienst löst ein Captcha in der Regel nach ca. 10 Sekunden.
Wie? Man Munkelt, dass der Captcha irgendwo in Indien per Hand abgetippt wird. Dank opensource und github konnte ich mir ein kleines node.js script basteln, dass ein bestimmtes Verzeichniss nach Captcha-bildern belauscht und wenn eins kommt die Api anzapft und dann das Captchawort in eine Datei speichert, die wiederherum von phantom.js eingelesen wird. Easy.
Gewappnet mit diesem Script scrapten wir google parallel von mehreren Rechnern. Das ganze ist skalierbar, und auch für andere Projekte nützlich.

##Google mit den eigenen Waffen schlagen
Per Zufall bin ich noch auf eine andere Möglichkeit gestoßen um google zu scrapen: mit Google selber. Dabei gibt es 2 Waffen: Google Spreadsheet und Google App Script.
Google Spreadsheet ist verdammt powerful und bietet die magische Funktion ImportXML die es ermöglicht externe xml-files zu parsen. Da HTML ja XML ist kann man per importXml(\"https://www.google.de/search?output=search&sclient=psy-ab&oq=&gs_l=&pbx=1&q=%22NAMEDESMETEROITS%22 meteorite\", \"//*[@id='resultStats']\") auf das result Div in der Googlesuche zugreifen. Easy. Nur leider limitiert Google die Requests pro Spreadsheet auf 50. Shit. Könnte man vielleicht automatisch Spreadsheets mit den 50 Requests per Sheet erstellen und dann die 3000 Meteroiten auf viele Spreadsheets verteilen ? Ja! Mit Google App Script.
Google App Script ist eine Javascript Umgebung mit dem man fast alle Google Produkte steuern kann - und damit auch Spreadsheet. Das Script zum erstellen der Spreadsheets mit den ImportXml Befehlen gibts hier.
Des weiteren bietet App Script die Möglichkeit direkt Dateien zu speichern, und damit auch die Google Suchergbniss HTMLs selber. Killerfaktor #2 ist, da Google App Script selber vom Google Server kommt, kommen keine Captcha Stopseiten, was schnelles Scrapen von Google Search ermöglicht. Das Script gibts hier.
  
## If you can beat Google, you can beat them all
Bing, Twitter, Youtube und Flickr zu scrapen war zum einen dank der erworbenen Fähigkeiten und zum anderen dank der gut dokumetierten und offenen APIs kein Problem mehr.
Nur Twitter erwies sich als wiederspänstig was uns auf die Topsy Api zum aggregieren der Twitter Ergebnisszahlen umsteigen ließ. Hier wird genauso Kohle gemacht mit den Daten wie bei Google.
Das war es im groben zum Thema Datenaggregation, im Detail habe ich folgende Werkzeuge kennen gelernt und genutzt:
- Casper.js - ein Wrapper für Phantom.js
- Phantom.js - ein Headless Webkit der über Javascript ansteuerbar ist
- Spooky.js - ein Wrapper für Casper.js den man in Node.js verwenden kann
- Node.js - benutzt um die DeathByCaptcha api anzuzapfen, die aggregierten Result-HTMLs weiter zu verarbeiten und zu prozessieren, Filehandling, Zusammenfassen, MultiTool
- Mongo DB - eine Document Driven Datenbank in dem die Daten gesammelt wurden und später als csv exportiert
- Google Script, Google Spreadsheet - Scraping
- D3 - Visualisierung und Datahandling in Javascript

## Visualisierung
Die Datenbeschaffung fiel ein wenig komplexer aus als gedacht, da blieb nicht all zu viel Zeit für die eigentliche Visualisierung.
Die Visualisierung ist in einem Hau-ruck Verfahren entstanden und durch die mehrmalige Verschiebung der Deadline des Kontests in Iterationen gewachsen. Grundsätzlich sollte sie einfach, schnell verständlich und eine Fusion von Visualisierung und Website sein.
Zum besteht sie aus einem Bar-Chart auf der rechten Seiten und zum anderen aus einem Content-Bereich auf der linken Seite. Ästetik stand an erster Stelle, deswegen ist die Sateliten Projektion im Hintergrund auch nicht immer Informativ (da keine richtige Lokalisierung möglich ist).
Die Impact-Werte werden im Detail per Radar Chart visualisiert und in einer History gespeichert um späteres Vergleichen zu ermöglichen.
Im groben ist trotz der kurzen Zeit eine ansehnliche Visualisierung heraus gekommen wobei das Potential der Aggregierten Daten nur am Rande ausgeschöpft wurde.
Angedacht waren noch:
Animation des Einschlages auf der Karte mit anziehenden Partikeln die Stellvertrehtend für die Medieninhalte stehen.
Erweiterung des Bar-Chart um diverse Filter und Sortiermethoden
Performance Optimierung
Kombinationsmöglichkeiten in den Datenquellen
      
## Zusammenfassung
Ne Menge gelernt was die Datenaggregation und dem Scrapen im Speziellen angeht. Auch, dass das Erstellen einer Visualisierung viel Vorarbeit benötigt.
And as always, the process is the outcome.
