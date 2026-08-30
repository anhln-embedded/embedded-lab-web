"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberKoiCanvasProps {
  className?: string;
}

export default function CyberKoiCanvas({ className = "" }: CyberKoiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isVisible = true;

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffedd5, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffa500, 2.8);
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 2.2, 22);
    cyanLight.position.set(-7, -4, 5);
    scene.add(cyanLight);

    const koiGlowLight = new THREE.PointLight(0xff8c00, 2.8, 10);
    scene.add(koiGlowLight);

    // --- 3. Spine Nodes Setup ---
    const SPINE_COUNT = 24;
    const RADIAL_SEGMENTS = 16;
    const FISH_LENGTH = 5.4;

    interface SpinePoint {
      pos: THREE.Vector3;
      radiusX: number;
      radiusY: number;
    }

    const spineProfiles: SpinePoint[] = [];
    for (let i = 0; i < SPINE_COUNT; i++) {
      const u = i / (SPINE_COUNT - 1);
      const z = (0.5 - u) * FISH_LENGTH;

      let rx = 0;
      let ry = 0;
      if (u < 0.15) {
        // Head / Nose
        const t = u / 0.15;
        rx = Math.sin(t * Math.PI * 0.5) * 0.58;
        ry = Math.sin(t * Math.PI * 0.5) * 0.44;
      } else if (u < 0.45) {
        // Chest & Belly (Widest part)
        const t = (u - 0.15) / 0.3;
        rx = 0.58 + Math.sin(t * Math.PI) * 0.24;
        ry = 0.44 + Math.sin(t * Math.PI) * 0.20;
      } else {
        // Tapering smoothly towards tail
        const t = (u - 0.45) / 0.55;
        rx = 0.58 * (1 - t * 0.85);
        ry = 0.44 * (1 - t * 0.82);
      }

      spineProfiles.push({
        pos: new THREE.Vector3(0, 0, z),
        radiusX: Math.max(0.05, rx),
        radiusY: Math.max(0.04, ry),
      });
    }

    // --- 4. Main Body Mesh ---
    const bodyVertexCount = SPINE_COUNT * RADIAL_SEGMENTS;
    const bodyPositions = new Float32Array(bodyVertexCount * 3);
    const bodyNormals = new Float32Array(bodyVertexCount * 3);
    const bodyUVs = new Float32Array(bodyVertexCount * 2);
    const bodyColors = new Float32Array(bodyVertexCount * 3);

    const bodyIndices: number[] = [];
    for (let i = 0; i < SPINE_COUNT - 1; i++) {
      for (let j = 0; j < RADIAL_SEGMENTS; j++) {
        const nextJ = (j + 1) % RADIAL_SEGMENTS;
        const p1 = i * RADIAL_SEGMENTS + j;
        const p2 = (i + 1) * RADIAL_SEGMENTS + j;
        const p3 = (i + 1) * RADIAL_SEGMENTS + nextJ;
        const p4 = i * RADIAL_SEGMENTS + nextJ;

        bodyIndices.push(p1, p2, p4);
        bodyIndices.push(p2, p3, p4);
      }
    }

    const bodyGeometry = new THREE.BufferGeometry();
    bodyGeometry.setAttribute("position", new THREE.BufferAttribute(bodyPositions, 3));
    bodyGeometry.setAttribute("normal", new THREE.BufferAttribute(bodyNormals, 3));
    bodyGeometry.setAttribute("uv", new THREE.BufferAttribute(bodyUVs, 2));
    bodyGeometry.setAttribute("color", new THREE.BufferAttribute(bodyColors, 3));
    bodyGeometry.setIndex(bodyIndices);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.22,
      metalness: 0.38,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: 0.22,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(bodyMesh);

    // --- 5. Custom Procedural Fins with Robust Vertex Frames ---
    // (A) Tail Fin (Caudal) - Silk flowing double lobe
    const TAIL_ROWS = 6;
    const TAIL_COLS = 8;
    const tailVertexCount = TAIL_ROWS * TAIL_COLS;
    const tailPositions = new Float32Array(tailVertexCount * 3);
    const tailNormals = new Float32Array(tailVertexCount * 3);
    const tailColors = new Float32Array(tailVertexCount * 3);
    const tailUVs = new Float32Array(tailVertexCount * 2);

    const tailIndices: number[] = [];
    for (let i = 0; i < TAIL_ROWS - 1; i++) {
      for (let j = 0; j < TAIL_COLS - 1; j++) {
        const p1 = i * TAIL_COLS + j;
        const p2 = (i + 1) * TAIL_COLS + j;
        const p3 = (i + 1) * TAIL_COLS + (j + 1);
        const p4 = i * TAIL_COLS + (j + 1);

        tailIndices.push(p1, p2, p4);
        tailIndices.push(p2, p3, p4);
      }
    }

    const tailGeometry = new THREE.BufferGeometry();
    tailGeometry.setAttribute("position", new THREE.BufferAttribute(tailPositions, 3));
    tailGeometry.setAttribute("normal", new THREE.BufferAttribute(tailNormals, 3));
    tailGeometry.setAttribute("color", new THREE.BufferAttribute(tailColors, 3));
    tailGeometry.setAttribute("uv", new THREE.BufferAttribute(tailUVs, 2));
    tailGeometry.setIndex(tailIndices);

    const finMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.35,
      emissive: new THREE.Color(0xff5500),
      emissiveIntensity: 0.45,
    });

    const tailMesh = new THREE.Mesh(tailGeometry, finMaterial);
    scene.add(tailMesh);

    // (B) Pectoral Fins (Left & Right) - Teardrop fan
    const FIN_U_SEGS = 5;
    const FIN_V_SEGS = 5;
    const finVertexCount = (FIN_U_SEGS + 1) * (FIN_V_SEGS + 1);

    const buildFinGeometry = () => {
      const pos = new Float32Array(finVertexCount * 3);
      const norm = new Float32Array(finVertexCount * 3);
      const col = new Float32Array(finVertexCount * 3);
      const idx: number[] = [];

      for (let i = 0; i < FIN_U_SEGS; i++) {
        for (let j = 0; j < FIN_V_SEGS; j++) {
          const p1 = i * (FIN_V_SEGS + 1) + j;
          const p2 = (i + 1) * (FIN_V_SEGS + 1) + j;
          const p3 = (i + 1) * (FIN_V_SEGS + 1) + (j + 1);
          const p4 = i * (FIN_V_SEGS + 1) + (j + 1);

          idx.push(p1, p2, p4);
          idx.push(p2, p3, p4);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(norm, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setIndex(idx);
      return geo;
    };

    const leftFinGeometry = buildFinGeometry();
    const rightFinGeometry = buildFinGeometry();

    const leftFinMesh = new THREE.Mesh(leftFinGeometry, finMaterial);
    const rightFinMesh = new THREE.Mesh(rightFinGeometry, finMaterial);
    scene.add(leftFinMesh);
    scene.add(rightFinMesh);

    // (C) Dorsal Fin (Vây Lưng)
    const DORSAL_START = 6;
    const DORSAL_END = 16;
    const DORSAL_NODES = DORSAL_END - DORSAL_START + 1;
    const dorsalVertexCount = DORSAL_NODES * 2; // base + tip
    const dorsalPositions = new Float32Array(dorsalVertexCount * 3);
    const dorsalNormals = new Float32Array(dorsalVertexCount * 3);
    const dorsalColors = new Float32Array(dorsalVertexCount * 3);
    const dorsalIndices: number[] = [];

    for (let i = 0; i < DORSAL_NODES - 1; i++) {
      const b1 = i * 2;
      const t1 = i * 2 + 1;
      const b2 = (i + 1) * 2;
      const t2 = (i + 1) * 2 + 1;

      dorsalIndices.push(b1, t1, b2);
      dorsalIndices.push(t1, t2, b2);
    }

    const dorsalGeometry = new THREE.BufferGeometry();
    dorsalGeometry.setAttribute("position", new THREE.BufferAttribute(dorsalPositions, 3));
    dorsalGeometry.setAttribute("normal", new THREE.BufferAttribute(dorsalNormals, 3));
    dorsalGeometry.setAttribute("color", new THREE.BufferAttribute(dorsalColors, 3));
    dorsalGeometry.setIndex(dorsalIndices);

    const dorsalMesh = new THREE.Mesh(dorsalGeometry, finMaterial);
    scene.add(dorsalMesh);

    // --- 6. Bioluminescent Ambience Particles ---
    const PARTICLE_COUNT = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      particleSpeeds[i] = 0.25 + Math.random() * 0.5;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffb700,
      size: 0.14,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 7. Water Ripples ---
    const RIPPLE_COUNT = 6;
    const ripples: { mesh: THREE.Mesh; scale: number; opacity: number; active: boolean }[] = [];
    const rippleGroup = new THREE.Group();
    scene.add(rippleGroup);

    const rippleGeo = new THREE.RingGeometry(0.1, 0.16, 32);
    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const rippleMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rMesh.position.z = -1;
      rMesh.visible = false;
      rippleGroup.add(rMesh);
      ripples.push({ mesh: rMesh, scale: 1, opacity: 0, active: false });
    }

    let nextRippleIdx = 0;
    const spawnRipple = (x: number, y: number, color = 0x00f0ff) => {
      const r = ripples[nextRippleIdx];
      r.mesh.position.set(x, y, -0.5);
      r.scale = 0.2;
      r.opacity = 0.85;
      r.active = true;
      r.mesh.visible = true;
      (r.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      nextRippleIdx = (nextRippleIdx + 1) % RIPPLE_COUNT;
    };

    // --- 8. Swimming Physics Simulation ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isMoving: false };
    const fishPos = new THREE.Vector3(0, 0, 0);
    const fishVelocity = new THREE.Vector3(0, 0, 0);
    let fishHeading = Math.PI * 0.5;
    let fishPitch = 0;
    let fishRoll = 0;
    let swimCycle = 0;
    let swimSpeed = 1.0;

    const spineNodes: THREE.Vector3[] = [];
    for (let i = 0; i < SPINE_COUNT; i++) {
      spineNodes.push(new THREE.Vector3(0, 0, (0.5 - i / (SPINE_COUNT - 1)) * FISH_LENGTH));
    }

    // --- 9. Event Listeners ---
    let lastMouseMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = nx * 7.5;
      mouse.targetY = ny * 4.5;
      mouse.isMoving = true;
      lastMouseMoveTime = performance.now();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      spawnRipple(nx * 7.5, ny * 4.5, 0xffaa00);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // --- 10. Update Functions for Body and All Fins ---
    const updateAllGeometries = (
      spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[],
      cycle: number
    ) => {
      const goldColor = new THREE.Color(0xff8c00);
      const amberColor = new THREE.Color(0xffb700);
      const whiteColor = new THREE.Color(0xfff8ee);
      const redColor = new THREE.Color(0xf04810);
      const finEdgeColor = new THREE.Color(0xffc233);

      // (A) Body Update
      let vIdx = 0;
      let uvIdx = 0;
      let cIdx = 0;

      for (let i = 0; i < SPINE_COUNT; i++) {
        const u = i / (SPINE_COUNT - 1);
        const { pos, up, side } = spineTransforms[i];
        const { radiusX, radiusY } = spineProfiles[i];

        for (let j = 0; j < RADIAL_SEGMENTS; j++) {
          const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const offsetX = side.x * cosT * radiusX + up.x * sinT * radiusY;
          const offsetY = side.y * cosT * radiusX + up.y * sinT * radiusY;
          const offsetZ = side.z * cosT * radiusX + up.z * sinT * radiusY;

          bodyPositions[vIdx * 3] = pos.x + offsetX;
          bodyPositions[vIdx * 3 + 1] = pos.y + offsetY;
          bodyPositions[vIdx * 3 + 2] = pos.z + offsetZ;

          const len = Math.hypot(offsetX, offsetY, offsetZ) || 1;
          bodyNormals[vIdx * 3] = offsetX / len;
          bodyNormals[vIdx * 3 + 1] = offsetY / len;
          bodyNormals[vIdx * 3 + 2] = offsetZ / len;

          bodyUVs[uvIdx * 2] = j / RADIAL_SEGMENTS;
          bodyUVs[uvIdx * 2 + 1] = u;

          let finalColor = goldColor.clone();
          if (sinT < -0.2) {
            finalColor.lerp(whiteColor, Math.min(1, (-sinT - 0.2) * 1.5));
          } else {
            const spotPattern = Math.sin(u * 12.0) * Math.cos(theta * 2.0);
            if (spotPattern > 0.25 && u > 0.08 && u < 0.8) {
              finalColor.lerp(redColor, 0.85);
            } else if (sinT > 0.5) {
              finalColor.lerp(amberColor, 0.6);
            }
          }

          bodyColors[cIdx * 3] = finalColor.r;
          bodyColors[cIdx * 3 + 1] = finalColor.g;
          bodyColors[cIdx * 3 + 2] = finalColor.b;

          vIdx++;
          uvIdx++;
          cIdx++;
        }
      }
      bodyGeometry.attributes.position.needsUpdate = true;
      bodyGeometry.attributes.normal.needsUpdate = true;
      bodyGeometry.computeVertexNormals();

      // (B) Caudal Tail Fin Update (Silky & Organic trailing wave)
      const tailBase = spineTransforms[SPINE_COUNT - 1];
      const TAIL_LENGTH = 2.4;
      let tIdx = 0;

      for (let r = 0; r < TAIL_ROWS; r++) {
        const u = r / (TAIL_ROWS - 1); // 0 (root) to 1 (tail tip)
        const waveDelay = cycle - 4.2 - u * 3.2;
        const waveAmp = (0.05 + u * 0.85);
        const lateralWiggle = Math.sin(waveDelay) * waveAmp;

        // Double-lobe flare profile
        const flare = 0.12 + Math.sin(u * Math.PI * 0.55) * 1.45;

        for (let c = 0; c < TAIL_COLS; c++) {
          const v = (c / (TAIL_COLS - 1)) * 2 - 1; // -1 (bottom) to +1 (top)

          // 2-lobe notch in the middle of tail trailing edge
          const lobeNotch = u > 0.5 ? 1 - Math.exp(-Math.pow(v * 2.5, 2)) * 0.35 : 1;
          const spanY = v * flare * lobeNotch;

          // Compute exact world coordinate without Euler glitch
          const px = tailBase.pos.x - tailBase.dir.x * (u * TAIL_LENGTH) + tailBase.side.x * lateralWiggle + tailBase.up.x * spanY;
          const py = tailBase.pos.y - tailBase.dir.y * (u * TAIL_LENGTH) + tailBase.side.y * lateralWiggle + tailBase.up.y * spanY;
          const pz = tailBase.pos.z - tailBase.dir.z * (u * TAIL_LENGTH) + tailBase.side.z * lateralWiggle + tailBase.up.z * spanY;

          tailPositions[tIdx * 3] = px;
          tailPositions[tIdx * 3 + 1] = py;
          tailPositions[tIdx * 3 + 2] = pz;

          // Color gradient from warm orange base to luminous amber edge
          const cCol = goldColor.clone().lerp(finEdgeColor, u * 0.85);
          tailColors[tIdx * 3] = cCol.r;
          tailColors[tIdx * 3 + 1] = cCol.g;
          tailColors[tIdx * 3 + 2] = cCol.b;

          tailUVs[tIdx * 2] = u;
          tailUVs[tIdx * 2 + 1] = (v + 1) * 0.5;

          tIdx++;
        }
      }
      tailGeometry.attributes.position.needsUpdate = true;
      tailGeometry.computeVertexNormals();

      // (C) Pectoral Fins Update (Attached to Node 4 with Natural Flap)
      const pecFrame = spineTransforms[4];
      const flapAngle = Math.sin(cycle * 1.25) * 0.26;
      const FIN_LENGTH = 1.45;
      const FIN_WIDTH = 0.75;

      const updatePectoralFin = (geo: THREE.BufferGeometry, isLeft: boolean) => {
        const pArr = geo.attributes.position.array as Float32Array;
        const cArr = geo.attributes.color.array as Float32Array;
        const sideSign = isLeft ? 1 : -1;
        const rootPos = pecFrame.pos.clone().addScaledVector(pecFrame.side, sideSign * (spineProfiles[4].radiusX - 0.04)).addScaledVector(pecFrame.up, -0.08);

        let pIndex = 0;
        for (let i = 0; i <= FIN_U_SEGS; i++) {
          const u = i / FIN_U_SEGS; // 0 (root) to 1 (tip)
          const finWave = Math.sin(cycle * 1.25 - u * 2.2) * (0.04 + u * 0.22) * sideSign;

          for (let j = 0; j <= FIN_V_SEGS; j++) {
            const v = (j / FIN_V_SEGS) * 2 - 1; // -1 to +1

            // Teardrop aerodynamic fin blade shape
            const widthProfile = Math.sin(u * Math.PI) * (1 - u * 0.3) * FIN_WIDTH;
            const yOffset = v * widthProfile;

            // Outward + Backward direction vector
            const outward = sideSign * (0.85 + flapAngle * sideSign);
            const backward = 0.55 + u * 0.35;
            const downward = -0.25 + flapAngle * 0.4;

            const px = rootPos.x + pecFrame.side.x * (outward * u * FIN_LENGTH) - pecFrame.dir.x * (backward * u * FIN_LENGTH) + pecFrame.up.x * (downward * u * FIN_LENGTH + yOffset) + pecFrame.up.x * finWave;
            const py = rootPos.y + pecFrame.side.y * (outward * u * FIN_LENGTH) - pecFrame.dir.y * (backward * u * FIN_LENGTH) + pecFrame.up.y * (downward * u * FIN_LENGTH + yOffset) + pecFrame.up.y * finWave;
            const pz = rootPos.z + pecFrame.side.z * (outward * u * FIN_LENGTH) - pecFrame.dir.z * (backward * u * FIN_LENGTH) + pecFrame.up.z * (downward * u * FIN_LENGTH + yOffset) + pecFrame.up.z * finWave;

            pArr[pIndex * 3] = px;
            pArr[pIndex * 3 + 1] = py;
            pArr[pIndex * 3 + 2] = pz;

            const cCol = goldColor.clone().lerp(finEdgeColor, u * 0.7);
            cArr[pIndex * 3] = cCol.r;
            cArr[pIndex * 3 + 1] = cCol.g;
            cArr[pIndex * 3 + 2] = cCol.b;

            pIndex++;
          }
        }
        geo.attributes.position.needsUpdate = true;
        geo.computeVertexNormals();
      };

      updatePectoralFin(leftFinGeometry, true);
      updatePectoralFin(rightFinGeometry, false);

      // (D) Dorsal Fin Update (Sleek Spine Sail)
      let dIdx = 0;
      for (let i = 0; i < DORSAL_NODES; i++) {
        const spineIdx = DORSAL_START + i;
        const frame = spineTransforms[spineIdx];
        const radY = spineProfiles[spineIdx].radiusY;

        const u = i / (DORSAL_NODES - 1);
        const finHeight = Math.sin(u * Math.PI) * 0.65;
        const lateralRipple = Math.sin(cycle - spineIdx * 0.35) * 0.08;

        // Base vertex on spine
        const bX = frame.pos.x + frame.up.x * radY;
        const bY = frame.pos.y + frame.up.y * radY;
        const bZ = frame.pos.z + frame.up.z * radY;

        // Tip vertex raised along +up with wave
        const tX = frame.pos.x + frame.up.x * (radY + finHeight) + frame.side.x * lateralRipple;
        const tY = frame.pos.y + frame.up.y * (radY + finHeight) + frame.side.y * lateralRipple;
        const tZ = frame.pos.z + frame.up.z * (radY + finHeight) + frame.side.z * lateralRipple;

        dorsalPositions[dIdx * 6] = bX;
        dorsalPositions[dIdx * 6 + 1] = bY;
        dorsalPositions[dIdx * 6 + 2] = bZ;

        dorsalPositions[dIdx * 6 + 3] = tX;
        dorsalPositions[dIdx * 6 + 4] = tY;
        dorsalPositions[dIdx * 6 + 5] = tZ;

        // Color
        dorsalColors[dIdx * 6] = goldColor.r;
        dorsalColors[dIdx * 6 + 1] = goldColor.g;
        dorsalColors[dIdx * 6 + 2] = goldColor.b;

        dorsalColors[dIdx * 6 + 3] = finEdgeColor.r;
        dorsalColors[dIdx * 6 + 4] = finEdgeColor.g;
        dorsalColors[dIdx * 6 + 5] = finEdgeColor.b;

        dIdx++;
      }
      dorsalGeometry.attributes.position.needsUpdate = true;
      dorsalGeometry.computeVertexNormals();
    };

    // --- 11. Main Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Check if mouse stopped moving -> Natural wandering mode
      if (performance.now() - lastMouseMoveTime > 2500) {
        mouse.isMoving = false;
        mouse.targetX = Math.sin(time * 0.45) * 5.2;
        mouse.targetY = Math.cos(time * 0.35) * 2.8 + Math.sin(time * 0.7) * 0.6;
      }

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const toTargetX = mouse.x - fishPos.x;
      const toTargetY = mouse.y - fishPos.y;
      const distToTarget = Math.hypot(toTargetX, toTargetY);

      let desiredHeading = Math.atan2(toTargetY, toTargetX);
      let angleDiff = desiredHeading - fishHeading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const turnSpeed = 2.6;
      fishHeading += angleDiff * Math.min(1.0, delta * turnSpeed);
      fishRoll = THREE.MathUtils.lerp(fishRoll, -angleDiff * 1.3, 0.08);

      const targetPitch = Math.sin(time * 0.8) * 0.12 + (toTargetY > 0 ? 0.15 : -0.15) * Math.min(1, Math.abs(toTargetY));
      fishPitch = THREE.MathUtils.lerp(fishPitch, targetPitch, 0.06);

      const baseSpeed = mouse.isMoving ? 2.4 : 1.6;
      swimSpeed = THREE.MathUtils.lerp(swimSpeed, baseSpeed + Math.min(1.5, distToTarget * 0.3), 0.05);
      swimCycle += delta * swimSpeed * 3.8;

      const forwardX = Math.cos(fishHeading) * Math.cos(fishPitch);
      const forwardY = Math.sin(fishHeading) * Math.cos(fishPitch);
      const forwardZ = Math.sin(fishPitch) * 0.5;

      fishVelocity.set(forwardX, forwardY, forwardZ).multiplyScalar(swimSpeed * delta * 1.5);
      fishPos.add(fishVelocity);

      if (Math.abs(fishPos.x) > 8.0) fishPos.x *= 0.98;
      if (Math.abs(fishPos.y) > 4.5) fishPos.y *= 0.98;
      fishPos.z = Math.sin(time * 0.6) * 0.8;

      koiGlowLight.position.set(fishPos.x, fishPos.y, fishPos.z + 1.2);

      // Spine Propagation
      const spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[] = [];
      spineNodes[0].copy(fishPos);

      const segmentDist = FISH_LENGTH / (SPINE_COUNT - 1);

      for (let i = 1; i < SPINE_COUNT; i++) {
        const prev = spineNodes[i - 1];
        const curr = spineNodes[i];

        const u = i / (SPINE_COUNT - 1);
        const waveAmp = Math.pow(u, 1.4) * 0.38;
        const wavePhase = swimCycle - u * 4.2;
        const lateralOffset = Math.sin(wavePhase) * waveAmp;

        const dir = new THREE.Vector3().subVectors(curr, prev);
        if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1);
        dir.normalize();

        curr.copy(prev).addScaledVector(dir, segmentDist);

        const sideVec = new THREE.Vector3(-Math.sin(fishHeading), Math.cos(fishHeading), 0);
        curr.addScaledVector(sideVec, lateralOffset * delta * 12);
      }

      for (let i = 0; i < SPINE_COUNT; i++) {
        const pos = spineNodes[i];
        let dir: THREE.Vector3;

        if (i === 0) {
          dir = new THREE.Vector3().subVectors(spineNodes[0], spineNodes[1]).normalize();
        } else if (i === SPINE_COUNT - 1) {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i]).normalize();
        } else {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i + 1]).normalize();
        }

        const up = new THREE.Vector3(0, 0, 1);
        const side = new THREE.Vector3().crossVectors(dir, up).normalize();
        up.crossVectors(side, dir).normalize();

        side.applyAxisAngle(dir, fishRoll * (1 - (i / SPINE_COUNT) * 0.5));
        up.crossVectors(side, dir).normalize();

        spineTransforms.push({ pos, dir, up, side });
      }

      // Update Body and All Attached Fins
      updateAllGeometries(spineTransforms, swimCycle);

      // Ambient Particles Drift
      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pArr[i * 3 + 1] += particleSpeeds[i] * delta;
        if (pArr[i * 3 + 1] > 6) pArr[i * 3 + 1] = -6;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Water Ripples
      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const r = ripples[i];
        if (r.active) {
          r.scale += delta * 2.2;
          r.opacity -= delta * 0.85;
          r.mesh.scale.set(r.scale, r.scale, 1);
          (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, r.opacity);
          if (r.opacity <= 0) {
            r.active = false;
            r.mesh.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();

      bodyGeometry.dispose();
      bodyMaterial.dispose();
      tailGeometry.dispose();
      leftFinGeometry.dispose();
      rightFinGeometry.dispose();
      dorsalGeometry.dispose();
      finMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rippleGeo.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
