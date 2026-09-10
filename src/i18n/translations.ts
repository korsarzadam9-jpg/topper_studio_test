import type { Locale } from "./locales";
import { pageExtras } from "./pageExtras";

export type Msg =
  | "brand.tag"
  | "lang.label"
  | "mode.fonts"
  | "mode.file"
  | "section.lines"
  | "row.label"
  | "row.remove"
  | "row.placeholder"
  | "row.size"
  | "row.add"
  | "row.color"
  | "align.left"
  | "align.center"
  | "align.right"
  | "spacing.letters"
  | "spacing.lines"
  | "file.title"
  | "file.drop"
  | "file.hint"
  | "section.size"
  | "size.width"
  | "size.height"
  | "size.locked"
  | "size.unlocked"
  | "size.halo"
  | "size.offsetZ"
  | "size.textZ"
  | "size.letteringHint"
  | "section.sticks"
  | "sticks.enabled"
  | "sticks.count"
  | "sticks.length"
  | "sticks.width"
  | "sticks.offsetX"
  | "sticks.offsetY"
  | "sticks.spacing"
  | "sticks.mountNote"
  | "sticks.mountStl"
  | "sticks.mount3mf"
  | "section.colors"
  | "color.lettering"
  | "color.offset"
  | "color.preset"
  | "export.whole"
  | "export.separate"
  | "export.embed"
  | "export.letteringStl"
  | "export.lettering3mf"
  | "export.letteringSvg"
  | "export.offsetStl"
  | "export.offset3mf"
  | "export.offsetSvg"
  | "export.paywall"
  | "export.paywallLead"
  | "export.remaining"
  | "export.unlimited"
  | "export.admin"
  | "export.expired"
  | "export.quota"
  | "preview.2d"
  | "preview.3d"
  | "preview.halo"
  | "preview.show3d"
  | "preview.show2d"
  | "preview.zoomIn"
  | "preview.zoomOut"
  | "preview.empty"
  | "preview.busy"
  | "preview.dragHint"
  | "fonts.search"
  | "fonts.all"
  | "fonts.handwriting"
  | "fonts.display"
  | "fonts.serif"
  | "fonts.sans"
  | "fonts.mono"
  | "fonts.count"
  | "fonts.filtered"
  | "fonts.empty"
  | "error.needFile"
  | "error.needText"
  | "error.build"
  | "error.unknownFont"
  | "error.loadFont"
  | "error.shape"
  | "nav.studio"
  | "nav.print"
  | "nav.order"
  | "nav.pricing"
  | "nav.account"
  | "nav.login"
  | "preview.save"
  | "preview.saved"
  | "plan.starter"
  | "plan.maker"
  | "plan.commercial"
  | "plan.none"
  | "plan.once"
  | "plan.month"
  | "plan.or"
  | "plan.buyOnce"
  | "plan.buyMonth"
  | "plan.choose"
  | "plan.title"
  | "plan.lead"
  | "plan.paypalSoon"
  | "plan.needAccount"
  | "plan.duration.starter"
  | "plan.duration.maker"
  | "plan.duration.commercial"
  | "plan.feature.preview"
  | "plan.feature.svg"
  | "plan.feature.stlParts"
  | "plan.feature.exportsFree"
  | "plan.feature.3mf"
  | "plan.feature.fonts"
  | "plan.feature.cloud"
  | "plan.feature.perLine"
  | "plan.feature.unlimited"
  | "plan.feature.personal"
  | "plan.feature.combinedStl"
  | "plan.feature.combined3mf"
  | "plan.feature.license"
  | "plan.feature.sell"
  | "plan.feature.exports20"
  | "plan.feature.exports100"
  | "plan.feature.days30"
  | "plan.feature.days90"
  | "plan.feature.yearAccess"
  | "auth.title"
  | "auth.login"
  | "auth.register"
  | "auth.logout"
  | "auth.email"
  | "auth.password"
  | "auth.name"
  | "auth.submitLogin"
  | "auth.submitRegister"
  | "auth.exists"
  | "auth.invalid"
  | "auth.needLogin"
  | "auth.needPlan"
  | "auth.hello"
  | "auth.plan"
  | "auth.planUntil"
  | "auth.exportsLeft"
  | "auth.exportsUnlimited"
  | "auth.planExpired"
  | "auth.daysLeft"
  | "auth.admin"
  | "auth.adminAccess"
  | "auth.projects"
  | "auth.emptyProjects"
  | "auth.openProject"
  | "auth.close"
  | "auth.lead"
  | "print.title"
  | "print.lead"
  | "print.stl.title"
  | "print.stl.body"
  | "print.3mf.title"
  | "print.3mf.body"
  | "print.slicer.title"
  | "print.slicer.intro"
  | "print.slicer.s1.title"
  | "print.slicer.s1.body"
  | "print.slicer.s2.title"
  | "print.slicer.s2.body"
  | "print.slicer.s3.title"
  | "print.slicer.s3.body"
  | "print.slicer.s4.title"
  | "print.slicer.s4.body"
  | "print.svg.title"
  | "print.svg.body"
  | "print.cut.title"
  | "print.svg.cricut"
  | "print.svg.silhouette"
  | "print.svg.xtool"
  | "order.title"
  | "order.lead"
  | "order.first"
  | "order.last"
  | "order.email"
  | "order.file"
  | "order.fileHint"
  | "order.message"
  | "order.messagePh"
  | "order.messageDefault"
  | "order.send"
  | "order.sent"
  | "order.contact"
  | "order.mailtoNote"
  | "order.siteNote"
  | "order.mail"
  | "order.socials"
  | "order.web"
  | "order.preview"
  | "order.previewEmpty"
  | "pricing.title"
  | "pricing.lead"
  | "pricing.fxNote"
  | "footer.copy"
  | "footer.follow"
  | "social.instagram"
  | "social.tiktok"
  | "social.facebook";

