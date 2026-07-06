import zipfile, os
z = zipfile.ZipFile('game2/assets/gltf/kenney_furniture.zip')
want = [
    'loungeSofa.glb', 'loungeSofaOttoman.glb',
    'tableCoffee.glb', 'tableCoffeeSquare.glb', 'sideTable.glb', 'sideTableDrawers.glb',
    'loungeChair.glb', 'loungeChairRelax.glb', 'loungeDesignChair.glb', 'loungeDesignSofa.glb',
    'lampRoundFloor.glb', 'lampSquareFloor.glb', 'lampSquareCeiling.glb', 'lampWall.glb',
    'bookcaseOpen.glb', 'bookcaseClosed.glb', 'books.glb',
    'rugRectangle.glb', 'rugRound.glb', 'rugSquare.glb', 'rugRounded.glb',
    'plantSmall1.glb', 'plantSmall2.glb', 'plantSmall3.glb', 'pottedPlant.glb',
    'pillow.glb', 'pillowBlue.glb', 'pillowBlueLong.glb', 'pillowLong.glb',
    'cabinetTelevision.glb', 'televisionModern.glb', 'televisionVintage.glb',
    'chair.glb', 'chairCushion.glb', 'chairRounded.glb',
    'tableRound.glb', 'table.glb',
    'wallWindow.glb', 'wallWindowSlide.glb',
]
out_dir = 'game2/assets/gltf'
extracted = []
for n in z.namelist():
    base = os.path.basename(n)
    if base in want:
        data = z.read(n)
        with open(os.path.join(out_dir, base), 'wb') as f:
            f.write(data)
        extracted.append((base, len(data)))
for b, sz in sorted(extracted):
    print(f"{sz:>8}  {b}")
print("---extracted:", len(extracted), " total:", sum(s for _, s in extracted), "bytes")
