from pypdf import PdfReader
import os
import sys

file_path = r'c:\Users\Herman\Downloads\my-cv\Backends\Intake (Singleton) Master File 2017.pdf'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

try:
    reader = PdfReader(file_path)
    print(f"Analyzing: {file_path}")
    print(f"Pages: {len(reader.pages)}")
    
    print("\n[Content Preview]")
    # Read first page
    if len(reader.pages) > 0:
        text = reader.pages[0].extract_text()
        print(text[:1000])
        
    # Check for form fields
    if reader.get_fields():
        print("\n[Form Fields Detected]")
        for field in list(reader.get_fields().keys())[:10]:
            print(f" - {field}")
            
except Exception as e:
    print(f"Error: {e}")