const en: Record<Msg, string> = {
  "brand.tag": "Topper Studio",
  "lang.label": "Language",
  "mode.fonts": "From fonts",
  "mode.file": "From file",
  "section.lines": "Lines",
  "row.label": "Line {n}",
  "row.remove": "Remove",
  "row.placeholder": "Type your text…",
  "row.size": "Line size",
  "row.add": "+ Add line",
  "row.color": "Line color",
  "align.left": "Left",
  "align.center": "Center",
  "align.right": "Right",
  "spacing.letters": "Letter spacing",
  "spacing.lines": "Line spacing",
  "file.title": "SVG file",
  "file.drop": "Drop or choose a file",
  "file.hint": "Your own lettering, logo, or artwork as SVG.",
  "section.size": "Size",
  "size.width": "Width",
  "size.height": "Height",
  "size.locked": "Aspect ratio locked",
  "size.unlocked": "Aspect ratio unlocked",
  "size.halo": "Halo thickness",
  "size.offsetZ": "Offset Z",
  "size.textZ": "Lettering Z",
  "size.letteringHint": "Width and height apply only to the lettering and halo — the stick is set separately and is not included.",
  "section.sticks": "Sticks",
  "sticks.enabled": "Printed sticks",
  "sticks.count": "Count",
  "sticks.length": "Length",
  "sticks.width": "Width",
  "sticks.offsetX": "Offset X",
  "sticks.offsetY": "Offset Y",
  "sticks.spacing": "Stick spacing",
  "sticks.mountNote": "Attach the toothpick-mount file and glue the sockets onto the back of the lettering.",
  "sticks.mountStl": "Download mounts STL",
  "sticks.mount3mf": "Download mounts 3MF",
  "section.colors": "Preview colors",
  "color.lettering": "Lettering",
  "color.offset": "Offset",
  "color.preset": "Color preset",
  "export.whole": "Whole topper",
  "export.separate": "Separate parts",
  "export.embed": "The offset has a 0.5 mm pocket, slightly larger than the lettering so it drops in without a press fit.",
  "export.letteringStl": "Lettering STL",
  "export.lettering3mf": "Lettering 3MF",
  "export.letteringSvg": "Lettering SVG",
  "export.offsetStl": "Offset STL",
  "export.offset3mf": "Offset 3MF",
  "export.offsetSvg": "Offset SVG",
  "export.paywall": "Downloads and saves unlock after you register and pay for a package. Click a file button to see prices.",
  "export.paywallLead": "Register, then pay for a package. Downloads stay unlocked for that package’s duration and export limit.",
  "export.remaining": "{n} downloads left · valid until {date}",
  "export.unlimited": "Unlimited downloads · valid until {date}",
  "export.admin": "Admin — unlimited downloads and saves.",
  "export.expired": "This package has ended. Choose a new one to keep downloading.",
  "export.quota": "This package has no downloads left. Choose a new package.",
  "preview.2d": "2D preview",
  "preview.3d": "3D preview",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "View 3D",
  "preview.show2d": "View 2D",
  "preview.zoomIn": "Zoom in",
  "preview.zoomOut": "Zoom out",
  "preview.empty": "Your topper will appear here",
  "preview.busy": "Building topper…",
  "preview.dragHint": "Drag a line or the stick",
  "preview.save": "Save",
  "preview.saved": "Saved",
  "fonts.search": "Search Google Fonts…",
  "fonts.all": "All",
  "fonts.handwriting": "Script",
  "fonts.display": "Display",
  "fonts.serif": "Serif",
  "fonts.sans": "Sans",
  "fonts.mono": "Mono",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} of {total} Google Fonts",
  "fonts.empty": "No results",
  "error.needFile": "Upload an SVG to build a topper from artwork.",
  "error.needText": "Enter text in at least one line.",
  "error.build": "Could not build the topper.",
  "error.unknownFont": "Unknown font: {name}",
  "error.loadFont": "Could not load the font {name}.",
  "error.shape": "Could not build the topper shape.",
  "nav.studio": "Studio",
  "nav.print": "Print info",
  "nav.order": "Order print",
  "nav.pricing": "Pricing",
  "nav.account": "Account",
  "nav.login": "Log in",
  "plan.starter": "Starter",
  "plan.maker": "Maker",
  "plan.commercial": "Commercial",
  "plan.none": "No package",
  "plan.once": "one-time",
  "plan.month": "/ month",
  "plan.or": "or",
  "plan.buyOnce": "Buy",
  "plan.buyMonth": "Subscribe monthly",
  "plan.choose": "Choose plan",
  "plan.title": "Packages",
  "plan.lead": "Packages are paid once and last for a limited time — not forever. Each plan has a different number of exports. Prices are in euro.",
  "plan.paypalSoon": "Payment will be added later through an external checkout. Card details will not be stored in this app.",
  "plan.needAccount": "Register, then pay for a package. File downloads stay unlocked for that package’s duration and export limit.",
  "plan.duration.starter": "20 exports · 30 days",
  "plan.duration.maker": "100 exports · 90 days",
  "plan.duration.commercial": "1 year · commercial use",
  "plan.feature.preview": "2D and 3D preview",
  "plan.feature.svg": "SVG export without watermark",
  "plan.feature.stlParts": "STL as separate parts",
  "plan.feature.exportsFree": "2 exports per day",
  "plan.feature.3mf": "3MF with per-layer colour",
  "plan.feature.fonts": "Custom fonts and artwork upload",
  "plan.feature.cloud": "Cloud saved projects",
  "plan.feature.perLine": "Per-line font and size",
  "plan.feature.unlimited": "Unlimited exports",
  "plan.feature.personal": "Personal use",
  "plan.feature.combinedStl": "Combined STL",
  "plan.feature.combined3mf": "Combined 3MF for AMS / MMU",
  "plan.feature.license": "Commercial licence PDF",
  "plan.feature.sell": "Sell printed toppers",
  "plan.feature.exports20": "20 file exports",
  "plan.feature.exports100": "100 file exports",
  "plan.feature.days30": "Access for 30 days",
  "plan.feature.days90": "Access for 90 days",
  "plan.feature.yearAccess": "Access for 1 year",
  "auth.title": "Your account",
  "auth.login": "Log in",
  "auth.register": "Register",
  "auth.logout": "Log out",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.submitLogin": "Log in",
  "auth.submitRegister": "Create account",
  "auth.exists": "An account with this email already exists.",
  "auth.invalid": "Email or password is incorrect.",
  "auth.needLogin": "Log in to download or save.",
  "auth.needPlan": "An active paid package is needed to download files and save toppers.",
  "auth.hello": "Hello, {name}",
  "auth.plan": "Current plan",
  "auth.planUntil": "Active until {date}",
  "auth.exportsLeft": "{used} / {total} downloads used",
  "auth.exportsUnlimited": "Unlimited downloads",
  "auth.planExpired": "Package ended on {date}",
  "auth.daysLeft": "{n} days left",
  "auth.admin": "Admin",
  "auth.adminAccess": "Full access — unlimited downloads, no expiry.",
  "auth.projects": "Saved toppers",
  "auth.emptyProjects": "No saved toppers yet.",
  "auth.openProject": "Open",
  "auth.close": "Close",
  "auth.lead": "Log in or create an account. You can choose a package later.",
  "print.title": "Print information",
  "print.lead": "Export the topper, then open it in a slicer or a cutting program. The files are ready to print or cut — nothing extra is packed inside.",
  "print.stl.title": "STL — complete single-colour files",
  "print.stl.body": "STL files contain the whole geometry as one mesh. Use them when you print in a single colour: the offset, lettering and sticks are already combined, or exported as separate complete parts.",
  "print.3mf.title": "3MF — colour files",
  "print.3mf.body": "3MF keeps the offset and the lettering as two coloured objects. Open the combined 3MF in a slicer with AMS or MMU so each part maps to its own filament.",
  "print.slicer.title": "Open and print in a slicer",
  "print.slicer.intro": "Bambu Studio is shown below. Orca Slicer and PrusaSlicer work the same way: open the file, assign filaments, slice, then send to the printer.",
  "print.slicer.s1.title": "1. Open the file",
  "print.slicer.s1.body": "In Bambu Studio choose File → Open and pick the exported STL or 3MF. You can also drag the file onto the build-plate window.",
  "print.slicer.s2.title": "2. Place on the plate",
  "print.slicer.s2.body": "The topper should sit flat on the build plate. If it is standing on a stick, rotate it so the largest face lies down, then auto-arrange.",
  "print.slicer.s3.title": "3. Assign colours",
  "print.slicer.s3.body": "For 3MF, check that extruder 1 is the offset colour and extruder 2 is the lettering. For STL, pick one filament and print as a single body.",
  "print.slicer.s4.title": "4. Slice and print",
  "print.slicer.s4.body": "Press Slice, review the preview, then Print. PLA works well for toppers; use a 0.2 mm layer height and at least two walls.",
  "print.svg.title": "SVG — paper, vinyl and laser",
  "print.svg.body": "SVG is a flat outline of the topper. Open it in a cutting program and cut from card, vinyl or paper, or send it to a laser cutter such as xTool.",
  "print.cut.title": "Cut as a paper topper",
  "print.svg.cricut": "In Cricut Design Space choose Upload → Upload Image, select the SVG, then continue as a cut image. Attach the cutting machine and cut from cardstock.",
  "print.svg.silhouette": "In Silhouette Studio choose File → Open, pick the SVG, set the cut lines, then send to a Cameo or Portrait. Use card or adhesive vinyl for a cake topper.",
  "print.svg.xtool": "In xTool Creative Space choose Import, pick the SVG, then cut or engrave on wood, acrylic or card. The file is a closed outline ready for a laser such as xTool.",
  "order.title": "Order a print",
  "order.lead": "Send the STL or 3MF and we will reply with lead time and a quote. This is a request form — payment is arranged after we confirm the job.",
  "order.first": "First name",
  "order.last": "Last name",
  "order.email": "Email",
  "order.file": "Upload STL / 3MF",
  "order.fileHint": "Choose the exported topper file. Attach it in the email that opens.",
  "order.message": "Message",
  "order.messagePh": "Please quote lead time and price for this topper…",
  "order.messageDefault": "Please send lead time and a quote for printing this topper.",
  "order.send": "Send request",
  "order.sent": "Your email app should open. Attach the file if it was not included, then send.",
  "order.contact": "Uncle Loop Design",
  "order.mailtoNote": "The form opens your email app. Attach the STL or 3MF before sending.",
  "order.siteNote": "The topper generator is one part of Uncle Loop Design.",
  "order.mail": "Email",
  "order.socials": "Social",
  "order.web": "Website",
  "order.preview": "File preview",
  "order.previewEmpty": "The uploaded STL or 3MF will appear here.",
  "pricing.title": "Prices",
  "pricing.lead": "All packages are priced in euro and last for a limited time. After you change language, the live rate for that country is shown in brackets.",
  "pricing.fxNote": "Prices are shown in euro. Amounts in brackets are a live local estimate.",
  "footer.copy": "© Uncle Loop Design — cake toppers 2026",
  "footer.follow": "Follow",
  "social.instagram": "Instagram",
  "social.tiktok": "TikTok",
  "social.facebook": "Facebook",
};

