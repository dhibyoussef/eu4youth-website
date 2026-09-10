"""List every rule in a stylesheet that sets the display face, and what weight it asks for.

The comp names its titles Changa-Regular, but Changa is a variable face and the advance
widths in the PDF match its 700 instance, not its 400. So every rule that reaches for the
display face has to be checked rather than trusted, and there are too many to eyeball.

Usage: python tools/faces.py src/pages/apropos.css
"""

import re
import sys
from pathlib import Path


def main() -> None:
    path = Path(sys.argv[1])
    css = path.read_text(encoding='utf-8')

    missing = 0
    for match in re.finditer(r'([^{}]+)\{([^}]*)\}', css):
        body = match.group(2)
        if 'var(--font-display)' not in body:
            continue
        selector = match.group(1).strip().splitlines()[-1].strip()
        weight = re.search(r'font-weight:\s*(\d+)', body)
        found = weight.group(1) if weight else '-'
        if found != '700':
            missing += 1
        print(f'{selector:44s} {found}')

    print(f'\n{missing} rules not at 700')


if __name__ == '__main__':
    main()
