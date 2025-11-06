import re
import json
import os  # <-- We need this to read folders

# --- 1. Normalization Functions ---
# (The fixes for leading dots/hyphens are here)

def normalize_money(money_str):
    """Strips all non-digit/non-decimal characters to get a clean number."""
    if not money_str:
        return None
    # First, remove all junk characters
    cleaned = re.sub(r"[^\d\.]", "", money_str)
    # THEN, strip any leading/trailing dots left over
    return cleaned.strip(" .")

def normalize_id(id_str):
    """Fixes spacing errors and strips whitespace."""
    if not id_str:
        return None
    # First, normalize internal hyphens
    cleaned = re.sub(r"\s*-\s*", "-", id_str)
    # THEN, strip any leading/trailing junk characters
    return cleaned.strip(" .-")

def normalize_date(date_str):
    """Strips junk and standardizes separators to '-'."""
    if not date_str:
        return None
    # This correctly handles '.', '/', and '-'
    return re.sub(r"[./-]", "-", date_str.strip(" .,"))

def normalize_time(time_str):
    """Cleans up time formats."""
    if not time_str:
        return None
    cleaned = time_str.replace(" ", "").replace(".", ":")
    if ":" not in cleaned and len(cleaned) > 5: # e.g., 1500hrs
        cleaned = cleaned.replace("hrs", "").replace("hours", "")
        if len(cleaned) == 4:
            return f"{cleaned[:2]}:{cleaned[2:]}"
    return cleaned

def normalize_text(text_str):
    """Cleans up text, removing newlines and extra spaces."""
    if not text_str:
        return None
    return " ".join(text_str.split()).strip(" :,")

# --- 2. REGEX AUTO-GENERATION ENGINE ---
# (The fix for the 'Tender Name' bug is here)

def build_key_pattern(keys_list):
    """Takes a list of strings and builds a flexible, escaped regex OR-group."""
    escaped_keys = []
    for key in keys_list:
        escaped = re.escape(key).replace(r'\ ', r'\s*')
        escaped_keys.append(escaped)
    return r"(?:" + r"|".join(escaped_keys) + r")"

def build_extraction_rules(simple_definitions):
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
        
        # --- THIS IS THE FIX for text_multiline ---
        # It now captures everything (including newlines) until it "looks ahead" (?=)
        # and sees a newline, optional spaces, and then EITHER
        # 1) A digit and a dot (like "2.")
        # 2) A word with a colon (like "Estimated Cost:")
        # 3) The "End of Document" stop-word
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
            print(f"Warning: Unknown rule type '{rule_type}' for key '{key_name}'")
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

# --- 3. CONFIGURATION SECTION ---
# (This is your code, unchanged)
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
        # "colon_required": True
    },
    "EMD": {
        "keys": [
            "EMD", 
            "Earnest Money Deposit", 
            "Earnest Money"
        ],
        "type": "money",
        # "colon_required": True 
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

# --- 4. NEW Multi-File Extraction Loop ---

# !!! IMPORTANT: SET THIS TO YOUR FOLDER'S PATH !!!
FOLDER_PATH = "param1" # e.g., "C:/Users/Vedansh/Tenders"

# Build the rules once
extraction_rules = build_extraction_rules(SIMPLE_RULES)

# 1. Initialize the master dictionary with all keys as None
final_extracted_data = {key: None for key in SIMPLE_RULES.keys()}


try:
    # Get a list of all .txt files, sorted alphabetically
    all_files = sorted([f for f in os.listdir(FOLDER_PATH) if f.endswith('.txt')])
    
    if not all_files:
        print(f"Error: No .txt files found in folder: {FOLDER_PATH}")
    
    # 2. Loop through every file in the folder
    for filename in all_files:
        
        # Optimization: If all values are found, stop searching.
        if all(value is not None for value in final_extracted_data.values()):
            print("\n--- All variables found. Stopping search. ---")
            break
            
        file_path = os.path.join(FOLDER_PATH, filename)
        print(f"\n--- Processing file: {filename} ---")
        
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read()
                # Add the "End of Document" stop-word for the multiline regex
                text += "\nEnd of Document" 

            # 3. Iterate through our rules for *this* file
            for key_name, rule in extraction_rules.items():
                
                # 4. >>> THE "SEALED" LOGIC <<<
                if final_extracted_data[key_name] is None:
                    
                    match = None
                    normalizer = rule["normalizer"]
                    
                    # Try colon pattern
                    if rule["pattern_colon"]:
                        match = rule["pattern_colon"].search(text)
                    
                    # Try proximity pattern
                    if not match and rule["pattern_proximity"]:
                        match = rule["pattern_proximity"].search(text)
                    
                    # 5. If we found a match *and* it's valid, SEAL IT.
                    if match:
                        try:
                            raw_value = match.groups()[-1] 
                            normalized_value = normalizer(raw_value)
                            if normalized_value: 
                                print(f"  [FOUND & SEALED] {key_name} = {normalized_value}")
                                final_extracted_data[key_name] = normalized_value
                        except Exception as e:
                            print(f"  [Error] Could not normalize key '{key_name}': {e}")
                            
        except Exception as e:
            print(f"  [Error] Could not read file {filename}: {e}")

except FileNotFoundError:
    print(f"Error: Folder not found. Check your FOLDER_PATH: {FOLDER_PATH}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

# --- 5. Final Report (with "NAN" values) ---

print("\n--- Final Extraction Report ---")

# Go through the final dictionary and replace any remaining None with "NAN"
for key, value in final_extracted_data.items():
    if value is None:
        final_extracted_data[key] = "NAN"

# Print the final JSON
print(json.dumps(final_extracted_data, indent=2))