const pl: Record<Msg, string> = {
  ...en,
  "brand.tag": "Topper Studio",
  "lang.label": "Język",
  "mode.fonts": "Z czcionek",
  "mode.file": "Z pliku",
  "section.lines": "Wiersze",
  "row.label": "Wiersz {n}",
  "row.remove": "Usuń",
  "row.placeholder": "Wpisz tekst…",
  "row.size": "Wielkość wiersza",
  "row.add": "+ Dodaj wiersz",
  "row.color": "Kolor wiersza",
  "align.left": "Lewo",
  "align.center": "Środek",
  "align.right": "Prawo",
  "spacing.letters": "Odstęp liter",
  "spacing.lines": "Odstęp wierszy",
  "file.title": "Plik SVG",
  "file.drop": "Upuść lub wybierz plik",
  "file.hint": "Własny napis, logo albo grafika w SVG.",
  "section.size": "Wymiary",
  "size.width": "Szerokość",
  "size.height": "Wysokość",
  "size.locked": "Proporcje zablokowane",
  "size.unlocked": "Proporcje odblokowane",
  "size.halo": "Grubość otoczki",
  "size.offsetZ": "Offset Z",
  "size.textZ": "Napis Z",
  "size.letteringHint": "Wymiary dotyczą wyłącznie napisu i otoczki — patyczek ustawiasz osobno i nie wchodzi w ten rozmiar.",
  "section.sticks": "Patyczki",
  "sticks.enabled": "Patyczki drukowane",
  "sticks.count": "Ilość",
  "sticks.length": "Długość",
  "sticks.width": "Szerokość",
  "sticks.offsetX": "Odstęp X",
  "sticks.offsetY": "Odstęp Y",
  "sticks.spacing": "Rozstaw patyczków",
  "sticks.mountNote": "Dołącz plik do przyklejenia mocowania wykałaczek.",
  "sticks.mountStl": "Pobierz mocowania STL",
  "sticks.mount3mf": "Pobierz mocowania 3MF",
  "section.colors": "Kolory podglądu",
  "color.lettering": "Napis",
  "color.offset": "Offset",
  "color.preset": "Zestaw kolorów",
  "export.whole": "Cały topper",
  "export.separate": "Osobno",
  "export.embed": "Offset ma kieszeń 0,5 mm, minimalnie większą niż napis — wchodzi z luzem, nie na wcisk.",
  "export.letteringStl": "Napis STL",
  "export.lettering3mf": "Napis 3MF",
  "export.letteringSvg": "Napis SVG",
  "export.offsetStl": "Offset STL",
  "export.offset3mf": "Offset 3MF",
  "export.offsetSvg": "Offset SVG",
  "export.paywall": "Pobieranie i zapis odblokowują się po rejestracji i opłaceniu pakietu. Kliknij przycisk pliku, żeby zobaczyć ceny.",
  "export.paywallLead": "Zarejestruj się, a potem opłać pakiet. Pobieranie zostaje odblokowane na czas i liczbę eksportów z wybranego pakietu.",
  "export.remaining": "Zostało {n} pobrań · ważne do {date}",
  "export.unlimited": "Bez limitu pobrań · ważne do {date}",
  "export.admin": "Admin — pobieranie i zapis bez limitu.",
  "export.expired": "Ten pakiet się skończył. Wybierz nowy, żeby dalej pobierać pliki.",
  "export.quota": "W tym pakiecie nie ma już pobrań. Wybierz nowy pakiet.",
  "preview.2d": "Podgląd 2D",
  "preview.3d": "Podgląd 3D",
  "preview.halo": "Otoczka {n} mm",
  "preview.show3d": "Zobacz 3D",
  "preview.show2d": "Zobacz 2D",
  "preview.zoomIn": "Przybliż",
  "preview.zoomOut": "Oddal",
  "preview.empty": "Tu pojawi się topper",
  "preview.busy": "Buduję topper…",
  "preview.dragHint": "Przeciągnij wiersz albo patyczek",
  "preview.save": "Zapisz",
  "preview.saved": "Zapisano",
  "fonts.search": "Szukaj w Google Fonts…",
  "fonts.all": "Wszystkie",
  "fonts.handwriting": "Kaligraficzne",
  "fonts.display": "Ozdobne",
  "fonts.serif": "Szeryfowe",
  "fonts.sans": "Bezszeryfowe",
  "fonts.mono": "Monospace",
  "fonts.count": "{n} czcionek Google Fonts",
  "fonts.filtered": "{n} z {total} czcionek Google Fonts",
  "fonts.empty": "Brak wyników",
  "error.needFile": "Wgraj plik SVG, żeby zbudować topper z grafiki.",
  "error.needText": "Wpisz tekst w przynajmniej jednym wierszu.",
  "error.build": "Nie udało się zbudować toppera.",
  "error.unknownFont": "Nieznana czcionka: {name}",
  "error.loadFont": "Nie udało się wczytać czcionki {name}.",
  "error.shape": "Nie udało się zbudować kształtu toppera.",
  "nav.studio": "Studio",
  "nav.print": "Informacje o druku",
  "nav.order": "Zamów druk",
  "nav.pricing": "Ceny",
  "nav.account": "Konto",
  "nav.login": "Zaloguj",
  "plan.starter": "Starter",
  "plan.maker": "Maker",
  "plan.commercial": "Commercial",
  "plan.none": "Bez pakietu",
  "plan.once": "jednorazowo",
  "plan.month": "/ miesiąc",
  "plan.or": "lub",
  "plan.buyOnce": "Kup",
  "plan.buyMonth": "Subskrypcja miesięczna",
  "plan.choose": "Wybierz pakiet",
  "plan.title": "Pakiety",
  "plan.lead": "Pakiety są płatne raz i trwają przez ograniczony czas — nie wiecznie. Każdy plan ma inną liczbę eksportów. Ceny są w euro.",
  "plan.paypalSoon": "Płatność pojawi się później przez zewnętrzny serwis. Dane kart nie będą przechowywane w tej aplikacji.",
  "plan.needAccount": "Zarejestruj się, a potem opłać pakiet. Pobieranie plików zostaje odblokowane na czas i liczbę eksportów z oferty.",
  "plan.duration.starter": "20 eksportów · 30 dni",
  "plan.duration.maker": "100 eksportów · 90 dni",
  "plan.duration.commercial": "1 rok · użycie komercyjne",
  "plan.feature.preview": "Podgląd 2D i 3D",
  "plan.feature.svg": "Eksport SVG bez znaku wodnego",
  "plan.feature.stlParts": "STL jako osobne części",
  "plan.feature.exportsFree": "2 eksporty dziennie",
  "plan.feature.3mf": "3MF z kolorem warstw",
  "plan.feature.fonts": "Własne czcionki i wgrywanie grafiki",
  "plan.feature.cloud": "Projekty zapisane w chmurze",
  "plan.feature.perLine": "Czcionka i rozmiar per wiersz",
  "plan.feature.unlimited": "Nielimitowane eksporty",
  "plan.feature.personal": "Użycie osobiste",
  "plan.feature.combinedStl": "Połączony STL",
  "plan.feature.combined3mf": "Połączony 3MF pod AMS / MMU",
  "plan.feature.license": "Licencja komercyjna PDF",
  "plan.feature.sell": "Sprzedaż wydrukowanych topperów",
  "plan.feature.exports20": "20 eksportów plików",
  "plan.feature.exports100": "100 eksportów plików",
  "plan.feature.days30": "Dostęp przez 30 dni",
  "plan.feature.days90": "Dostęp przez 90 dni",
  "plan.feature.yearAccess": "Dostęp przez 1 rok",
  "auth.title": "Twoje konto",
  "auth.login": "Logowanie",
  "auth.register": "Rejestracja",
  "auth.logout": "Wyloguj",
  "auth.email": "E-mail",
  "auth.password": "Hasło",
  "auth.name": "Imię i nazwisko",
  "auth.submitLogin": "Zaloguj się",
  "auth.submitRegister": "Utwórz konto",
  "auth.exists": "Konto z tym e-mailem już istnieje.",
  "auth.invalid": "E-mail albo hasło jest niepoprawne.",
  "auth.needLogin": "Zaloguj się, żeby pobierać albo zapisać.",
  "auth.needPlan": "Do pobierania plików i zapisu potrzebny jest aktywny, opłacony pakiet.",
  "auth.hello": "Cześć, {name}",
  "auth.plan": "Aktualny pakiet",
  "auth.planUntil": "Aktywny do {date}",
  "auth.exportsLeft": "Wykorzystano {used} / {total} pobrań",
  "auth.exportsUnlimited": "Pobieranie bez limitu",
  "auth.planExpired": "Pakiet skończył się {date}",
  "auth.daysLeft": "Zostało {n} dni",
  "auth.admin": "Admin",
  "auth.adminAccess": "Pełny dostęp — pobieranie bez limitu, bez daty wygaśnięcia.",
  "auth.projects": "Zapisane toppery",
  "auth.emptyProjects": "Nie ma jeszcze zapisanych topperów.",
  "auth.openProject": "Otwórz",
  "auth.close": "Zamknij",
  "auth.lead": "Zaloguj się albo załóż konto. Pakiet możesz wybrać później.",
  "print.title": "Informacje o druku",
  "print.lead": "Wyeksportuj topper, a potem otwórz go w slicerze albo programie do wycinania. Pliki są gotowe do druku lub cięcia.",
  "print.stl.title": "STL — kompletne pliki jednokolorowe",
  "print.stl.body": "Pliki STL zawierają całą geometrię jako jedną siatkę. Użyj ich do druku w jednym kolorze: offset, napis i patyczki są już połączone albo wyeksportowane jako kompletne, osobne części.",
  "print.3mf.title": "3MF — pliki w kolorach",
  "print.3mf.body": "3MF trzyma offset i napis jako dwa kolorowe obiekty. Otwórz połączony 3MF w slicerze z AMS lub MMU, żeby każda część trafiła na swój filament.",
  "print.slicer.title": "Otwieranie i druk w slicerze",
  "print.slicer.intro": "Poniżej jest Bambu Studio. Orca Slicer i PrusaSlicer działają tak samo: otwórz plik, przypisz filamenty, zrób slice i wyślij na drukarkę.",
  "print.slicer.s1.title": "1. Otwórz plik",
  "print.slicer.s1.body": "W Bambu Studio wybierz File → Open i wskaż wyeksportowany STL albo 3MF. Możesz też przeciągnąć plik na stół roboczy.",
  "print.slicer.s2.title": "2. Ustaw na stole",
  "print.slicer.s2.body": "Topper powinien leżeć płasko na stole. Jeśli stoi na patyczku, obróć go największą ścianą w dół i użyj auto-arrange.",
  "print.slicer.s3.title": "3. Przypisz kolory",
  "print.slicer.s3.body": "Dla 3MF sprawdź, czy ekstruder 1 to kolor offsetu, a ekstruder 2 to napis. Dla STL wybierz jeden filament i drukuj jako jedną bryłę.",
  "print.slicer.s4.title": "4. Slice i druk",
  "print.slicer.s4.body": "Naciśnij Slice, sprawdź podgląd i drukuj. PLA dobrze nadaje się na toppery; warstwa 0,2 mm i minimum dwie ścianki.",
  "print.svg.title": "SVG — papier, winyl i laser",
  "print.svg.body": "SVG to płaski obrys toppera. Otwórz go w programie do plotera i wytnij z kartonu, winylu albo papieru, albo wyślij na laser, na przykład xTool.",
  "print.cut.title": "Wycinanie toppera z papieru",
  "print.svg.cricut": "W Cricut Design Space wybierz Upload → Upload Image, wskaż SVG i kontynuuj jako obraz do cięcia. Potem wytnij z kartonu.",
  "print.svg.silhouette": "W Silhouette Studio wybierz File → Open, wskaż SVG, ustaw linie cięcia i wyślij na Cameo albo Portrait. Do toppera sprawdzi się karton albo winyl.",
  "print.svg.xtool": "W xTool Creative Space wybierz Import, wskaż SVG i wytnij albo wygraweruj na drewnie, akrylu albo kartonie. Plik to zamknięty obrys gotowy pod laser, na przykład xTool.",
  "order.title": "Zamów druk",
  "order.lead": "Wyślij STL albo 3MF, a odpiszemy z czasem realizacji i wyceną. To formularz zapytania — płatność ustalamy po potwierdzeniu zlecenia.",
  "order.first": "Imię",
  "order.last": "Nazwisko",
  "order.email": "E-mail",
  "order.file": "Wgraj STL / 3MF",
  "order.fileHint": "Wybierz wyeksportowany plik toppera. Dołącz go w wiadomości, która się otworzy.",
  "order.message": "Wiadomość",
  "order.messagePh": "Proszę o czas realizacji i wycenę tego toppera…",
  "order.messageDefault": "Proszę o czas realizacji i wycenę wydruku tego toppera.",
  "order.send": "Wyślij zapytanie",
  "order.sent": "Powinien otworzyć się program pocztowy. Dołącz plik, jeśli nie został dodany, i wyślij.",
  "order.contact": "Uncle Loop Design",
  "order.mailtoNote": "Formularz otwiera program pocztowy. Przed wysłaniem dołącz STL albo 3MF.",
  "order.siteNote": "Generator topperów to jedna część Uncle Loop Design.",
  "order.mail": "E-mail",
  "order.socials": "Social media",
  "order.web": "Strona www",
  "order.preview": "Podgląd pliku",
  "order.previewEmpty": "Tutaj pojawi się wgrany STL albo 3MF.",
  "pricing.title": "Ceny",
  "pricing.lead": "Wszystkie pakiety są w euro i trwają przez ograniczony czas. Po zmianie języka w nawiasie widać aktualny przelicznik dla danego kraju.",
  "pricing.fxNote": "Ceny są w euro. Kwoty w nawiasie to bieżący przelicznik lokalny.",
  "footer.copy": "© Uncle Loop Design — cake toppers 2026",
  "footer.follow": "Obserwuj",
  "social.instagram": "Instagram",
  "social.tiktok": "TikTok",
  "social.facebook": "Facebook",
};

