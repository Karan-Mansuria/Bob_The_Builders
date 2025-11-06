# pip install pdfplumber paddleocr pdf2image pandas opencv-python

import pdfplumber
from pdf2image import convert_from_path
from paddleocr import PaddleOCR
import pandas as pd
import cv2
import numpy as np
import os

pdf_file = "Tendernotice_1.pdf"
output_folder = "extracted_pages_new"
os.makedirs(output_folder, exist_ok=True)

ocr = PaddleOCR(use_angle_cls=True, lang='en')

def save_table(df, page_num, table_idx):
    csv_path = os.path.join(output_folder, f"page{page_num}_table{table_idx}.csv")
    df.to_csv(csv_path, index=False, header=False)
    print(f"[+] Table saved: {csv_path}")

def save_text(text, page_num):
    text_path = os.path.join(output_folder, f"page{page_num}_text.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"[+] Text saved: {text_path}")

# --- Process PDF page by page ---
with pdfplumber.open(pdf_file) as pdf:
    for page_num, page in enumerate(pdf.pages, start=1):
        tables = page.extract_tables()
        page_text = page.extract_text() or ""
        
        if tables:
            for idx, table in enumerate(tables):
                df = pd.DataFrame(table[1:], columns=table[0])
                save_table(df, page_num, idx)
        
        if page_text.strip():  # save digital text
            save_text(page_text, page_num)
        
        # --- fallback to OCR if no text or no tables ---
        if not tables and not page_text.strip():
            print(f"[*] Page {page_num} seems scanned. Using OCR...")
            page_image = page.to_image(resolution=300).original
            img = cv2.cvtColor(np.array(page_image), cv2.COLOR_RGB2BGR)
            result = ocr.ocr(img)
            ocr_text = []
            for line in result:
                line_text = " ".join([word_info[1][0] for word_info in line])
                ocr_text.append(line_text)
            save_text("\n".join(ocr_text), page_num)

print("[*] Extraction complete!")
