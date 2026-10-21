"""Build generated source, installation ZIP and clean unpacked source delivery."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(ROOT / 'scripts/build-source.py')], check=True)
manifest = (ROOT / 'theme.yaml').read_text(encoding='utf-8')
version = re.search(r'^  version: (.+)$', manifest, re.M).group(1).strip()
destination = ROOT / 'dist' / f'cali-lite-{version}.zip'
destination.parent.mkdir(exist_ok=True)
files = [ROOT / name for name in ['theme.yaml', 'settings.yaml', 'README.md', 'LICENSE', 'SOURCE-NOTICES.md']]
files += sorted(p for folder in ['templates', 'i18n', 'docs'] for p in (ROOT / folder).rglob('*') if p.is_file() and not p.name.startswith('.'))
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(ROOT).as_posix())
print(destination)
source_dir = ROOT / 'dist' / f'halo-cali-lite-source-{version}'
if source_dir.exists():
    shutil.rmtree(source_dir)
source_dir.mkdir()
source_files = files + [ROOT / name for name in ['AGENTS.md', '.gitignore', 'package.py']]
source_files += sorted(p for folder in ['src', 'scripts'] for p in (ROOT / folder).rglob('*') if p.is_file() and p.suffix not in ['.pyc'] and '__pycache__' not in p.parts)
for path in source_files:
    target = source_dir / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
(source_dir / 'releases').mkdir()
shutil.copy2(destination, source_dir / 'releases' / destination.name)
source_zip = ROOT / 'dist' / f'halo-cali-lite-source-{version}.zip'
with ZipFile(source_zip, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(source_dir.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(source_dir.parent).as_posix())
print(source_dir)
print(source_zip)
