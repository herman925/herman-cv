import docx
import pandas as pd
import os

def read_docx(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        return "\n".join(full_text)
    except Exception as e:
        return str(e)

def read_excel_sheets(file_path):
    try:
        xl = pd.ExcelFile(file_path)
        return xl.sheet_names
    except Exception as e:
        return str(e)

base_path = r"Z:\My Drive\Workplace\my-cv\IT Examples\KeySteps\RCT"
doc_path = os.path.join(base_path, "20230714 KeySteps@JC 2.0 - Design on Randomisation.docx")
excel_path1 = os.path.join(base_path, "Inter-block Balanced Output.xlsx")
excel_path2 = os.path.join(base_path, "Original assignment with different strategies.xlsx")

print("--- Word Document Content ---")
print(read_docx(doc_path)[:2000]) # Print first 2000 chars

print("\n--- Excel Sheets: Inter-block Balanced Output.xlsx ---")
print(read_excel_sheets(excel_path1))

print("\n--- Excel Sheets: Original assignment with different strategies.xlsx ---")
print(read_excel_sheets(excel_path2))