const de: Record<Msg, string> = {
  ...en,
  "lang.label": "Sprache",
  "mode.fonts": "Aus Schriften",
  "mode.file": "Aus Datei",
  "section.lines": "Zeilen",
  "row.label": "Zeile {n}",
  "row.remove": "Entfernen",
  "row.placeholder": "Text eingeben…",
  "row.size": "Zeilengröße",
  "row.add": "+ Zeile hinzufügen",
  "align.left": "Links",
  "align.center": "Mitte",
  "align.right": "Rechts",
  "spacing.letters": "Buchstabenabstand",
  "spacing.lines": "Zeilenabstand",
  "file.title": "SVG-Datei",
  "file.drop": "Datei ablegen oder wählen",
  "file.hint": "Eigene Schrift, Logo oder Grafik als SVG.",
  "section.size": "Größe",
  "size.width": "Breite",
  "size.height": "Höhe",
  "size.locked": "Seitenverhältnis gesperrt",
  "size.unlocked": "Seitenverhältnis frei",
  "size.halo": "Halo-Stärke",
  "section.sticks": "Stiele",
  "sticks.count": "Anzahl",
  "sticks.length": "Länge",
  "sticks.width": "Breite",
  "sticks.spacing": "Stielabstand",
  "section.colors": "Vorschaufarben",
  "color.lettering": "Schrift",
  "color.preset": "Farbset",
  "export.whole": "Ganzer Topper",
  "export.separate": "Getrennte Teile",
  "export.embed": "Die Schrift taucht 0,5 mm in den Offset ein — für den Zweifarbdruck.",
  "export.letteringStl": "Schrift STL",
  "export.lettering3mf": "Schrift 3MF",
  "export.letteringSvg": "Schrift SVG",
  "preview.2d": "2D-Vorschau",
  "preview.3d": "3D-Vorschau",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "3D ansehen",
  "preview.show2d": "2D ansehen",
  "preview.zoomIn": "Vergrößern",
  "preview.zoomOut": "Verkleinern",
  "preview.empty": "Hier erscheint der Topper",
  "preview.busy": "Topper wird gebaut…",
  "fonts.search": "Google Fonts durchsuchen…",
  "fonts.all": "Alle",
  "fonts.handwriting": "Skript",
  "fonts.display": "Display",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} von {total} Google Fonts",
  "fonts.empty": "Keine Treffer",
  "error.needFile": "Lade eine SVG-Datei hoch, um einen Topper aus Grafik zu bauen.",
  "error.needText": "Gib in mindestens einer Zeile Text ein.",
  "error.build": "Der Topper konnte nicht gebaut werden.",
  "error.unknownFont": "Unbekannte Schrift: {name}",
  "error.loadFont": "Schrift {name} konnte nicht geladen werden.",
  "error.shape": "Die Topper-Form konnte nicht gebaut werden.",
};

