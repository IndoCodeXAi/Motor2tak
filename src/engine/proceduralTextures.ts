import * as THREE from 'three';

/**
 * Pengganti 1:1 createNoiseBumpTexture() berbasis HTML5 Canvas agar berjalan
 * murni di GPU / expo-gl tanpa bergantung pada DOM `document`.
 */
export function createNoiseBumpTexture(): THREE.DataTexture {
  const size = 256;
  const totalPixels = size * size;
  const data = new Uint8Array(totalPixels * 4);

  for (let i = 0; i < data.length; i += 4) {
    const v = 115 + Math.floor(Math.random() * 26);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}
