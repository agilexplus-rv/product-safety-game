import zipfile
z = zipfile.ZipFile('game2/assets/gltf/kenney_furniture.zip')
data = z.read('License.txt')
with open('game2/assets/gltf/LICENSE-furniture-kit.txt', 'wb') as f:
    f.write(data)
print('wrote', len(data), 'bytes')
