import os
import pdfplumber
from pathlib import Path

def pdf_to_text(pdf_path, txt_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Converted: {pdf_path} -> {txt_path}")
    except Exception as e:
        print(f"Error converting {pdf_path}: {e}")

def main():
    folder = Path('.')
    for pdf_file in folder.glob('*.pdf'):
        txt_file = pdf_file.with_suffix('.txt')
        pdf_to_text(pdf_file, txt_file)

if __name__ == "__main__":
    main()
