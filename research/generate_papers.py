#!/usr/bin/env python3
"""
Generate LaTeX research papers from plan.txt topics using an AI API,
then compile them to PDF using tectonic.

Usage:
    python generate_papers.py                          # generate all pending topics + compile
    python generate_papers.py "New Topic Name"         # add topic, generate it, compile
    python generate_papers.py --compile-only           # skip generation, just compile
    python generate_papers.py --list                   # show status of all topics
    python generate_papers.py --provider gemini        # force a specific provider

Supported providers (auto-detected from available env keys):
    anthropic   ANTHROPIC_API_KEY   claude-opus-4-8              (paid)
    gemini      GEMINI_API_KEY      gemini-2.0-flash             (free tier)
    groq        GROQ_API_KEY        llama-3.3-70b-versatile      (free tier)
    together    TOGETHER_API_KEY    Llama-3.3-70B-Instruct-Turbo (free $1 credit)

Setup:
    Copy .env.example to .env, fill in at least one API key.
    pip install anthropic google-genai groq together python-dotenv
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

RESEARCH_ROOT = Path(__file__).parent
DOCS_DIR = RESEARCH_ROOT / "docs"
LATEX_DIR = RESEARCH_ROOT / "latex"
CONVERT_SCRIPT = LATEX_DIR / "convert_all_tex_to_pdf.py"
PLAN_FILE = DOCS_DIR / "plan.txt"
STRUCTURE_FILE = DOCS_DIR / "strcuture.txt"
MANIFEST_FILE = DOCS_DIR / "papers.json"

MAX_TOKENS = 8000

PROVIDER_DEFAULTS = {
    "anthropic": "claude-opus-4-8",
    "gemini":    "gemini-2.0-flash",
    "groq":      "llama-3.3-70b-versatile",
    "together":  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
}

PROVIDER_ENV = {
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini":    "GEMINI_API_KEY",
    "groq":      "GROQ_API_KEY",
    "together":  "TOGETHER_API_KEY",
}


def load_dotenv() -> None:
    env_file = RESEARCH_ROOT / ".env"
    if not env_file.exists():
        return
    try:
        from dotenv import load_dotenv as _load
        _load(env_file)
        return
    except ImportError:
        pass
    # Minimal fallback parser if python-dotenv is not installed
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and val and key not in os.environ:
            os.environ[key] = val


def detect_provider() -> str | None:
    for provider, env_var in PROVIDER_ENV.items():
        if os.environ.get(env_var):
            return provider
    return None


def make_client(provider: str):
    env_var = PROVIDER_ENV[provider]
    api_key = os.environ.get(env_var, "")

    if provider == "anthropic":
        try:
            import anthropic
        except ImportError:
            raise SystemExit("pip install anthropic")
        return anthropic.Anthropic(api_key=api_key or None)

    if provider == "gemini":
        try:
            from google import genai
        except ImportError:
            raise SystemExit("pip install google-genai")
        return genai.Client(api_key=api_key)

    if provider == "groq":
        try:
            from groq import Groq
        except ImportError:
            raise SystemExit("pip install groq")
        return Groq(api_key=api_key)

    if provider == "together":
        try:
            from together import Together
        except ImportError:
            raise SystemExit("pip install together")
        return Together(api_key=api_key)

    raise ValueError(f"Unknown provider: {provider}")


def call_api(client, provider: str, model: str, prompt: str) -> str:
    if provider == "anthropic":
        response = client.messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    if provider == "gemini":
        response = client.models.generate_content(model=model, contents=prompt)
        return response.text

    if provider in ("groq", "together"):
        response = client.chat.completions.create(
            model=model,
            max_tokens=MAX_TOKENS,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    raise ValueError(f"Unknown provider: {provider}")


# ── Manifest / topic helpers ──────────────────────────────────────────────────

def load_manifest() -> dict[str, str]:
    if MANIFEST_FILE.exists():
        return json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    return {}


def save_manifest(manifest: dict[str, str]) -> None:
    MANIFEST_FILE.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def load_topics() -> list[str]:
    return [
        line.strip()
        for line in PLAN_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def add_topic(topic: str) -> bool:
    topics = load_topics()
    if topic in topics:
        return False
    with open(PLAN_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n{topic}")
    return True


def topic_to_stem(topic: str) -> str:
    stem = re.sub(r"[^a-z0-9]+", "_", topic.lower())
    return stem.strip("_")


def already_done(topic: str, manifest: dict[str, str]) -> bool:
    stem = manifest.get(topic)
    return bool(stem and (LATEX_DIR / f"{stem}.tex").exists())


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_list(topics: list[str], manifest: dict[str, str]) -> None:
    print(f"\n{'#':<4} {'Topic':<52} Status")
    print("-" * 80)
    for i, topic in enumerate(topics, 1):
        stem = manifest.get(topic)
        if stem and (LATEX_DIR / f"{stem}.tex").exists():
            status = f"done  -> {stem}.tex"
        elif stem:
            status = f"in manifest but .tex missing ({stem}.tex)"
        else:
            status = "pending"
        print(f"{i:<4} {topic:<52} {status}")
    print()


def cmd_generate(
    pending: list[str],
    manifest: dict[str, str],
    structure_prompt: str,
    provider: str,
    model: str,
) -> list[str]:
    client = make_client(provider)
    written: list[str] = []

    for topic in pending:
        stem = topic_to_stem(topic)
        out_path = LATEX_DIR / f"{stem}.tex"
        print(f"\nGenerating : {topic}")
        print(f"  provider : {provider}  |  model: {model}")
        print(f"  output   -> {out_path.name}")
        try:
            raw = call_api(client, provider, model, f"{structure_prompt}\n\nPaper Topic: {topic}")
            # Strip markdown fences if the model wrapped the output
            raw = re.sub(r"^```(?:latex|tex)?\s*\n", "", raw, flags=re.IGNORECASE)
            raw = re.sub(r"\n```\s*$", "", raw.strip()).strip()
            out_path.write_text(raw, encoding="utf-8")
            manifest[topic] = stem
            save_manifest(manifest)
            print(f"  saved    : {len(raw):,} chars")
            written.append(stem)
        except Exception as exc:
            print(f"  ERROR    : {exc}")

    return written


def cmd_compile() -> int:
    print("\nCompiling all .tex files to PDF ...")
    result = subprocess.run([sys.executable, str(CONVERT_SCRIPT)], cwd=str(LATEX_DIR))
    return result.returncode


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Generate LaTeX papers and compile to PDF.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("topic", nargs="?", help="Topic to add and generate")
    p.add_argument("--compile-only", action="store_true", help="Skip generation, compile only")
    p.add_argument("--list", action="store_true", help="Show status of all topics")
    p.add_argument(
        "--provider",
        choices=list(PROVIDER_DEFAULTS),
        help="AI provider (default: auto-detect from env keys)",
    )
    p.add_argument("--model", help="Override the default model for the chosen provider")
    return p.parse_args()


def main() -> int:
    load_dotenv()

    args = parse_args()
    manifest = load_manifest()
    topics = load_topics()

    if args.list:
        cmd_list(topics, manifest)
        return 0

    if args.compile_only:
        return cmd_compile()

    # Resolve provider
    provider = args.provider or detect_provider()
    if provider is None:
        print(
            "No API key found. Set at least one of:\n"
            + "\n".join(f"  {v}  ({k})" for k, v in PROVIDER_ENV.items())
            + "\n\nSee .env.example for details and free-tier sign-up links."
        )
        return 1

    model = args.model or PROVIDER_DEFAULTS[provider]

    # Add new topic if given
    if args.topic:
        added = add_topic(args.topic)
        print(f"{'Added to plan.txt' if added else 'Already in plan.txt'}: {args.topic}")
        topics = load_topics()

    # Determine what needs generating
    if args.topic:
        pending = [] if already_done(args.topic, manifest) else [args.topic]
        if not pending:
            print(f"Already generated: {args.topic}")
    else:
        pending = [t for t in topics if not already_done(t, manifest)]

    structure_prompt = STRUCTURE_FILE.read_text(encoding="utf-8").strip()

    if pending:
        print(f"\n{len(pending)} paper(s) to generate  [provider: {provider}  model: {model}]:")
        for t in pending:
            print(f"  - {t}")
        cmd_generate(pending, manifest, structure_prompt, provider, model)
    else:
        print("All topics already generated.")

    return cmd_compile()


if __name__ == "__main__":
    raise SystemExit(main())
