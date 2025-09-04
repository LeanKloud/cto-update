import re

# Read the file
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove the CloudAccountSummary import
content = content.replace(
    "import CloudAccountSummary from './components/CloudAccountSummary';",
    ""
)

# Write the file back
with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Step 1: Import removed successfully!")
