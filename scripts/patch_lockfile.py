import os

lockfile_path = os.path.join(os.path.dirname(__file__), '../package-lock.json')

with open(lockfile_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('git+ssh://git@github.com', 'https://github.com')
content = content.replace('ssh://git@github.com', 'https://github.com')

with open(lockfile_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('package-lock.json patched successfully.')
