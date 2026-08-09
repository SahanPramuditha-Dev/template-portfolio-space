content = open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8').read().split('\n')
open_braces = 0

for i, line in enumerate(content):
    open_braces += line.count('{')
    open_braces -= line.count('}')
    print(f"{i+1:3d}: {open_braces} | {line}")
