import unicodedata
from pathlib import Path
import re

def is_hindi(text):
    # Hindi Unicode range: \u0900-\u097F
    return any('\u0900' <= c <= '\u097F' for c in text)

def is_english(text):
    # English letters
    return bool(re.search(r'[A-Za-z]', text))

def is_pronunciation(text):
    # Heuristic: Latin letters with diacritics or IPA symbols
    # IPA: \u0250-\u02AF, Latin diacritics: \u1E00-\u1EFF
    return any((
        ('\u0250' <= c <= '\u02AF') or
        ('\u1E00' <= c <= '\u1EFF')
    ) for c in text)

def bucket_lines(input_file):
    hindi_lines = []
    english_lines = []
    pronunciation_lines = []
    with open(input_file, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if is_hindi(line):
                hindi_lines.append(line)
            elif is_pronunciation(line):
                pronunciation_lines.append(line)
            elif is_english(line):
                english_lines.append(line)
    Path('hindi.txt').write_text('\n'.join(hindi_lines), encoding='utf-8')
    Path('pronounciation.txt').write_text('\n'.join(pronunciation_lines), encoding='utf-8')
    Path('english.txt').write_text('\n'.join(english_lines), encoding='utf-8')
    print('Bucketing complete.')

if __name__ == "__main__":
    bucket_lines('1.txt')
