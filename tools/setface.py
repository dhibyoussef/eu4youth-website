"""Pin every display-face rule in a stylesheet to one weight.

The comp's PDF names its titles Changa-Regular, so they were built at 400. Changa is a
variable face, and the advance widths the comp sets — 1141.4 for UNE VISION COMMUNE at
115, 1122.6 for L'IMPACT DU PROGRAMME at 98, 896.8 for LES PARTENAIRES at 115 — match its
700 instance to a hundredth of a pixel at every size checked. The name was wrong and the
whole page was set too light because of it.

Twenty-two rules is too many to retype without slipping, so the edit is mechanical:
inside a rule that reaches for the display face, an explicit weight is rewritten and a
missing one is added right after the family.

Usage: python tools/setface.py src/pages/apropos.css 700
"""

import re
import sys
from pathlib import Path

FAMILY = 'font-family: var(--font-display);'


def main() -> None:
    path = Path(sys.argv[1])
    weight = sys.argv[2] if len(sys.argv) > 2 else '700'
    css = path.read_text(encoding='utf-8')

    changed = 0

    def fix(match: re.Match) -> str:
        nonlocal changed
        head, body = match.group(1), match.group(2)
        if 'var(--font-display)' not in body:
            return match.group(0)

        if re.search(r'font-weight:\s*\d+', body):
            new = re.sub(r'font-weight:\s*\d+', f'font-weight: {weight}', body)
        else:
            # Indent the addition the way its neighbours are, so the file stays readable.
            indent = re.search(r'\n(\s*)font-family:', body)
            pad = indent.group(1) if indent else '  '
            new = body.replace(FAMILY, f'{FAMILY}\n{pad}font-weight: {weight};')

        if new != body:
            changed += 1
        return f'{head}{{{new}}}'

    css = re.sub(r'([^{}]+)\{([^{}]*)\}', fix, css)
    path.write_text(css, encoding='utf-8')
    print(f'{changed} rules pinned to {weight} in {path}')


if __name__ == '__main__':
    main()
