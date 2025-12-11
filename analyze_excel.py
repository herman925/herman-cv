import pandas as pd

try:
    file_path = 'Project Masterlist.xlsx'
    xls = pd.ExcelFile(file_path)
    
    print(f"Sheet names: {xls.sheet_names}")
    
    for sheet_name in xls.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(xls, sheet_name=sheet_name, nrows=5)
        print(f"Columns: {list(df.columns)}")
        print("Sample Data:")
        print(df.head(2).to_string())
        
except Exception as e:
    print(f"Error: {e}")
