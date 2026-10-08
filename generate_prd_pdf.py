import os
import subprocess

html_path = os.path.abspath('prd_report.html')
file_uri = 'file:///' + html_path.replace('\\', '/')

pdf_out_root = os.path.abspath('Innovex_PRD_Document.pdf')
pdf_out_artifact = r"C:\Users\HP\.gemini\antigravity\brain\a628c658-db7f-4b0a-9b0f-ae4fe884eb5b\Innovex_PRD_Document.pdf"

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print("PRD HTML URI:", file_uri)
print("PDF OUT ROOT:", pdf_out_root)
print("PDF OUT ARTIFACT:", pdf_out_artifact)

cmd1 = [edge_path, "--headless", "--disable-gpu", f"--print-to-pdf={pdf_out_root}", file_uri]
subprocess.run(cmd1, check=True)

cmd2 = [edge_path, "--headless", "--disable-gpu", f"--print-to-pdf={pdf_out_artifact}", file_uri]
subprocess.run(cmd2, check=True)

print("PRD PDF Generation Completed Successfully!")
