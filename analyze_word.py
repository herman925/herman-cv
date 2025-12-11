import zipfile
import os
import sys
import xml.dom.minidom

file_path = r'c:\Users\Herman\Downloads\my-cv\Backends\(CWAF) Case Worker Assessment Form.docx'

print(f"Analyzing: {file_path}")

if not os.path.exists(file_path):
    print("File not found!")
    sys.exit(1)

try:
    with zipfile.ZipFile(file_path, 'r') as z:
        files = z.namelist()
        
        # Check for Mail Merge Settings
        if 'word/settings.xml' in files:
            print("\n[Mail Merge Configuration (word/settings.xml)]")
            with z.open('word/settings.xml') as f:
                content = f.read()
                dom = xml.dom.minidom.parseString(content)
                
                mail_merge = dom.getElementsByTagName('w:mailMerge')
                if mail_merge:
                    print(" - Mail Merge Active: Yes")
                    
                    # Look for Data Source
                    data_source = mail_merge[0].getElementsByTagName('w:dataSource')
                    if data_source:
                        # Try to find relationship ID
                        rels = data_source[0].getAttribute('r:id')
                        print(f" - Data Source Relationship ID: {rels}")
                    
                    # Look for Query
                    query = mail_merge[0].getElementsByTagName('w:query')
                    if query:
                        val = query[0].getAttribute('w:val')
                        print(f" - SQL Query: {val}")
                        
                    # Look for Main Document Type
                    main_doc_type = mail_merge[0].getElementsByTagName('w:mainDocumentType')
                    if main_doc_type:
                        val = main_doc_type[0].getAttribute('w:val')
                        print(f" - Document Type: {val}")
                else:
                    print(" - Mail Merge Active: No")

        # Check Relationships for the actual file path
        if 'word/_rels/settings.xml.rels' in files:
             print("\n[Relationships (word/_rels/settings.xml.rels)]")
             with z.open('word/_rels/settings.xml.rels') as f:
                content = f.read()
                dom = xml.dom.minidom.parseString(content)
                relationships = dom.getElementsByTagName('Relationship')
                for rel in relationships:
                    target = rel.getAttribute('Target')
                    type_attr = rel.getAttribute('Type')
                    if 'mailMergeSource' in type_attr:
                        print(f" - Mail Merge Source Target: {target}")

        # Check for VBA
        if 'word/vbaProject.bin' in files:
            print("\n[VBA Structure]")
            print(" - vbaProject.bin found (Contains Macros)")

except Exception as e:
    print(f"Error reading zip structure: {e}")
