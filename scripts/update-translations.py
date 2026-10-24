"""Sync static language pages from en/index.html and json/*.json (no build dependencies)."""
import argparse
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
LABELS = {
    "en": ("Main navigation", "Menu", "Choose language", "us", "10"),
    "hu": ("Fő navigáció", "Menü", "Nyelv kiválasztása", "hu", "10"),
    "de": ("Hauptnavigation", "Menü", "Sprache wählen", "de", "12"),
}
PDFS = {"en": "Resume.pdf", "hu": "Resume_HU.pdf", "de": "Resume_EN.pdf"}
TRANSLATED = re.compile(
    r'<(?P<tag>[a-z][a-z0-9]*)(?P<attrs>\s[^>]*\bdata-translate="(?P<key>[^"]+)"[^>]*)>.*?</(?P=tag)>',
    re.DOTALL,
)


def render(template, lang):
    translations = json.loads((ROOT / "json" / f"{lang}.json").read_text(encoding="utf-8"))
    def translate(match):
        # Translation values use the existing HTML entities, e.g. &rarr; and &copy;.
        return f'<{match["tag"]}{match["attrs"]}>{translations[match["key"]]}</{match["tag"]}>'
    page = TRANSLATED.sub(translate, template)
    page = re.sub(r'<html lang="[^"]+">', f'<html lang="{lang}">', page)
    page = re.sub(r'<title>.*?</title>', f'<title>{html.escape(translations["title"])}</title>', page)
    page = re.sub(r'<meta name="description" content="[^"]*">',
                  f'<meta name="description" content="{html.escape(translations["hero_description"], quote=True)}">', page)
    page = re.sub(r'<link rel="canonical" href="[^"]+">',
                  f'<link rel="canonical" href="https://ledobra.com/{lang}/">', page)
    navigation, menu, language, flag, flag_height = LABELS[lang]
    page = page.replace('aria-label="Main navigation"', f'aria-label="{navigation}"')
    page = page.replace('aria-label="Menu"', f'aria-label="{menu}"')
    page = page.replace('aria-label="Choose language"', f'aria-label="{language}"')
    page = re.sub(r'(id="current-lang-flag" src="../images/flags/)[^"]+(" width="20" height=")[^"]+',
                  rf'\g<1>{flag}.png\g<2>{flag_height}', page)
    page = re.sub(r'(<span id="current-lang-text">)[^<]+', rf'\g<1>{lang.upper()}', page)
    page = re.sub(r'(data-lang="[a-z]+") aria-current="page"', r'\1', page)
    page = page.replace(f'data-lang="{lang}"', f'data-lang="{lang}" aria-current="page"')
    page = re.sub(r'Laszlo_Edgar_Dobra_Resume(?:_HU|_EN)?\.pdf', f'Laszlo_Edgar_Dobra_{PDFS[lang]}', page)
    return page


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if a generated page needs an update")
    args = parser.parse_args()
    template = (ROOT / "en" / "index.html").read_text(encoding="utf-8")
    stale = []
    for lang in LABELS:
        path = ROOT / lang / "index.html"
        expected = render(template, lang)
        if args.check:
            if path.read_text(encoding="utf-8") != expected:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.write_text(expected, encoding="utf-8")
    if stale:
        parser.error("Run python scripts/update-translations.py to update: " + ", ".join(stale))
    print("All three language pages are up to date.")


if __name__ == "__main__":
    main()
