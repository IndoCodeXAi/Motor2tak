import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ENGINE_SPECS } from '../constants/engineConfig';
import { QualityPresetConfig, TelemetryData } from '../types/engine';
import { createNoiseBumpTexture } from './proceduralTextures';

export interface BuiltEngineController {
  scene: THREE.Scene;
  keyLight: THREE.DirectionalLight;
  setTransparentMode: (enabled: boolean) => void;
  applyQualityPreset: (renderer: THREE.WebGLRenderer, preset: QualityPresetConfig) => void;
  updateKinematics: (crankAngle: number, explodeProgress: number) => TelemetryData;
  dispose: () => void;
}

export function buildEngineScene(
  renderer: THREE.WebGLRenderer,
  initialQuality: QualityPresetConfig
): BuiltEngineController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0d12);
  scene.fog = new THREE.FogExp2(0x0b0d12, 0.022);

  // Environment Refleksi Logam Studio (PMREM + RoomEnvironment)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
  // Wajib kembalikan render target ke layar utama pada expo-gl
  renderer.setRenderTarget(null);

  scene.environment = envRT.texture;
  scene.environmentIntensity = initialQuality.envIntensity;

  // =========================================================================
  // PENCAHAYAAN STUDIO 3-TITIK & LANTAI SHADOW RECEIVER
  // =========================================================================
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.45);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
  keyLight.position.set(8, 14, 9);
  keyLight.castShadow = initialQuality.shadowsEnabled;
  keyLight.shadow.mapSize.width = initialQuality.shadowMapSize;
  keyLight.shadow.mapSize.height = initialQuality.shadowMapSize;
  keyLight.shadow.camera.near = 2;
  keyLight.shadow.camera.far = 35;
  const d = 8.5;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
  rimLight.position.set(-9, 8, -8);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xfdba74, 0.65);
  fillLight.position.set(-6, -2, 7);
  scene.add(fillLight);

  const floorGeo = new THREE.CircleGeometry(28, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0e1118,
    roughness: 0.72,
    metalness: 0.25,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -2.45;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const gridHelper = new THREE.PolarGridHelper(14, 16, 8, 64, 0x1e293b, 0x161e2e);
  gridHelper.position.y = -2.44;
  scene.add(gridHelper);

  // =========================================================================
  // TEKSTUR PROSEDURAL & MATERIAL PBR LOGAM REALISTIS (1:1)
  // =========================================================================
  const castBumpTex = createNoiseBumpTexture();
  const cutawayMaterials: THREE.Material[] = [];

  function registerCutawayMat<T extends THREE.Material>(mat: T, targetOpacity = 0.24): T {
    mat.userData.targetOpacity = targetOpacity;
    cutawayMaterials.push(mat);
    return mat;
  }

  const MAT = {
    castAluminium: registerCutawayMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xb8c0c8,
        metalness: 0.84,
        roughness: 0.42,
        bumpMap: castBumpTex,
        bumpScale: 0.006,
        clearcoat: 0.08,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      0.24
    ),

    castAluminiumSolid: new THREE.MeshStandardMaterial({
      color: 0xc2c9d1,
      metalness: 0.85,
      roughness: 0.38,
      bumpMap: castBumpTex,
      bumpScale: 0.005,
    }),

    machinedAluminium: new THREE.MeshStandardMaterial({
      color: 0xdbe2e9,
      metalness: 0.92,
      roughness: 0.2,
    }),

    darkIron: new THREE.MeshStandardMaterial({
      color: 0x3b424c,
      metalness: 0.82,
      roughness: 0.52,
      bumpMap: castBumpTex,
      bumpScale: 0.008,
    }),

    cylinderLiner: registerCutawayMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x525b66,
        metalness: 0.88,
        roughness: 0.28,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      0.18
    ),

    chromeSteel: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.98,
      roughness: 0.11,
    }),

    bronze: new THREE.MeshStandardMaterial({
      color: 0xc88a4b,
      metalness: 0.9,
      roughness: 0.26,
    }),

    forgedSteel: new THREE.MeshStandardMaterial({
      color: 0x7a8491,
      metalness: 0.88,
      roughness: 0.34,
      bumpMap: castBumpTex,
      bumpScale: 0.004,
    }),

    ceramicWhite: new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.02,
      roughness: 0.12,
      clearcoat: 0.9,
    }),

    brass: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.24,
    }),

    rubberBlack: new THREE.MeshStandardMaterial({
      color: 0x181b20,
      metalness: 0.05,
      roughness: 0.82,
    }),

    exhaustSteel: registerCutawayMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x565e69,
        metalness: 0.88,
        roughness: 0.32,
        clearcoat: 0.2,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      0.42
    ),

    portHighlight: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.55,
    }),
  };

  function createHexBolt(radius = 0.11, height = 0.12, washer = true) {
    const group = new THREE.Group();
    const headGeo = new THREE.CylinderGeometry(radius, radius, height, 6);
    const headMesh = new THREE.Mesh(headGeo, MAT.chromeSteel);
    headMesh.position.y = height / 2;
    headMesh.castShadow = true;
    group.add(headMesh);

    if (washer) {
      const washerGeo = new THREE.CylinderGeometry(radius * 1.32, radius * 1.32, height * 0.25, 18);
      const washerMesh = new THREE.Mesh(washerGeo, MAT.darkIron);
      washerMesh.position.y = height * 0.125;
      group.add(washerMesh);
    }
    return group;
  }

  function createStudNut(radius = 0.13, height = 0.16) {
    const group = new THREE.Group();
    const nut = createHexBolt(radius, height, true);
    group.add(nut);
    const studGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, height * 1.45, 14);
    const stud = new THREE.Mesh(studGeo, MAT.chromeSteel);
    stud.position.y = height * 0.72;
    group.add(stud);
    return group;
  }

  // =========================================================================
  // GRUP KOMPONEN 3D MESIN MOTOR 2-TAK
  // =========================================================================
  const engineRoot = new THREE.Group();
  scene.add(engineRoot);

  const crankcaseGroup = new THREE.Group();
  const crankshaftGroup = new THREE.Group();
  const flywheelGroup = new THREE.Group();
  const pistonGroup = new THREE.Group();
  const conRodGroup = new THREE.Group();
  const cylinderBlockGroup = new THREE.Group();
  const cylinderHeadGroup = new THREE.Group();
  const sparkPlugGroup = new THREE.Group();
  const carburetorGroup = new THREE.Group();
  const exhaustGroup = new THREE.Group();

  engineRoot.add(
    crankcaseGroup,
    crankshaftGroup,
    flywheelGroup,
    pistonGroup,
    conRodGroup,
    cylinderBlockGroup,
    cylinderHeadGroup,
    sparkPlugGroup,
    carburetorGroup,
    exhaustGroup
  );

  // 1. CRANKCASE
  (function buildCrankcase() {
    const shape = new THREE.Shape();
    const r = 2.05;
    shape.absarc(0, 0, r, Math.PI * 0.15, Math.PI * 1.65, false);
    shape.lineTo(-2.85, -1.75);
    shape.quadraticCurveTo(-3.45, -1.55, -3.45, -0.75);
    shape.lineTo(-3.1, 0.85);
    shape.quadraticCurveTo(-2.7, 1.45, -1.65, 1.65);
    shape.closePath();

    const crankHole = new THREE.Path();
    crankHole.absarc(0, 0, 1.68, 0, Math.PI * 2, true);
    shape.holes.push(crankHole);

    const caseGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 2.3,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    });
    caseGeo.translate(0, 0, -1.15);
    const caseMesh = new THREE.Mesh(caseGeo, MAT.castAluminium);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    crankcaseGroup.add(caseMesh);

    const leftCoverGeo = new THREE.CylinderGeometry(1.88, 1.95, 0.45, 36);
    leftCoverGeo.rotateX(Math.PI / 2);
    const leftCover = new THREE.Mesh(leftCoverGeo, MAT.castAluminium);
    leftCover.position.set(0, 0, 1.38);
    crankcaseGroup.add(leftCover);

    const rightCoverGeo = new THREE.CylinderGeometry(1.92, 2.0, 0.52, 36);
    rightCoverGeo.rotateX(Math.PI / 2);
    const rightCover = new THREE.Mesh(rightCoverGeo, MAT.castAluminium);
    rightCover.position.set(0, 0, -1.42);
    crankcaseGroup.add(rightCover);

    const boltAngles = [0.4, 1.1, 2.2, 2.8, 3.4, 4.0, 4.7, 5.4];
    boltAngles.forEach((ang) => {
      const bx = Math.cos(ang) * 1.96;
      const by = Math.sin(ang) * 1.96;
      const bFront = createHexBolt(0.09, 0.12);
      bFront.rotation.x = Math.PI / 2;
      bFront.position.set(bx, by, 1.58);
      crankcaseGroup.add(bFront);

      const bBack = createHexBolt(0.09, 0.12);
      bBack.rotation.x = -Math.PI / 2;
      bBack.position.set(bx, by, -1.65);
      crankcaseGroup.add(bBack);
    });

    const deckGeo = new THREE.BoxGeometry(3.35, 0.55, 3.15);
    const deckMesh = new THREE.Mesh(deckGeo, MAT.castAluminium);
    deckMesh.position.set(0, 2.08, 0);
    crankcaseGroup.add(deckMesh);

    const reedBoxGeo = new THREE.BoxGeometry(1.15, 1.05, 1.25);
    const reedBox = new THREE.Mesh(reedBoxGeo, MAT.castAluminium);
    reedBox.position.set(-1.95, 1.85, 0);
    reedBox.rotation.z = 0.28;
    crankcaseGroup.add(reedBox);

    const mountGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.6, 20);
    mountGeo.rotateX(Math.PI / 2);
    const mountFront = new THREE.Mesh(mountGeo, MAT.castAluminiumSolid);
    mountFront.position.set(1.55, -1.65, 0);
    crankcaseGroup.add(mountFront);

    const mountRear = new THREE.Mesh(mountGeo, MAT.castAluminiumSolid);
    mountRear.position.set(-2.95, -1.55, 0);
    crankcaseGroup.add(mountRear);
  })();

  // 2. CRANKSHAFT & FLYWHEEL
  (function buildCrankshaftAndFlywheel() {
    const R = ENGINE_SPECS.crankRadius;
    const webRadius = 1.52;
    const webThick = 0.36;
    const webOffsetZ = 0.54;

    function createCrankWeb() {
      const webGroup = new THREE.Group();
      const webShape = new THREE.Shape();
      webShape.absarc(0, 0, webRadius, 0, Math.PI * 2, false);

      const hole1 = new THREE.Path();
      hole1.absarc(-0.55, -0.65, 0.32, 0, Math.PI * 2, true);
      const hole2 = new THREE.Path();
      hole2.absarc(0.55, -0.65, 0.32, 0, Math.PI * 2, true);
      webShape.holes.push(hole1, hole2);

      const geo = new THREE.ExtrudeGeometry(webShape, {
        depth: webThick,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      });
      geo.translate(0, 0, -webThick / 2);
      const mesh = new THREE.Mesh(geo, MAT.darkIron);
      mesh.castShadow = true;
      webGroup.add(mesh);

      const rimGeo = new THREE.CylinderGeometry(
        webRadius + 0.01,
        webRadius + 0.01,
        webThick * 0.65,
        36,
        1,
        true
      );
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, MAT.machinedAluminium);
      webGroup.add(rim);

      return webGroup;
    }

    const webFront = createCrankWeb();
    webFront.position.z = webOffsetZ;
    crankshaftGroup.add(webFront);

    const webBack = createCrankWeb();
    webBack.position.z = -webOffsetZ;
    crankshaftGroup.add(webBack);

    const crankPinGeo = new THREE.CylinderGeometry(0.28, 0.28, webOffsetZ * 2 + webThick * 0.9, 24);
    crankPinGeo.rotateX(Math.PI / 2);
    const crankPin = new THREE.Mesh(crankPinGeo, MAT.chromeSteel);
    crankPin.position.set(0, R, 0);
    crankshaftGroup.add(crankPin);

    const bigBearingGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.52, 24);
    bigBearingGeo.rotateX(Math.PI / 2);
    const bigBearing = new THREE.Mesh(bigBearingGeo, MAT.bronze);
    bigBearing.position.set(0, R, 0);
    crankshaftGroup.add(bigBearing);

    const mainShaftGeo = new THREE.CylinderGeometry(0.34, 0.34, 3.6, 24);
    mainShaftGeo.rotateX(Math.PI / 2);
    const mainShaft = new THREE.Mesh(mainShaftGeo, MAT.chromeSteel);
    crankshaftGroup.add(mainShaft);

    [-1.02, 1.02].forEach((zPos) => {
      const bearingOuter = new THREE.Mesh(
        new THREE.TorusGeometry(0.56, 0.14, 14, 32),
        MAT.chromeSteel
      );
      bearingOuter.position.z = zPos;
      crankshaftGroup.add(bearingOuter);
    });

    const gearGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.32, 28);
    gearGeo.rotateX(Math.PI / 2);
    const primaryGear = new THREE.Mesh(gearGeo, MAT.forgedSteel);
    primaryGear.position.z = -1.35;
    crankshaftGroup.add(primaryGear);

    const rotorCupGeo = new THREE.CylinderGeometry(1.38, 1.42, 0.62, 36);
    rotorCupGeo.rotateX(Math.PI / 2);
    const rotorCup = new THREE.Mesh(rotorCupGeo, MAT.darkIron);
    rotorCup.position.z = 1.48;
    rotorCup.castShadow = true;
    flywheelGroup.add(rotorCup);

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.14), MAT.machinedAluminium);
      fin.position.set(Math.cos(ang) * 0.92, Math.sin(ang) * 0.92, 1.82);
      fin.rotation.z = ang;
      flywheelGroup.add(fin);
    }

    const flyNut = createHexBolt(0.24, 0.22, true);
    flyNut.rotation.x = Math.PI / 2;
    flyNut.position.z = 1.82;
    flywheelGroup.add(flyNut);
  })();

  // 3. PISTON & RINGS
  (function buildPiston() {
    const r = ENGINE_SPECS.boreRadius * 0.975;
    const h = ENGINE_SPECS.pistonHeight;

    const bodyGeo = new THREE.CylinderGeometry(r, r * 0.99, h, 40);
    const bodyMesh = new THREE.Mesh(bodyGeo, MAT.machinedAluminium);
    bodyMesh.position.y = h / 2;
    bodyMesh.castShadow = true;
    pistonGroup.add(bodyMesh);

    const domeGeo = new THREE.SphereGeometry(r * 1.45, 36, 16, 0, Math.PI * 2, 0, 0.48);
    const domeMesh = new THREE.Mesh(domeGeo, MAT.machinedAluminium);
    domeMesh.position.y = h - r * 1.28;
    pistonGroup.add(domeMesh);

    const ringPositionsY = [h - 0.16, h - 0.31];
    ringPositionsY.forEach((ry) => {
      const grooveGeo = new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.055, 36);
      const groove = new THREE.Mesh(grooveGeo, MAT.darkIron);
      groove.position.y = ry;
      pistonGroup.add(groove);

      const ringGeo = new THREE.TorusGeometry(r * 1.003, 0.024, 12, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, MAT.chromeSteel);
      ring.position.y = ry;
      pistonGroup.add(ring);
    });

    const pinGeo = new THREE.CylinderGeometry(0.24, 0.24, r * 1.88, 24);
    pinGeo.rotateX(Math.PI / 2);
    const wristPin = new THREE.Mesh(pinGeo, MAT.chromeSteel);
    wristPin.position.y = ENGINE_SPECS.pistonPinOffset;
    pistonGroup.add(wristPin);

    [-r * 0.68, r * 0.68].forEach((zOff) => {
      const bossGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.32, 20);
      bossGeo.rotateX(Math.PI / 2);
      const boss = new THREE.Mesh(bossGeo, MAT.castAluminiumSolid);
      boss.position.set(0, ENGINE_SPECS.pistonPinOffset, zOff);
      pistonGroup.add(boss);
    });
  })();

  // 4. CONNECTING ROD
  (function buildConnectingRod() {
    const L = ENGINE_SPECS.conRodLength;

    const bigEndGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.44, 28);
    bigEndGeo.rotateX(Math.PI / 2);
    const bigEnd = new THREE.Mesh(bigEndGeo, MAT.forgedSteel);
    bigEnd.castShadow = true;
    conRodGroup.add(bigEnd);

    const smallEndGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.42, 24);
    smallEndGeo.rotateX(Math.PI / 2);
    const smallEnd = new THREE.Mesh(smallEndGeo, MAT.forgedSteel);
    smallEnd.position.y = L;
    conRodGroup.add(smallEnd);

    const bushingGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 20);
    bushingGeo.rotateX(Math.PI / 2);
    const bushing = new THREE.Mesh(bushingGeo, MAT.bronze);
    bushing.position.y = L;
    conRodGroup.add(bushing);

    const beamShape = new THREE.Shape();
    beamShape.moveTo(-0.26, 0.35);
    beamShape.lineTo(0.26, 0.35);
    beamShape.lineTo(0.17, L - 0.25);
    beamShape.lineTo(-0.17, L - 0.25);
    beamShape.closePath();

    const beamGeo = new THREE.ExtrudeGeometry(beamShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    beamGeo.translate(0, 0, -0.12);
    const beamMesh = new THREE.Mesh(beamGeo, MAT.forgedSteel);
    beamMesh.castShadow = true;
    conRodGroup.add(beamMesh);

    const ribGeo = new THREE.BoxGeometry(0.08, L - 0.65, 0.34);
    const ribMesh = new THREE.Mesh(ribGeo, MAT.machinedAluminium);
    ribMesh.position.y = L / 2;
    conRodGroup.add(ribMesh);
  })();

  // 5. CYLINDER BLOCK & TRANSFER PORTS
  (function buildCylinderBlock() {
    const y0 = ENGINE_SPECS.blockBottomY;
    const h = ENGINE_SPECS.blockHeight;
    const rInner = ENGINE_SPECS.boreRadius;

    const linerGeo = new THREE.CylinderGeometry(rInner + 0.14, rInner + 0.14, h + 0.25, 44, 1, true);
    const linerMesh = new THREE.Mesh(linerGeo, MAT.cylinderLiner);
    linerMesh.position.y = y0 + h / 2;
    cylinderBlockGroup.add(linerMesh);

    const finCount = 10;
    for (let i = 0; i < finCount; i++) {
      const t = i / (finCount - 1);
      const fy = y0 + 0.22 + t * (h - 0.38);
      const finW = 3.15 + t * 0.55;
      const finD = 3.05 + t * 0.45;

      const finShape = new THREE.Shape();
      const hw = finW / 2;
      const hd = finD / 2;
      const cr = 0.42;

      finShape.moveTo(-hw + cr, -hd);
      finShape.lineTo(hw - cr, -hd);
      finShape.quadraticCurveTo(hw, -hd, hw, -hd + cr);
      finShape.lineTo(hw, hd - cr);
      finShape.quadraticCurveTo(hw, hd, hw - cr, hd);
      finShape.lineTo(-hw + cr, hd);
      finShape.quadraticCurveTo(-hw, hd, -hw, hd - cr);
      finShape.lineTo(-hw, -hd + cr);
      finShape.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);

      const boreHole = new THREE.Path();
      boreHole.absarc(0, 0, rInner + 0.12, 0, Math.PI * 2, true);
      finShape.holes.push(boreHole);

      const finGeo = new THREE.ExtrudeGeometry(finShape, {
        depth: 0.085,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.015,
        bevelThickness: 0.015,
      });
      finGeo.rotateX(Math.PI / 2);

      const finMesh = new THREE.Mesh(finGeo, MAT.castAluminium);
      finMesh.position.y = fy;
      finMesh.castShadow = true;
      finMesh.receiveShadow = true;
      cylinderBlockGroup.add(finMesh);
    }

    const baseFlangeGeo = new THREE.BoxGeometry(3.45, 0.22, 3.25);
    const baseFlange = new THREE.Mesh(baseFlangeGeo, MAT.castAluminium);
    baseFlange.position.y = y0 + 0.11;
    cylinderBlockGroup.add(baseFlange);

    const flangeOffsets = [
      [-1.38, -1.28],
      [1.38, -1.28],
      [-1.38, 1.28],
      [1.38, 1.28],
    ];
    flangeOffsets.forEach(([fx, fz]) => {
      const bolt = createStudNut(0.11, 0.15);
      bolt.position.set(fx, y0 + 0.22, fz);
      cylinderBlockGroup.add(bolt);
    });

    const studOffsets = [
      [-1.18, -1.12],
      [1.18, -1.12],
    