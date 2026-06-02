from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


DEFAULT_SOURCE_ROOT = Path(r"C:\github\suryaraor\home\research\latex")
DEFAULT_OUTPUT_ROOT = Path(r"C:\github\suryaraor\home\research\pdf")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert every LaTeX source under a folder into PDFs."
    )
    parser.add_argument(
        "--source-root",
        type=Path,
        default=DEFAULT_SOURCE_ROOT,
        help="Folder that contains the .tex files.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT,
        help="Folder where PDFs will be written.",
    )
    return parser.parse_args()


def find_tectonic() -> str:
    executable = shutil.which("tectonic")
    if executable:
        return executable
    raise SystemExit(
        "tectonic was not found on PATH. Install it first, then rerun this script."
    )


def bibliography_targets(source_text: str) -> list[str]:
    targets: list[str] = []
    for match in re.finditer(r"\\bibliography\{([^}]*)\}", source_text):
        for entry in match.group(1).split(","):
            entry = entry.strip()
            if entry:
                targets.append(entry)
    return targets


def needs_bibliography_patch(source_path: Path, source_text: str) -> bool:
    if "\\begin{thebibliography}" not in source_text:
        return False

    for target in bibliography_targets(source_text):
        if (source_path.parent / f"{target}.bib").exists():
            return False

    return "\\bibliography{" in source_text


def prepare_source_for_build(source_path: Path) -> tuple[Path, tempfile.TemporaryDirectory[str] | None]:
    source_text = source_path.read_text(encoding="utf-8")
    if not needs_bibliography_patch(source_path, source_text):
        return source_path, None

    temp_dir = tempfile.TemporaryDirectory(prefix=f"latex_build_{source_path.stem}_")
    temp_source = Path(temp_dir.name) / source_path.name
    patched_text = re.sub(
        r"(?m)^\s*\\bibliography\{[^}]*\}\s*$",
        "% temporarily disabled because the .bib file is missing and the paper already has a manual bibliography\n",
        source_text,
    )
    if "\\citeauthor{" in patched_text:
        citeauthor_block = (
            "\\makeatletter\n"
            "\\providecommand{\\citeauthor}[1]{%\n"
            "  \\@ifundefined{citeauthor@#1}{\\texttt{#1}}{\\csname citeauthor@#1\\endcsname}%\n"
            "}\n"
            "\\expandafter\\def\\csname citeauthor@ward1963hierarchical\\endcsname{J.~H. Ward}\n"
            "\\expandafter\\def\\csname citeauthor@macqueen1967methods\\endcsname{J.~MacQueen}\n"
            "\\expandafter\\def\\csname citeauthor@mclachlan2000finite\\endcsname{G.~McLachlan and D.~Peel}\n"
            "\\makeatother\n"
        )
        patched_text = patched_text.replace(
            "\\begin{document}", f"{citeauthor_block}\\begin{{document}}", 1
        )
    temp_source.write_text(patched_text, encoding="utf-8")
    return temp_source, temp_dir


def build_pdf(tectonic: str, source_path: Path, output_root: Path) -> tuple[bool, str]:
    output_root.mkdir(parents=True, exist_ok=True)
    build_source, temp_dir = prepare_source_for_build(source_path)
    try:
        command = [
            tectonic,
            str(build_source),
            "--outdir",
            str(output_root),
            "--keep-logs",
        ]
        result = subprocess.run(
            command,
            cwd=str(build_source.parent),
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return True, result.stdout + result.stderr
        return False, result.stdout + result.stderr
    finally:
        if temp_dir is not None:
            temp_dir.cleanup()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    tectonic = find_tectonic()

    tex_files = sorted(
        path for path in source_root.rglob("*.tex") if path.is_file()
    )
    if not tex_files:
        print(f"No .tex files found under {source_root}")
        return 1

    print(f"Found {len(tex_files)} LaTeX files under {source_root}")
    failures: list[tuple[Path, str]] = []

    for tex_file in tex_files:
        print(f"Building {tex_file.name} ...", flush=True)
        ok, logs = build_pdf(tectonic, tex_file, output_root)
        if ok:
            print(f"  wrote {output_root / (tex_file.stem + '.pdf')}")
        else:
            failures.append((tex_file, logs))
            print(f"  failed: {tex_file.name}")

    if failures:
        print("\nFailed builds:")
        for tex_file, logs in failures:
            print(f"- {tex_file.name}")
            tail = "\n".join(logs.strip().splitlines()[-20:])
            if tail:
                print(tail)
        return 2

    print(f"\nCompleted successfully. PDFs are in {output_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())