const it: Record<Msg, string> = {
  ...en,
  "lang.label": "Lingua",
  "mode.fonts": "Da font",
  "mode.file": "Da file",
  "section.lines": "Righe",
  "row.label": "Riga {n}",
  "row.remove": "Rimuovi",
  "row.placeholder": "Scrivi il testo…",
  "row.size": "Dimensione riga",
  "row.add": "+ Aggiungi riga",
  "align.left": "Sinistra",
  "align.center": "Centro",
  "align.right": "Destra",
  "spacing.letters": "Spaziatura lettere",
  "spacing.lines": "Spaziatura righe",
  "file.title": "File SVG",
  "file.drop": "Trascina o scegli un file",
  "file.hint": "Scritta, logo o grafica in SVG.",
  "section.size": "Dimensioni",
  "size.width": "Larghezza",
  "size.height": "Altezza",
  "size.locked": "Proporzioni bloccate",
  "size.unlocked": "Proporzioni sbloccate",
  "size.halo": "Spessore alone",
  "section.sticks": "Stecche",
  "sticks.count": "Quantità",
  "sticks.length": "Lunghezza",
  "sticks.width": "Larghezza",
  "sticks.spacing": "Distanza stecche",
  "section.colors": "Colori anteprima",
  "color.lettering": "Scritta",
  "color.preset": "Set di colori",
  "export.whole": "Topper intero",
  "export.separate": "Parti separate",
  "export.embed": "La scritta entra 0,5 mm nell’offset — per la stampa a due colori.",
  "export.letteringStl": "Scritta STL",
  "export.lettering3mf": "Scritta 3MF",
  "export.letteringSvg": "Scritta SVG",
  "preview.2d": "Anteprima 2D",
  "preview.3d": "Anteprima 3D",
  "preview.halo": "Alone {n} mm",
  "preview.show3d": "Vedi 3D",
  "preview.show2d": "Vedi 2D",
  "preview.zoomIn": "Ingrandisci",
  "preview.zoomOut": "Riduci",
  "preview.empty": "Qui apparirà il topper",
  "preview.busy": "Creazione del topper…",
  "fonts.search": "Cerca in Google Fonts…",
  "fonts.all": "Tutti",
  "fonts.handwriting": "Script",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} di {total} Google Fonts",
  "fonts.empty": "Nessun risultato",
  "error.needFile": "Carica un SVG per creare un topper dalla grafica.",
  "error.needText": "Inserisci il testo in almeno una riga.",
  "error.build": "Impossibile creare il topper.",
  "error.unknownFont": "Font sconosciuto: {name}",
  "error.loadFont": "Impossibile caricare il font {name}.",
  "error.shape": "Impossibile creare la forma del topper.",
};

