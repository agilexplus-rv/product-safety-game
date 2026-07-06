import zipfile, sys
z = zipfile.ZipFile(sys.argv[1])
g = sorted(n for n in z.namelist() if n.lower().endswith('.glb'))
for n in g:
    info = z.getinfo(n)
    print(f"{info.file_size:>8}  {n}")
print("---total GLBs:", len(g), " total bytes:", sum(z.getinfo(n).file_size for n in g))
