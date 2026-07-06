import struct, json, sys
# GLB: 12-byte header (magic, version, length), then JSON chunk (length, type, data)
with open(sys.argv[1], 'rb') as f:
    data = f.read()
assert data[:4] == b'glTF', 'not a GLB'
total_len = struct.unpack('<I', data[8:12])[0]
chunk_len = struct.unpack('<I', data[12:16])[0]
chunk_type = data[16:20]
assert chunk_type == b'JSON', chunk_type
jstr = data[20:20+chunk_len].decode('utf-8').rstrip('\x00 ')
gltf = json.loads(jstr)
print('asset:', gltf.get('asset'))
# gather accessors with POSITION
import re
mins = [1e9]*3; maxs = [-1e9]*3
for mesh in gltf.get('meshes', []):
    for p in mesh.get('primitives', []):
        pos_acc = p['attributes'].get('POSITION')
        acc = gltf['accessors'][pos_acc]
        mn = acc.get('min', [0,0,0]); mx = acc.get('max', [0,0,0])
        for i in range(3):
            mins[i] = min(mins[i], mn[i]); maxs[i] = max(maxs[i], mx[i])
print('overall min:', mins)
print('overall max:', maxs)
print('size:', [maxs[i]-mins[i] for i in range(3)])
print('nodes:', len(gltf.get('nodes',[])), 'meshes:', len(gltf.get('meshes',[])))
for n in gltf.get('nodes', [])[:5]:
    print(' node:', n)
