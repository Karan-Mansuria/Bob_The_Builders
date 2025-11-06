"""
Extraction module integrating logic from Extraction/extractor.py and Extraction/multiple3.py
"""
import re
import tempfile
from pathlib import Path
from typing import Dict, Optional, Tuple, List
import pandas as pd

# Try to import optional dependencies
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    from pdf2image import convert_from_path
    from paddleocr import PaddleOCR
    import cv2
    import numpy as np
    HAS_OCR = True
except ImportError:
    HAS_OCR = False


# --- 1. Normalization Functions (from multiple3.py) ---

def normalize_money(money_str: Optional[str]) -> Optional[str]:
    """Strips all non-digit/non-decimal characters to get a clean number."""
    if not money_str:
        return None
    # First, remove all junk characters
    cleaned = re.sub(r"[^\d\.]", "", money_str)
    # THEN, strip any leading/trailing dots left over
    return cleaned.strip(" .")


def normalize_id(id_str: Optional[str]) -> Optional[str]:
    """Fixes spacing errors and strips whitespace."""
    if not id_str:
        return None
    # First, normalize internal hyphens
    cleaned = re.sub(r"\s*-\s*", "-", id_str)
    # THEN, strip any leading/trailing junk characters
    return cleaned.strip(" .-")


def normalize_date(date_str: Optional[str]) -> Optional[str]:
    """Strips junk and standardizes separators to '-'."""
    if not date_str:
        return None
    # This correctly handles '.', '/', and '-'
    return re.sub(r"[./-]", "-", date_str.strip(" .,"))


def normalize_time(time_str: Optional[str]) -> Optional[str]:
    """Cleans up time formats."""
    if not time_str:
        return None
    cleaned = time_str.replace(" ", "").replace(".", ":")
    if ":" not in cleaned and len(cleaned) > 5:  # e.g., 1500hrs
        cleaned = cleaned.replace("hrs", "").replace("hours", "")
        if len(cleaned) == 4:
            return f"{cleaned[:2]}:{cleaned[2:]}"
    return cleaned


def normalize_text(text_str: Optional[str]) -> Optional[str]:
    """Cleans up text, removing newlines and extra spaces."""
    if not text_str:
        return None
    return " ".join(text_str.split()).strip(" :,")


# --- 2. REGEX AUTO-GENERATION ENGINE (from multiple3.py) ---

def build_key_pattern(keys_list: List[str]) -> str:
    """Takes a list of strings and builds a flexible, escaped regex OR-group."""
    escaped_keys = []
    for key in keys_list:
        escaped = re.escape(key).replace(r'\ ', r'\s*')
        escaped_keys.append(escaped)
    return r"(?:" + r"|".join(escaped_keys) + r")"


def build_extraction_rules(simple_definitions: Dict) -> Dict:
    """
    Auto-generates the final extraction_rules dictionary.
    """
    
    value_patterns = {
        "money": (r"((?:Rs\.?\s*|₹\s*)?[\d,\s\.]+\/?-?)", normalize_money),
        "id":    (r"([\w\/.-]+)", normalize_id),
        "date":  (r"(\d{2}[./-]\d{2}[./-]\d{4})", normalize_date),
        "time":  (r"(\d{2,4}\s*(?:[.:]\d{2})?\s*(?:hours|hrs))", normalize_time),
        "quantity": (r"([\d\.]+\s*(?:Days|Months|Weeks|Year|Years))", normalize_text),
        "text_line": (r"([^\n]*)", normalize_text),
        
        # text_multiline pattern
        "text_multiline": (
            r"([\s\S]*?)(?=\n\s*(\d+\.|\w+[^:]+:)|End of Document)", 
            normalize_text
        )
    }

    extraction_rules = {}
    for key_name, rule in simple_definitions.items():
        key_pattern_str = build_key_pattern(rule["keys"])
        rule_type = rule["type"]
        
        val_patt, normalizer = value_patterns.get(rule_type, (None, None))
        if not val_patt:
            continue

        pattern_colon = None
        pattern_proximity = None
        colon_required = rule.get("colon_required", False)

        pattern_colon_str = fr"(?i)({key_pattern_str}).*?:\s*{val_patt}"
        pattern_colon = re.compile(pattern_colon_str, re.DOTALL)

        if not colon_required:
            pattern_proximity_str = fr"(?i)({key_pattern_str}).*?{val_patt}"
            pattern_proximity = re.compile(pattern_proximity_str, re.DOTALL)

        extraction_rules[key_name] = {
            "pattern_colon": pattern_colon,
            "pattern_proximity": pattern_proximity,
            "normalizer": normalizer
        }
            
    return extraction_rules


