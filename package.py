"""Build a Halo installation ZIP using only runtime files: python3 package.py"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re

ROOT = Path(__file__).resolve().parent
manifest = (ROOT / 'theme.yaml').read_text(encoding='utf-8')
version = re.search(r'^  version: (.+)$', manifest, re.M).group(1).strip()
destination = ROOT / 'dist' / f'cali-lite-{version}.zip'
destination.parent.mkdir(exist_ok=True)
files = [ROOT / name for name in ['theme.yaml', 'settings.yaml', 'README.md', 'LICENSE']]
files += sorted(p for folder in ['templates', 'i18n'] for p in (ROOT / folder).rglob('*') if p.is_file() and not p.name.startswith('.'))
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(ROOT).as_posix())
print(destination)