const tr: Record<Msg, string> = {
  ...en,
  "lang.label": "Dil",
  "mode.fonts": "Yazı tiplerinden",
  "mode.file": "Dosyadan",
  "section.lines": "Satırlar",
  "row.label": "Satır {n}",
  "row.remove": "Sil",
  "row.placeholder": "Metni yazın…",
  "row.size": "Satır boyutu",
  "row.add": "+ Satır ekle",
  "align.left": "Sol",
  "align.center": "Orta",
  "align.right": "Sağ",
  "spacing.letters": "Harf aralığı",
  "spacing.lines": "Satır aralığı",
  "file.title": "SVG dosyası",
  "file.drop": "Dosyayı bırakın veya seçin",
  "file.hint": "Kendi yazınız, logonuz veya görseliniz SVG olarak.",
  "section.size": "Boyut",
  "size.width": "Genişlik",
  "size.height": "Yükseklik",
  "size.locked": "Oran kilitli",
  "size.unlocked": "Oran serbest",
  "size.halo": "Hale kalınlığı",
  "section.sticks": "Çubuklar",
  "sticks.count": "Adet",
  "sticks.length": "Uzunluk",
  "sticks.width": "Genişlik",
  "sticks.spacing": "Çubuk aralığı",
  "section.colors": "Önizleme renkleri",
  "color.lettering": "Yazı",
  "color.preset": "Renk seti",
  "export.whole": "Tüm topper",
  "export.separate": "Ayrı parçalar",
  "export.embed": "Yazı offsetin 0,5 mm içine girer — çift renk baskı için.",
  "export.letteringStl": "Yazı STL",
  "export.lettering3mf": "Yazı 3MF",
  "export.letteringSvg": "Yazı SVG",
  "preview.2d": "2D önizleme",
  "preview.3d": "3D önizleme",
  "preview.halo": "Hale {n} mm",
  "preview.show3d": "3D gör",
  "preview.show2d": "2D gör",
  "preview.zoomIn": "Yakınlaştır",
  "preview.zoomOut": "Uzaklaştır",
  "preview.empty": "Topper burada görünecek",
  "preview.busy": "Topper oluşturuluyor…",
  "fonts.search": "Google Fonts’ta ara…",
  "fonts.all": "Tümü",
  "fonts.handwriting": "El yazısı",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{total} içinden {n} Google Fonts",
  "fonts.empty": "Sonuç yok",
  "error.needFile": "Grafikten topper yapmak için SVG yükleyin.",
  "error.needText": "En az bir satıra metin girin.",
  "error.build": "Topper oluşturulamadı.",
  "error.unknownFont": "Bilinmeyen yazı tipi: {name}",
  "error.loadFont": "{name} yazı tipi yüklenemedi.",
  "error.shape": "Topper şekli oluşturulamadı.",
};

const ru: Record<Msg, string> = {
  ...en,
  "lang.label": "Язык",
  "mode.fonts": "Из шрифтов",
  "mode.file": "Из файла",
  "section.lines": "Строки",
  "row.label": "Строка {n}",
  "row.remove": "Удалить",
  "row.placeholder": "Введите текст…",
  "row.size": "Размер строки",
  "row.add": "+ Добавить строку",
  "align.left": "Слева",
  "align.center": "По центру",
  "align.right": "Справа",
  "spacing.letters": "Межбуквенный интервал",
  "spacing.lines": "Межстрочный интервал",
  "file.title": "Файл SVG",
  "file.drop": "Перетащите или выберите файл",
  "file.hint": "Свой текст, логотип или графика в SVG.",
  "section.size": "Размер",
  "size.width": "Ширина",
  "size.height": "Высота",
  "size.locked": "Пропорции зафиксированы",
  "size.unlocked": "Пропорции свободны",
  "size.halo": "Толщина обводки",
  "section.sticks": "Палочки",
  "sticks.count": "Количество",
  "sticks.length": "Длина",
  "sticks.width": "Ширина",
  "sticks.spacing": "Расстояние между палочками",
  "section.colors": "Цвета предпросмотра",
  "color.lettering": "Надпись",
  "color.preset": "Набор цветов",
  "export.whole": "Весь топпер",
  "export.separate": "Отдельно",
  "export.embed": "Надпись входит на 0,5 мм в подложку — для двухцветной печати.",
  "export.letteringStl": "Надпись STL",
  "export.lettering3mf": "Надпись 3MF",
  "export.letteringSvg": "Надпись SVG",
  "preview.2d": "2D-просмотр",
  "preview.3d": "3D-просмотр",
  "preview.halo": "Обводка {n} мм",
  "preview.show3d": "Смотреть 3D",
  "preview.show2d": "Смотреть 2D",
  "preview.zoomIn": "Приблизить",
  "preview.zoomOut": "Отдалить",
  "preview.empty": "Здесь появится топпер",
  "preview.busy": "Собираем топпер…",
  "fonts.search": "Поиск в Google Fonts…",
  "fonts.all": "Все",
  "fonts.handwriting": "Рукописные",
  "fonts.display": "Декоративные",
  "fonts.count": "{n} шрифтов Google Fonts",
  "fonts.filtered": "{n} из {total} шрифтов Google Fonts",
  "fonts.empty": "Нет результатов",
  "error.needFile": "Загрузите SVG, чтобы собрать топпер из графики.",
  "error.needText": "Введите текст хотя бы в одной строке.",
  "error.build": "Не удалось собрать топпер.",
  "error.unknownFont": "Неизвестный шрифт: {name}",
  "error.loadFont": "Не удалось загрузить шрифт {name}.",
  "error.shape": "Не удалось построить форму топпера.",
};