# --- 3. CONFIGURATION (from multiple3.py) ---
SIMPLE_RULES = {
    "Tender No": {
        "keys": ["Tender No.", "Tender Number", "Tender ID", "NIT No."],
        "type": "id"
    },
    "Estimated Cost": {
        "keys": [
            "Estimated Cost", 
            "Est. Cost", 
            "Estimated"
        ],
        "type": "money",
    },
    "EMD": {
        "keys": [
            "EMD", 
            "Earnest Money Deposit", 
            "Earnest Money"
        ],
        "type": "money",
    },
    "Date of Opening": {
        "keys": ["Date of Opening", "Bid Opening Date", "Opening of technical bids"],
        "type": "date"
    },
    "Completion Time": {
        "keys": ["Completion Time", "Contract Period", "Period of Work", "Completion Period", "Time of completion"],
        "type": "quantity"
    }
}


# --- 4. PDF Extraction (from extractor.py) ---

def extract_text_from_pdf(pdf_path: Path, use_ocr: bool = False) -> Tuple[str, List[str]]:
    """
    Extract text and tables from PDF using pdfplumber, with optional OCR fallback.
    Returns (combined_text, table_texts)
    """
    if not HAS_PDFPLUMBER:
        raise RuntimeError("pdfplumber is required for PDF extraction. Install with: pip install pdfplumber")
    
    combined_text = ""
    table_texts = []
    
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            # Extract tables
            tables = page.extract_tables()
            if tables:
                for idx, table in enumerate(tables):
                    try:
                        df = pd.DataFrame(table[1:], columns=table[0] if table else [])
                        # Convert table to text format (similar to extractor.py)
                        table_text = df.to_string(index=False, header=False)
                        # Normalize separators like in extract_tender_params.py
                        normalized = re.sub(r",\s*", " | ", table_text)
                        table_texts.append(normalized)
                        combined_text += normalized + "\n"
                    except Exception:
                        pass
            
            # Extract text
            page_text = page.extract_text() or ""
            if page_text.strip():
                combined_text += page_text + "\n"
            
            # Fallback to OCR if no text or no tables and OCR is enabled
            if use_ocr and HAS_OCR and not tables and not page_text.strip():
                try:
                    page_image = page.to_image(resolution=300).original
                    img = cv2.cvtColor(np.array(page_image), cv2.COLOR_RGB2BGR)
                    ocr = PaddleOCR(use_angle_cls=True, lang='en')
                    result = ocr.ocr(img)
                    ocr_text = []
                    for line in result:
                        if line:
                            line_text = " ".join([word_info[1][0] for word_info in line])
                            ocr_text.append(line_text)
                    combined_text += "\n".join(ocr_text) + "\n"
                except Exception:
                    pass
    
    return combined_text, table_texts


# --- 5. Main Extraction Function ---

def extract_fields_from_pdf(pdf_path: Path, use_ocr: bool = False) -> Dict[str, Optional[str]]:
    """
    Extract tender fields from PDF using the extraction rules from multiple3.py.
    
    Args:
        pdf_path: Path to PDF file
        use_ocr: Whether to use OCR for scanned PDFs (requires paddleocr)
    
    Returns:
        Dictionary with extracted fields (Tender No, Estimated Cost, EMD, Date of Opening, Completion Time)
    """
    # Extract text from PDF
    text, _ = extract_text_from_pdf(pdf_path, use_ocr=use_ocr)
    
    # Add stop word for multiline regex (from multiple3.py)
    text += "\nEnd of Document"
    
    # Build extraction rules
    extraction_rules = build_extraction_rules(SIMPLE_RULES)
    
    # Initialize result dictionary
    final_extracted_data: Dict[str, Optional[str]] = {key: None for key in SIMPLE_RULES.keys()}
    
    # Extract using the "sealed" logic from multiple3.py
    for key_name, rule in extraction_rules.items():
        if final_extracted_data[key_name] is None:
            match = None
            normalizer = rule["normalizer"]
            
            # Try colon pattern first
            if rule["pattern_colon"]:
                match = rule["pattern_colon"].search(text)
            
            # Try proximity pattern if colon pattern didn't match
            if not match and rule["pattern_proximity"]:
                match = rule["pattern_proximity"].search(text)
            
            # If we found a match, normalize and seal it
            if match:
                try:
                    raw_value = match.groups()[-1]
                    normalized_value = normalizer(raw_value)
                    if normalized_value:
                        final_extracted_data[key_name] = normalized_value
                except Exception:
                    pass
    
    # Replace None with "NAN" (as in multiple3.py)
    for key, value in final_extracted_data.items():
        if value is None:
            final_extracted_data[key] = "NAN"
    
    return final_extracted_data

