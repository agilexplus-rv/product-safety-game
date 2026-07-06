import zipfile, sys
z = zipfile.ZipFile(sys.argv[1])
names = z.namelist()
for n in names[:80]:
    print(n)
print("---total:", len(names))
g = [n for n in names if n.lower().endswith((".gltf",".glb"))]
print("---GLTF:", len(g))
for n in g[:30]:
    print("  ", n)