const uk: Record<Msg, string> = {
  ...en,
  "lang.label": "Мова",
  "mode.fonts": "Зі шрифтів",
  "mode.file": "З файлу",
  "section.lines": "Рядки",
  "row.label": "Рядок {n}",
  "row.remove": "Видалити",
  "row.placeholder": "Введіть текст…",
  "row.size": "Розмір рядка",
  "row.add": "+ Додати рядок",
  "align.left": "Ліворуч",
  "align.center": "По центру",
  "align.right": "Праворуч",
  "spacing.letters": "Інтервал літер",
  "spacing.lines": "Інтервал рядків",
  "file.title": "Файл SVG",
  "file.drop": "Перетягніть або виберіть файл",
  "file.hint": "Власний напис, логотип або графіка у SVG.",
  "section.size": "Розмір",
  "size.width": "Ширина",
  "size.height": "Висота",
  "size.locked": "Пропорції заблоковано",
  "size.unlocked": "Пропорції розблоковано",
  "size.halo": "Товщина обводки",
  "section.sticks": "Палички",
  "sticks.count": "Кількість",
  "sticks.length": "Довжина",
  "sticks.width": "Ширина",
  "sticks.spacing": "Відстань між паличками",
  "section.colors": "Кольори перегляду",
  "color.lettering": "Напис",
  "color.preset": "Набір кольорів",
  "export.whole": "Весь топер",
  "export.separate": "Окремо",
  "export.embed": "Напис входить на 0,5 мм у підкладку — для двоколірного друку.",
  "export.letteringStl": "Напис STL",
  "export.lettering3mf": "Напис 3MF",
  "export.letteringSvg": "Напис SVG",
  "preview.2d": "2D-перегляд",
  "preview.3d": "3D-перегляд",
  "preview.halo": "Обводка {n} мм",
  "preview.show3d": "Дивитись 3D",
  "preview.show2d": "Дивитись 2D",
  "preview.zoomIn": "Наблизити",
  "preview.zoomOut": "Віддалити",
  "preview.empty": "Тут з’явиться топер",
  "preview.busy": "Збираємо топер…",
  "fonts.search": "Пошук у Google Fonts…",
  "fonts.all": "Усі",
  "fonts.handwriting": "Рукописні",
  "fonts.display": "Декоративні",
  "fonts.count": "{n} шрифтів Google Fonts",
  "fonts.filtered": "{n} з {total} шрифтів Google Fonts",
  "fonts.empty": "Немає результатів",
  "error.needFile": "Завантажте SVG, щоб зібрати топер із графіки.",
  "error.needText": "Введіть текст хоча б в одному рядку.",
  "error.build": "Не вдалося зібрати топер.",
  "error.unknownFont": "Невідомий шрифт: {name}",
  "error.loadFont": "Не вдалося завантажити шрифт {name}.",
  "error.shape": "Не вдалося побудувати форму топера.",
};

const fr: Record<Msg, string> = {
  ...en,
  "lang.label": "Langue",
  "mode.fonts": "Depuis les polices",
  "mode.file": "Depuis un fichier",
  "section.lines": "Lignes",
  "row.label": "Ligne {n}",
  "row.remove": "Supprimer",
  "row.placeholder": "Saisissez le texte…",
  "row.size": "Taille de ligne",
  "row.add": "+ Ajouter une ligne",
  "align.left": "Gauche",
  "align.center": "Centre",
  "align.right": "Droite",
  "spacing.letters": "Espacement des lettres",
  "spacing.lines": "Espacement des lignes",
  "file.title": "Fichier SVG",
  "file.drop": "Déposez ou choisissez un fichier",
  "file.hint": "Votre texte, logo ou visuel en SVG.",
  "section.size": "Dimensions",
  "size.width": "Largeur",
  "size.height": "Hauteur",
  "size.locked": "Proportions verrouillées",
  "size.unlocked": "Proportions libres",
  "size.halo": "Épaisseur du halo",
  "section.sticks": "Tiges",
  "sticks.count": "Nombre",
  "sticks.length": "Longueur",
  "sticks.width": "Largeur",
  "sticks.spacing": "Écart des tiges",
  "section.colors": "Couleurs d’aperçu",
  "color.lettering": "Texte",
  "color.preset": "Palette",
  "export.whole": "Topper entier",
  "export.separate": "Pièces séparées",
  "export.embed": "Le texte s’enfonce de 0,5 mm dans l’offset — pour l’impression bicolore.",
  "export.letteringStl": "Texte STL",
  "export.lettering3mf": "Texte 3MF",
  "export.letteringSvg": "Texte SVG",
  "preview.2d": "Aperçu 2D",
  "preview.3d": "Aperçu 3D",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "Voir 3D",
  "preview.show2d": "Voir 2D",
  "preview.zoomIn": "Zoom avant",
  "preview.zoomOut": "Zoom arrière",
  "preview.empty": "Le topper apparaîtra ici",
  "preview.busy": "Création du topper…",
  "fonts.search": "Rechercher dans Google Fonts…",
  "fonts.all": "Toutes",
  "fonts.handwriting": "Script",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} sur {total} Google Fonts",
  "fonts.empty": "Aucun résultat",
  "error.needFile": "Importez un SVG pour créer un topper à partir d’un visuel.",
  "error.needText": "Saisissez du texte sur au moins une ligne.",
  "error.build": "Impossible de créer le topper.",
  "error.unknownFont": "Police inconnue : {name}",
  "error.loadFont": "Impossible de charger la police {name}.",
  "error.shape": "Impossible de construire la forme du topper.",
};

const es: Record<Msg, string> = {
  ...en,
  "lang.label": "Idioma",
  "mode.fonts": "Desde fuentes",
  "mode.file": "Desde archivo",
  "section.lines": "Líneas",
  "row.label": "Línea {n}",
  "row.remove": "Quitar",
  "row.placeholder": "Escribe el texto…",
  "row.size": "Tamaño de línea",
  "row.add": "+ Añadir línea",
  "align.left": "Izquierda",
  "align.center": "Centro",
  "align.right": "Derecha",
  "spacing.letters": "Espaciado de letras",
  "spacing.lines": "Espaciado de líneas",
  "file.title": "Archivo SVG",
  "file.drop": "Suelta o elige un archivo",
  "file.hint": "Tu texto, logo o gráfico en SVG.",
  "section.size": "Tamaño",
  "size.width": "Ancho",
  "size.height": "Alto",
  "size.locked": "Proporción bloqueada",
  "size.unlocked": "Proporción libre",
  "size.halo": "Grosor del halo",
  "section.sticks": "Palitos",
  "sticks.count": "Cantidad",
  "sticks.length": "Largo",
  "sticks.width": "Ancho",
  "sticks.spacing": "Separación de palitos",
  "section.colors": "Colores de vista previa",
  "color.lettering": "Texto",
  "color.preset": "Set de colores",
  "export.whole": "Topper completo",
  "export.separate": "Piezas sueltas",
  "export.embed": "El texto entra 0,5 mm en el offset — para impresión a dos colores.",
  "export.letteringStl": "Texto STL",
  "export.lettering3mf": "Texto 3MF",
  "export.letteringSvg": "Texto SVG",
  "preview.2d": "Vista 2D",
  "preview.3d": "Vista 3D",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "Ver 3D",
  "preview.show2d": "Ver 2D",
  "preview.zoomIn": "Acercar",
  "preview.zoomOut": "Alejar",
  "preview.empty": "Aquí aparecerá el topper",
  "preview.busy": "Creando el topper…",
  "fonts.search": "Buscar en Google Fonts…",
  "fonts.all": "Todas",
  "fonts.handwriting": "Script",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} de {total} Google Fonts",
  "fonts.empty": "Sin resultados",
  "error.needFile": "Sube un SVG para crear un topper desde un gráfico.",
  "error.needText": "Escribe texto en al menos una línea.",
  "error.build": "No se pudo crear el topper.",
  "error.unknownFont": "Fuente desconocida: {name}",
  "error.loadFont": "No se pudo cargar la fuente {name}.",
  "error.shape": "No se pudo construir la forma del topper.",
};

