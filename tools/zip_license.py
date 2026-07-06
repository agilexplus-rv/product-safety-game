import zipfile
z = zipfile.ZipFile('game2/assets/gltf/kenney_furniture.zip')
for n in z.namelist():
    if n.lower().endswith(('.txt','.md','license')) or 'license' in n.lower() or 'readme' in n.lower():
        print("=====", n, "=====")
        print(z.read(n).decode('utf-8', errors='replace')[:1500])
