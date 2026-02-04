import sys
import glob
import re
import os

def extract_strings(filename):
    try:
        with open(filename, "rb") as f:
            data = f.read()
            # Find printable strings of length >= 4
            # PDF text is often in parentheses like (Hello World) or just plain text streams
            # We look for sequences of printable chars
            strings = re.findall(b"[\x20-\x7E]{4,}", data)
            for s in strings:
                try:
                    decoded = s.decode("utf-8")
                    print(decoded)
                except:
                    pass
    except Exception as e:
        print(f"Erro ao ler arquivo: {e}")

def main():
    # Encontrar o pdf
    pdfs = glob.glob("*.pdf")
    if not pdfs:
        print("Nenhum PDF encontrado.")
        return

    pdf_path = pdfs[0]
    print(f"Lendo arquivo: {pdf_path}")
    
    # Tentar extrair strings (fallback method)
    print("--- Extraindo Strings ---")
    extract_strings(pdf_path)

if __name__ == "__main__":
    main()