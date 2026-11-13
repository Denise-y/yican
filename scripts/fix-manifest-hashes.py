import hashlib, json, re, subprocess

norm = lambda b: b.replace(b'\r\n', b'\n')
sha = lambda b: hashlib.sha256(b).hexdigest()

folder = 'content/howtocook/'
manifest_b = open(folder + 'manifest.json', 'rb').read()
manifest = json.loads(manifest_b.decode('utf-8'))
bundle_b = open(folder + 'bundle.json', 'rb').read()

new_manifest_sha = sha(norm(manifest_b))
old = json.loads(bundle_b.decode('utf-8'))['manifestSha256']
updated = re.sub(rb'("manifestSha256"\s*:\s*")[a-f0-9]{64}(")',
                 lambda m: m.group(1) + new_manifest_sha.encode() + m.group(2), bundle_b, count=1)
if updated != bundle_b:
    open(folder + 'bundle.json', 'wb').write(updated)
    print(f'manifestSha256 updated: {old[:12]}... -> {new_manifest_sha[:12]}...')
else:
    print('manifestSha256 unchanged')

bundle = json.loads(open(folder + 'bundle.json', 'rb').read().decode('utf-8'))
errors = []

if sha(norm(manifest_b)) != bundle['manifestSha256']:
    errors.append('manifestSha256 mismatch')
lic = open(folder + manifest['source']['licenseFile'], 'rb').read()
if sha(norm(lic)) != bundle['licenseSha256']:
    errors.append(f"licenseSha256 mismatch (stored={bundle['licenseSha256'][:12]}, got={sha(norm(lic))[:12]})")

for row in manifest['recipes']:
    md = open(folder + row['markdownFile'], 'rb').read()
    if sha(norm(md)) != row['markdownSha256']:
        errors.append(f"markdownSha256 mismatch: {row['recipeId']}")

rev = json.load(open(folder + 'cover-review.json', encoding='utf-8'))
cor = json.load(open(folder + 'cover-corrections.json', encoding='utf-8'))
if rev['archiveSha256'] != bundle['archiveSha256'] or cor['archiveSha256'] != bundle['archiveSha256']:
    errors.append('archiveSha256 cross-check mismatch')

blob = subprocess.run(['git', 'cat-file', 'blob', ':content/howtocook/manifest.json'], capture_output=True).stdout
if sha(norm(blob)) != bundle['manifestSha256']:
    errors.append('git-blob manifest mismatch')
if norm(blob) != norm(manifest_b):
    errors.append('git-blob content differs beyond EOL')

print('recipes checked:', len(manifest['recipes']))
print('ERRORS:', errors if errors else 'none - all checks passed')
