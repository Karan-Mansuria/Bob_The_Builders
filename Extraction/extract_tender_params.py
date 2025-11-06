import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional


# ---------------- Config ----------------
# ---------------- Config ----------------
class Config:
    PROTOCOL_FOLDER = str(Path("test") / "extracted_pages_new")
    LOG = True
    WINDOW_LINES = 3           # wider context window
    MAX_SNIPPETS_PER_PARAM = 10
    MIN_CHARS_IN_SNIPPET = 15  # shorter snippet tolerance

def log(msg: str) -> None:
    if Config.LOG:
        print(msg)


# ---------------- File Reader ----------------
def read_all_texts_and_tables(protocol_folder: str) -> List[Tuple[str, str]]:
    """
    Read all page text files and table CSV files.
    Returns a list of (filename, content) tuples.
    """
    texts: List[Tuple[str, str]] = []
    folder = Path(protocol_folder)
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {protocol_folder}")

    # Read .txt files
    for txt_path in sorted(folder.glob("page*_text.txt")):
        try:
            content = txt_path.read_text(encoding="utf-8", errors="ignore").strip()
            if content:
                texts.append((txt_path.name, content))
        except Exception as e:
            log(f"[warn] Could not read {txt_path}: {e}")

    # Read tables (.csv)
    for csv_path in sorted(folder.glob("page*_table*.csv")):
        try:
            content = csv_path.read_text(encoding="utf-8", errors="ignore").strip()
            normalized = re.sub(r",\s*", " | ", content)  # easier visual columns
            texts.append((csv_path.name, normalized))
        except Exception as e:
            log(f"[warn] Could not read {csv_path}: {e}")

    log(f"[info] Loaded {len(texts)} documents.")
    return texts


# ---------------- Keyword Mapping ----------------
KEYWORDS: Dict[str, List[str]] = {
    "tender_id": [
        "tender id", "tender no", "tender number", "nit no",
        "e-tender no", "bid no", "reference no"
    ],
    "tender_name": [
        "name of work", "work name", "tender name", "subject",
        "work title", "scope of work"
    ],
    "estimated_cost": [
        "estimated cost", "estimated amount", "tender value",
        "value put to tender", "project cost", "cost of work"
    ],
    "emd": [
        "emd", "earnest money deposit", "bid security", "security deposit", "earnest money","EMD ₹ ","earnest"
    ],
    "tender_fee": [
        "tender fee", "document fee", "cost of bid document",
        "cost of tender document", "bid fee"
    ],
    "organization": [
        "organization", "department", "authority", "employer",
        "client", "agency", "organisation"
    ],
    "date_of_opening":[
        "date of opening", "tender opening date", "bid opening date",
        "opening date", "date opened", "bid open date"
    ],
    "completion_time":[
        "completion time", "work completion period", "time for completion",
        "period of completion", "completion period", "time to complete","time of completion"
    ]
}


# ---------------- Context Collector ----------------
def collect_keyword_contexts(
    text_blocks: List[Tuple[str, str]],
    window_lines: int = Config.WINDOW_LINES,
    max_snippets_per_param: int = Config.MAX_SNIPPETS_PER_PARAM
) -> Dict[str, List[Tuple[str, List[str]]]]:
    """
    Improved keyword-context collector:
    - Handles multi-line EMD/COST structures
    - Fuzzy keyword match (handles OCR errors)
    - Includes numeric lines that follow keywords
    """
    results: Dict[str, List[Tuple[str, List[str]]]] = {k: [] for k in KEYWORDS}

    for source, content in text_blocks:
        lines = [ln.strip() for ln in content.splitlines() if ln.strip()]
        lower_lines = [ln.lower() for ln in lines]

        for param, keywords in KEYWORDS.items():
            if len(results[param]) >= max_snippets_per_param:
                continue

            for idx, low in enumerate(lower_lines):
                # combine 3 lines to handle broken OCR lines
                combined = " ".join(lower_lines[idx:idx+3])
                if not combined:
                    continue

                # fuzzy keyword matching
                if any(
                    re.search(r"\b" + re.escape(kw).replace(r"\ ", r"[\s\.]*") + r"\b", combined)
                    for kw in keywords
                ):
                    start = max(0, idx - window_lines)
                    end = min(len(lines), idx + window_lines + 3)

                    # include numeric / ₹ lines after the keyword
                    for j in range(idx + 1, min(len(lines), idx + 5)):
                        if re.search(r"[₹\d]", lines[j]):
                            end = max(end, j + 1)

                    snippet = lines[start:end]
                    joined = " ".join(snippet)

                    # skip duplicates
                    if any(joined in " ".join(snip) for _, snip in results[param]):
                        continue

                    # skip empty or too short unless numeric
                    if len(joined) < Config.MIN_CHARS_IN_SNIPPET and not re.search(r"[₹\d]", joined):
                        continue

                    results[param].append((source, snippet))
                    if len(results[param]) >= max_snippets_per_param:
                        break

    return results


# ---------------- Main Function ----------------
def main():
    folder = Config.PROTOCOL_FOLDER
    log(f"[info] Reading extracted pages from: {folder}")

    try:
        text_blocks = read_all_texts_and_tables(folder)
    except Exception as e:
        log(f"[error] Could not read extracted files: {e}")
        return

    contexts = collect_keyword_contexts(text_blocks)
    log(f"[info] Context collection complete.")

    # Pretty print sample contexts
    print("\n=== Tender Parameter Contexts (keyword-based) ===")
    for param, snippets in contexts.items():
        print(f"\n-- {param} --")
        if not snippets:
            print("(no matches found)")
            continue
        for source, snippet in snippets:
            print(f"[source: {source}]")
            for line in snippet:
                print(line)
            print("-" * 40)

    # Save all parameter contexts in param_contexts/
    out_dir = Path(folder) / "param_contexts"
    out_dir.mkdir(parents=True, exist_ok=True)
    index_lines = []

    for param, snippets in contexts.items():
        if not snippets:
            placeholder = out_dir / f"{param}_000.txt"
            placeholder.write_text("", encoding="utf-8")
            index_lines.append(f"{param}: 0")
            continue

        for i, (source, snippet) in enumerate(snippets, 1):
            fname = f"{param}_{i:03}.txt"
            fpath = out_dir / fname
            header = f"# param: {param}\n# source: {source}\n\n"
            snippet_text = "\n".join(snippet)
            fpath.write_text(header + snippet_text, encoding="utf-8")

        index_lines.append(f"{param}: {len(snippets)}")

    (out_dir / "INDEX.txt").write_text("\n".join(index_lines), encoding="utf-8")
    log(f"[info] Saved snippets to: {out_dir}")
    print("[✅] Done.")


# ---------------- Entry ----------------
if __name__ == "__main__":
    main()