const nl: Record<Msg, string> = {
  ...en,
  "lang.label": "Taal",
  "mode.fonts": "Van lettertypen",
  "mode.file": "Van bestand",
  "section.lines": "Regels",
  "row.label": "Regel {n}",
  "row.remove": "Verwijderen",
  "row.placeholder": "Typ je tekst…",
  "row.size": "Regelformaat",
  "row.add": "+ Regel toevoegen",
  "align.left": "Links",
  "align.center": "Midden",
  "align.right": "Rechts",
  "spacing.letters": "Letterspatiëring",
  "spacing.lines": "Regelafstand",
  "file.title": "SVG-bestand",
  "file.drop": "Sleep of kies een bestand",
  "file.hint": "Eigen tekst, logo of artwork als SVG.",
  "section.size": "Formaat",
  "size.width": "Breedte",
  "size.height": "Hoogte",
  "size.locked": "Verhouding vergrendeld",
  "size.unlocked": "Verhouding vrij",
  "size.halo": "Halo-dikte",
  "section.sticks": "Stokjes",
  "sticks.count": "Aantal",
  "sticks.length": "Lengte",
  "sticks.width": "Breedte",
  "sticks.spacing": "Afstand stokjes",
  "section.colors": "Voorvertoningskleuren",
  "color.lettering": "Tekst",
  "color.preset": "Kleurenset",
  "export.whole": "Hele topper",
  "export.separate": "Losse onderdelen",
  "export.embed": "De tekst zakt 0,5 mm in de offset — voor tweekleurig printen.",
  "export.letteringStl": "Tekst STL",
  "export.lettering3mf": "Tekst 3MF",
  "export.letteringSvg": "Tekst SVG",
  "preview.2d": "2D-voorvertoning",
  "preview.3d": "3D-voorvertoning",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "Bekijk 3D",
  "preview.show2d": "Bekijk 2D",
  "preview.zoomIn": "Inzoomen",
  "preview.zoomOut": "Uitzoomen",
  "preview.empty": "Hier verschijnt de topper",
  "preview.busy": "Topper wordt gebouwd…",
  "fonts.search": "Zoek in Google Fonts…",
  "fonts.all": "Alle",
  "fonts.handwriting": "Script",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} van {total} Google Fonts",
  "fonts.empty": "Geen resultaten",
  "error.needFile": "Upload een SVG om een topper van artwork te maken.",
  "error.needText": "Voer tekst in op minstens één regel.",
  "error.build": "De topper kon niet worden gebouwd.",
  "error.unknownFont": "Onbekend lettertype: {name}",
  "error.loadFont": "Lettertype {name} kon niet worden geladen.",
  "error.shape": "De toppervorm kon niet worden gebouwd.",
};

const cs: Record<Msg, string> = {
  ...en,
  "lang.label": "Jazyk",
  "mode.fonts": "Z písma",
  "mode.file": "Ze souboru",
  "section.lines": "Řádky",
  "row.label": "Řádek {n}",
  "row.remove": "Odebrat",
  "row.placeholder": "Napište text…",
  "row.size": "Velikost řádku",
  "row.add": "+ Přidat řádek",
  "align.left": "Vlevo",
  "align.center": "Na střed",
  "align.right": "Vpravo",
  "spacing.letters": "Mezery písmen",
  "spacing.lines": "Mezery řádků",
  "file.title": "Soubor SVG",
  "file.drop": "Přetáhněte nebo vyberte soubor",
  "file.hint": "Vlastní nápis, logo nebo grafika jako SVG.",
  "section.size": "Rozměry",
  "size.width": "Šířka",
  "size.height": "Výška",
  "size.locked": "Poměr stran uzamčen",
  "size.unlocked": "Poměr stran volný",
  "size.halo": "Tloušťka halo",
  "section.sticks": "Tyčky",
  "sticks.count": "Počet",
  "sticks.length": "Délka",
  "sticks.width": "Šířka",
  "sticks.spacing": "Rozestup tyček",
  "section.colors": "Barvy náhledu",
  "color.lettering": "Nápis",
  "color.preset": "Sada barev",
  "export.whole": "Celý topper",
  "export.separate": "Zvlášť",
  "export.embed": "Nápis zasahuje 0,5 mm do offsetu — pro dvoubarevný tisk.",
  "export.letteringStl": "Nápis STL",
  "export.lettering3mf": "Nápis 3MF",
  "export.letteringSvg": "Nápis SVG",
  "preview.2d": "2D náhled",
  "preview.3d": "3D náhled",
  "preview.halo": "Halo {n} mm",
  "preview.show3d": "Zobrazit 3D",
  "preview.show2d": "Zobrazit 2D",
  "preview.zoomIn": "Přiblížit",
  "preview.zoomOut": "Oddálit",
  "preview.empty": "Tady se objeví topper",
  "preview.busy": "Sestavuji topper…",
  "fonts.search": "Hledat v Google Fonts…",
  "fonts.all": "Vše",
  "fonts.handwriting": "Skript",
  "fonts.count": "{n} Google Fonts",
  "fonts.filtered": "{n} z {total} Google Fonts",
  "fonts.empty": "Žádné výsledky",
  "error.needFile": "Nahrajte SVG, abyste sestavili topper z grafiky.",
  "error.needText": "Zadejte text alespoň na jednom řádku.",
  "error.build": "Topper se nepodařilo sestavit.",
  "error.unknownFont": "Neznámé písmo: {name}",
  "error.loadFont": "Písmo {name} se nepodařilo načíst.",
  "error.shape": "Tvar topperu se nepodařilo sestavit.",
};

export const translations: Record<Locale, Record<Msg, string>> = {
  en,
  pl,
  de: { ...de, ...pageExtras.de },
  it: { ...it, ...pageExtras.it },
  tr: { ...tr, ...pageExtras.tr },
  ru: { ...ru, ...pageExtras.ru },
  uk: { ...uk, ...pageExtras.uk },
  fr: { ...fr, ...pageExtras.fr },
  es: { ...es, ...pageExtras.es },
  nl: { ...nl, ...pageExtras.nl },
  cs: { ...cs, ...pageExtras.cs },
};
