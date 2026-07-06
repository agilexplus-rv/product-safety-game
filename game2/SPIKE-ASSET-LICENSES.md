# Spike B — CC0 GLTF asset licenses

Every GLTF asset used by `game2/spike-gltf.js` is listed below. All assets are from
the **Kenney Furniture Kit (2.0)** by Kenney (www.kenney.nl), licensed under
**Creative Commons Zero (CC0 1.0)** — public domain, no attribution required.

## Source

- **Pack:** Kenney Furniture Kit (version 2.0)
- **Author/distributor:** Kenney (www.kenney.nl)
- **Pack license:** CC0 1.0 (http://creativecommons.org/publicdomain/zero/1.0/)
- **Pack creation date (per included license file):** 2018-10-20
- **Original pack download page:** https://kenney.nl/assets/furniture-kit
- **Bundled license file (committed in repo):** `game2/assets/gltf/LICENSE-furniture-kit.txt`
  - Contains the verbatim Kenney CC0 statement: "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/"

## Verification

The pack's `LICENSE-furniture-kit.txt` (shipped inside the downloaded archive and
committed verbatim at `game2/assets/gltf/LICENSE-furniture-kit.txt`) states the
pack is CC0. Kenney.nl publishes all of its asset packs under CC0; this is the
single source the assets were obtained from. The assets were converted from the
pack's original `.gltf`/`.bin` form into single-file `.glb` binaries (binary glTF
2.0, generator `UniGLTF-1.24`) so they load with no extra network requests.

## Per-asset manifest

Each row lists the asset name, the committed file, its size on disk, and the
license verified via the bundled `LICENSE-furniture-kit.txt`.

| Asset (Kenney name) | File | Size (bytes) | License | Verified via |
|---|---|---|---|---|
| loungeSofa | game2/assets/gltf/loungeSofa.glb | 9,644 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| tableCoffee | game2/assets/gltf/tableCoffee.glb | 8,256 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| lampSquareFloor | game2/assets/gltf/lampSquareFloor.glb | 5,624 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| bookcaseOpen | game2/assets/gltf/bookcaseOpen.glb | 18,020 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| televisionModern | game2/assets/gltf/televisionModern.glb | 6,368 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| pillow | game2/assets/gltf/pillow.glb | 5,044 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| pillowBlue | game2/assets/gltf/pillowBlue.glb | 5,056 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| plantSmall1 | game2/assets/gltf/plantSmall1.glb | 8,224 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |
| loungeChair | game2/assets/gltf/loungeChair.glb | 9,648 | CC0 1.0 | game2/assets/gltf/LICENSE-furniture-kit.txt |

**Total for the GLTF room: ~76,884 bytes (~75 KB)** — well under the 5 MB cap.

## Assets in the directory not used by the spike

The directory `game2/assets/gltf/` also contains other models from the same
Kenney Furniture Kit (also CC0) that were extracted but not referenced by
`spike-gltf.js`. They are kept for potential future room spikes; every one of
them is covered by the same bundled `LICENSE-furniture-kit.txt` CC0 statement.

## No CC-BY / CC-BY-SA / CC-BY-NC assets

None of the assets above carry any Creative Commons Attribution, ShareAlike, or
NonCommercial clause. The only license in play is CC0 1.0.
