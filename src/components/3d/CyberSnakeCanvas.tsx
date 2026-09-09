"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberSnakeCanvasProps {
  className?: string;
}

interface FoodOrb {
  mesh: THREE.Group;
  pos: THREE.Vector3;
  birthTime: number;
  id: number;
}

export default function CyberSnakeCanvas({ className = "" }: CyberSnakeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isVisible = true;

    // --- 1. Scene & High-Performance Camera Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 14.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- 2. Adaptive Theme Detection (Light vs Dark Mode) ---
    let isDarkMode = document.documentElement.classList.contains("dark");

    // --- 3. Dynamic Studio Lighting Setup ---
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x111927 : 0xffffff,
      isDarkMode ? 1.8 : 3.0
    );
    scene.add(ambientLight);

    // Main Key Light (Cast sharp specular reflections on cyber plates)
    const keyLight = new THREE.DirectionalLight(
      isDarkMode ? 0xff8c38 : 0xfff5ea,
      isDarkMode ? 3.2 : 3.6
    );
    keyLight.position.set(7, 12, 10);
    scene.add(keyLight);

    // Rim Fill Light (Cyber Cyan back-rim)
    const rimLight = new THREE.DirectionalLight(
      isDarkMode ? 0x00e5ff : 0x0284c7,
      isDarkMode ? 2.8 : 2.2
    );
    rimLight.position.set(-8, -6, 6);
    scene.add(rimLight);

    // Soft Front Fill Light for studio clarity
    const fillLight = new THREE.DirectionalLight(
      isDarkMode ? 0x1e293b : 0xf8fafc,
      isDarkMode ? 1.2 : 2.0
    );
    fillLight.position.set(0, -5, 8);
    scene.add(fillLight);

    // Head Follower Point Light (Pulsing cyber core)
    const headGlowLight = new THREE.PointLight(
      0xf05a28,
      isDarkMode ? 2.5 : 1.2,
      12
    );
    scene.add(headGlowLight);

    // --- 4. Cyber Dragon / Viper Anatomy ---
    const MAX_SEGMENTS = 136;
    const INITIAL_SEGMENTS = 54;
    const SEGMENTS_PER_FOOD = 6;
    const RADIAL_SEGMENTS = 16;
    const SEGMENT_DIST = 0.122;

    let currentSegments = INITIAL_SEGMENTS;
    let targetSegments = INITIAL_SEGMENTS;

    // Sleek, futuristic robotic serpent profile
    const getSegmentProfile = (
      i: number,
      total: number
    ): {
      radiusX: number;
      radiusY: number;
      crestHeight: number;
      collarFactor: number;
    } => {
      const u = i / (total - 1);
      let rx = 0.082;
      let ry = 0.062;
      let crest = 0.022;

      const headSegs = Math.min(5, Math.floor(total * 0.075));
      const neckSegs = Math.min(10, Math.floor(total * 0.15));
      const tailStartU = 0.58;

      if (i <= headSegs) {
        // Sculpted Mecha Viper Head: Sharp snout -> flared angular brow -> sleek collar
        if (i === 0) {
          // Snout tip
          rx = 0.038;
          ry = 0.028;
          crest = 0.01;
        } else if (i === 1) {
          // Forehead
          rx = 0.105;
          ry = 0.048;
          crest = 0.02;
        } else if (i === 2) {
          // Flared predator temples & cyber visor brow
          rx = 0.152;
          ry = 0.072;
          crest = 0.032;
        } else if (i === 3) {
          // Head crown
          rx = 0.138;
          ry = 0.068;
          crest = 0.028;
        } else {
          // Occipital collar
          rx = 0.112;
          ry = 0.062;
          crest = 0.022;
        }
      } else if (i <= neckSegs) {
        // Slender, high-mobility cyber neck
        const t = (i - headSegs) / (neckSegs - headSegs);
        rx = 0.102 - t * 0.026;
        ry = 0.058 - t * 0.01;
        crest = 0.018;
      } else if (u < tailStartU) {
        // Muscular, aerodynamic torso with dynamic serpentine curve
        const t = (u - neckSegs / total) / (tailStartU - neckSegs / total);
        rx = 0.078 + Math.sin(t * Math.PI) * 0.016;
        ry = 0.052 + Math.sin(t * Math.PI) * 0.012;
        crest = 0.024;
      } else {
        // Ultra-slender, whip-like cyber needle tail
        const t = (u - tailStartU) / (1.0 - tailStartU);
        const taper = Math.pow(1.0 - t, 1.45);
        rx = Math.max(0.004, 0.078 * taper);
        ry = Math.max(0.003, 0.052 * taper);
        crest = 0.02 * taper;
      }

      // Articulated robotic exoskeleton collar: creates crisp mechanical plate seams
      const isCollar = i % 2 === 0;
      const collarFactor = isCollar ? 1.07 : 0.96;

      return {
        radiusX: rx * collarFactor,
        radiusY: ry * collarFactor,
        crestHeight: crest,
        collarFactor,
      };
    };

    // --- 5. Snake Body Mesh & Shading Buffers ---
    const bodyVertexCount = MAX_SEGMENTS * RADIAL_SEGMENTS;
    const bodyPositions = new Float32Array(bodyVertexCount * 3);
    const bodyNormals = new Float32Array(bodyVertexCount * 3);
    const bodyColors = new Float32Array(bodyVertexCount * 3);
    const bodyUVs = new Float32Array(bodyVertexCount * 2);

    const bodyIndices: number[] = [];
    for (let i = 0; i < MAX_SEGMENTS - 1; i++) {
      for (let j = 0; j < RADIAL_SEGMENTS; j++) {
        const nextJ = (j + 1) % RADIAL_SEGMENTS;
        const p1 = i * RADIAL_SEGMENTS + j;
        const p2 = (i + 1) * RADIAL_SEGMENTS + j;
        const p3 = (i + 1) * RADIAL_SEGMENTS + nextJ;
        const p4 = i * RADIAL_SEGMENTS + nextJ;

        // Correct outward-facing triangle winding order
        bodyIndices.push(p1, p4, p2);
        bodyIndices.push(p4, p3, p2);
      }
    }

    const bodyGeometry = new THREE.BufferGeometry();
    bodyGeometry.setAttribute("position", new THREE.BufferAttribute(bodyPositions, 3));
    bodyGeometry.setAttribute("normal", new THREE.BufferAttribute(bodyNormals, 3));
    bodyGeometry.setAttribute("color", new THREE.BufferAttribute(bodyColors, 3));
    bodyGeometry.setAttribute("uv", new THREE.BufferAttribute(bodyUVs, 2));
    bodyGeometry.setIndex(bodyIndices);
    bodyGeometry.setDrawRange(0, (INITIAL_SEGMENTS - 1) * RADIAL_SEGMENTS * 6);

    // High-end PBR material: Liquid Chrome / Titanium in Light, Stealth Obsidian in Dark
    const bodyMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: isDarkMode ? 0.22 : 0.2,
      metalness: isDarkMode ? 0.88 : 0.9,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(isDarkMode ? 0x160500 : 0x080200),
      emissiveIntensity: isDarkMode ? 0.2 : 0.05,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(bodyMesh);

    // --- 6. Cyber Visor Optics (Twin Glowing Predator Eyes) ---
    const eyeGeo = new THREE.BoxGeometry(0.042, 0.02, 0.075);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: isDarkMode ? 4.0 : 2.5,
      roughness: 0.08,
      metalness: 0.95,
    });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
    scene.add(leftEye);
    scene.add(rightEye);

    // --- 7. Plasma Double Flick Tongue ---
    const tongueGeo = new THREE.BufferGeometry();
    const tonguePositions = new Float32Array(18 * 3);
    tongueGeo.setAttribute("position", new THREE.BufferAttribute(tonguePositions, 3));

    const tongueMat = new THREE.MeshBasicMaterial({
      color: 0xf05a28,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    scene.add(tongueMesh);

    // --- 8. Floating Micro Energy Dust (Particle Trail) ---
    const TRAIL_PARTICLES = 40;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(TRAIL_PARTICLES * 3);
    const trailColors = new Float32Array(TRAIL_PARTICLES * 3);
    const trailLifes = new Float32Array(TRAIL_PARTICLES);
    const trailSizes = new Float32Array(TRAIL_PARTICLES);

    for (let i = 0; i < TRAIL_PARTICLES; i++) {
      trailPositions[i * 3 + 2] = -100;
      trailLifes[i] = 0;
    }
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const trailSystem = new THREE.Points(trailGeo, trailMat);
    scene.add(trailSystem);

    let trailSpawnTimer = 0;
    let nextTrailIdx = 0;
    const spawnTrailSpark = (pos: THREE.Vector3, isCyan: boolean) => {
      const idx = nextTrailIdx;
      nextTrailIdx = (nextTrailIdx + 1) % TRAIL_PARTICLES;

      trailPositions[idx * 3] = pos.x + (Math.random() - 0.5) * 0.08;
      trailPositions[idx * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.08;
      trailPositions[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.06;

      const c = isCyan ? new THREE.Color(0x00f0ff) : new THREE.Color(0xf05a28);
      trailColors[idx * 3] = c.r;
      trailColors[idx * 3 + 1] = c.g;
      trailColors[idx * 3 + 2] = c.b;

      trailLifes[idx] = 1.0;
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
    };

    // --- 9. Interactive Food Target Orbs ---
    const foods: FoodOrb[] = [];
    const foodGroup = new THREE.Group();
    scene.add(foodGroup);

    const foodCoreGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const foodCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 3.2,
      roughness: 0.1,
    });

    const foodRingGeo = new THREE.TorusGeometry(0.18, 0.016, 8, 24);
    const foodRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
    });

    const MAX_FOODS = 6;
    let foodIdCounter = 0;
    const spawnFood = (x: number, y: number) => {
      while (foods.length >= MAX_FOODS) {
        const oldest = foods.shift();
        if (oldest) foodGroup.remove(oldest.mesh);
      }

      targetSegments = Math.min(MAX_SEGMENTS, targetSegments + SEGMENTS_PER_FOOD);

      const fGroup = new THREE.Group();
      const core = new THREE.Mesh(foodCoreGeo, foodCoreMat.clone());
      fGroup.add(core);

      const ring = new THREE.Mesh(foodRingGeo, foodRingMat.clone());
      fGroup.add(ring);

      const light = new THREE.PointLight(0x00ff88, 2.0, 4);
      fGroup.add(light);

      fGroup.position.set(x, y, 0);
      foodGroup.add(fGroup);

      foods.push({
        mesh: fGroup,
        pos: new THREE.Vector3(x, y, 0),
        birthTime: performance.now(),
        id: ++foodIdCounter,
      });
    };

    // --- 10. Digital Shockwave Ripples ---
    const RIPPLE_COUNT = 8;
    const ripples: { mesh: THREE.Mesh; scale: number; opacity: number; active: boolean }[] = [];
    const rippleGroup = new THREE.Group();
    scene.add(rippleGroup);

    const rippleGeo = new THREE.RingGeometry(0.1, 0.16, 36);
    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const rippleMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rMesh.position.z = -0.4;
      rMesh.visible = false;
      rippleGroup.add(rMesh);
      ripples.push({ mesh: rMesh, scale: 1, opacity: 0, active: false });
    }

    let nextRippleIdx = 0;
    const spawnRipple = (x: number, y: number, color = 0x00ff88) => {
      const r = ripples[nextRippleIdx];
      r.mesh.position.set(x, y, -0.4);
      r.scale = 0.2;
      r.opacity = 1.0;
      r.active = true;
      r.mesh.visible = true;
      (r.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      nextRippleIdx = (nextRippleIdx + 1) % RIPPLE_COUNT;
    };

    // Apply Theme Changes dynamically
    const applyTheme = () => {
      ambientLight.color.setHex(isDarkMode ? 0x111927 : 0xffffff);
      ambientLight.intensity = isDarkMode ? 1.8 : 3.0;

      keyLight.color.setHex(isDarkMode ? 0xff8c38 : 0xfff5ea);
      keyLight.intensity = isDarkMode ? 3.2 : 3.6;

      rimLight.color.setHex(isDarkMode ? 0x00e5ff : 0x0284c7);
      rimLight.intensity = isDarkMode ? 2.8 : 2.2;

      fillLight.color.setHex(isDarkMode ? 0x1e293b : 0xf8fafc);
      fillLight.intensity = isDarkMode ? 1.2 : 2.0;

      headGlowLight.intensity = isDarkMode ? 2.5 : 1.2;

      bodyMaterial.roughness = isDarkMode ? 0.22 : 0.18;
      bodyMaterial.metalness = isDarkMode ? 0.88 : 0.92;
      bodyMaterial.emissive.setHex(isDarkMode ? 0x160500 : 0x080200);
      bodyMaterial.emissiveIntensity = isDarkMode ? 0.2 : 0.05;

      eyeMat.emissiveIntensity = isDarkMode ? 4.0 : 2.5;
      renderer.toneMappingExposure = isDarkMode ? 1.35 : 1.2;
    };

    const themeObserver = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains("dark");
      if (nextDark !== isDarkMode) {
        isDarkMode = nextDark;
        applyTheme();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Immediately synchronize theme properties on mount
    applyTheme();

    // --- 11. Kinematic Spine Coordinates ---
    const mouse = { targetX: 0, targetY: 0, isMoving: false };
    const headPos = new THREE.Vector3(0, 0, 0);
    let headHeading = Math.PI * 0.5;
    let slitherCycle = 0;
    let slitherSpeed = 2.4;
    let eatSurgeTimer = 0;

    const spineNodes: THREE.Vector3[] = [];
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      spineNodes.push(new THREE.Vector3(0, -i * SEGMENT_DIST, 0));
    }

    const MAX_SNAKE_LEN = (MAX_SEGMENTS - 1) * SEGMENT_DIST;
    const pathHistory: THREE.Vector3[] = [];
    for (let d = 0; d <= MAX_SNAKE_LEN + 6.0; d += 0.02) {
      pathHistory.push(new THREE.Vector3(0, -d, 0));
    }

    const get3DWorldPos = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      const vector = new THREE.Vector3(nx, ny, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));
      return { x: worldPos.x, y: worldPos.y };
    };

    let lastMouseMoveTime = performance.now();
    const handleMouseMove = (e: MouseEvent) => {
      const worldPos = get3DWorldPos(e.clientX, e.clientY);
      mouse.targetX = worldPos.x;
      mouse.targetY = worldPos.y;
      mouse.isMoving = true;
      lastMouseMoveTime = performance.now();
    };

    const handleClick = (e: MouseEvent) => {
      const worldPos = get3DWorldPos(e.clientX, e.clientY);
      spawnFood(worldPos.x, worldPos.y);
      spawnRipple(worldPos.x, worldPos.y, 0x00ff88);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const worldPos = get3DWorldPos(touch.clientX, touch.clientY);
        mouse.targetX = worldPos.x;
        mouse.targetY = worldPos.y;
        mouse.isMoving = true;
        lastMouseMoveTime = performance.now();
        spawnFood(worldPos.x, worldPos.y);
        spawnRipple(worldPos.x, worldPos.y, 0x00ff88);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const worldPos = get3DWorldPos(touch.clientX, touch.clientY);
        mouse.targetX = worldPos.x;
        mouse.targetY = worldPos.y;
        mouse.isMoving = true;
        lastMouseMoveTime = performance.now();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

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

    // --- 12. Dynamic Geometry & Shading Generation ---
    const updateSnakeGeometry = (
      spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[],
      activeSegments: number,
      cycle: number,
      surge: number,
      time: number
    ) => {
      // High-End Color Palettes
      // 1. DARK MODE: Stealth Obsidian Armor + Glowing Brand Coral & Amber Conduits
      const darkPlatePrimary = new THREE.Color(0x0c121e);
      const darkPlateSecondary = new THREE.Color(0x162033);
      const darkSpineFlame = new THREE.Color(0xf05a28); // Brand Coral
      const darkAmberEnergy = new THREE.Color(0xf59e0b); // Brand Solar Gold
      const darkCyanNode = new THREE.Color(0x00f5ff); // Cyan Hex
      const darkUnderbelly = new THREE.Color(0x1a2336);

      // 2. LIGHT MODE: Polished Liquid Chrome / White Titanium Armor + Radiant Coral & Azure Conduits
      // (Looks like high-tech ceramic robot - NEVER a dark worm or red muddy crayon!)
      const lightPlatePrimary = new THREE.Color(0xe2e8f0); // Polished Pearl Titanium
      const lightPlateSecondary = new THREE.Color(0xf1f5f9); // Lustrous White Chrome
      const lightPlateBevel = new THREE.Color(0x94a3b8); // Slate Armor Edge
      const lightSpineFlame = new THREE.Color(0xf05a28); // Electric Brand Coral Conduit
      const lightAmberEnergy = new THREE.Color(0xf59e0b); // Solar Amber Line
      const lightCyanNode = new THREE.Color(0x0284c7); // Vivid Cyan Data Node
      const lightUnderbelly = new THREE.Color(0xcbd5e1); // Brushed Steel Belly

      const surgeColor = new THREE.Color(0x00ff88);

      let vIdx = 0;
      let uvIdx = 0;
      let cIdx = 0;

      for (let i = 0; i < activeSegments; i++) {
        const u = i / (activeSegments - 1);
        const { pos, up, side } = spineTransforms[i];
        const { radiusX, radiusY, crestHeight, collarFactor } = getSegmentProfile(i, activeSegments);

        // Food Digestion Energy Surge traveling down the spine
        let rx = radiusX;
        let ry = radiusY;
        let isBulgePoint = false;
        if (surge > 0.02) {
          const bulgeCenter = 1.0 - surge;
          const distToBulge = Math.abs(u - bulgeCenter);
          if (distToBulge < 0.08) {
            const factor = Math.cos((distToBulge / 0.08) * (Math.PI * 0.5));
            const expansion = factor * surge * 0.36;
            rx *= 1.0 + expansion;
            ry *= 1.0 + expansion * 0.78;
            isBulgePoint = true;
          }
        }

        // Fast Data Packet Pulses traveling along the spine
        const dataPulse1 = Math.sin(time * 8.0 - u * 24.0);
        const dataPulse2 = Math.sin(cycle * 3.6 - u * 16.0);
        const surgeWave = Math.sin(surge * 12.0 - u * 14.0);

        const isCollarPlate = collarFactor > 1.0;

        for (let j = 0; j < RADIAL_SEGMENTS; j++) {
          const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
          const cosT = Math.cos(theta); // lateral (+right / -left)
          const sinT = Math.sin(theta); // vertical (+dorsal spine / -belly)

          // Sculpted Aerodynamic Cross Section:
          // Top dorsal ridge is heightened for a crisp mecha dragon crest
          let currentRy = ry;
          if (sinT > 0.25) {
            const crestFactor = Math.pow(sinT, 2.4);
            currentRy += crestHeight * crestFactor;
          }

          const offsetX = side.x * cosT * rx + up.x * sinT * currentRy;
          const offsetY = side.y * cosT * rx + up.y * sinT * currentRy;
          const offsetZ = side.z * cosT * rx + up.z * sinT * currentRy;

          bodyPositions[vIdx * 3] = pos.x + offsetX;
          bodyPositions[vIdx * 3 + 1] = pos.y + offsetY;
          bodyPositions[vIdx * 3 + 2] = pos.z + offsetZ;

          const len = Math.hypot(offsetX, offsetY, offsetZ) || 1;
          bodyNormals[vIdx * 3] = offsetX / len;
          bodyNormals[vIdx * 3 + 1] = offsetY / len;
          bodyNormals[vIdx * 3 + 2] = offsetZ / len;

          bodyUVs[uvIdx * 2] = j / RADIAL_SEGMENTS;
          bodyUVs[uvIdx * 2 + 1] = u;

          // Color & Shading Mapping
          let vertColor: THREE.Color;

          if (isDarkMode) {
            // DARK MODE: Stealth Obsidian Armor with Glowing Coral & Amber circuits
            vertColor = (isCollarPlate ? darkPlateSecondary : darkPlatePrimary).clone();

            if (isBulgePoint) {
              vertColor.lerp(surgeColor, 0.9);
            } else if (sinT > 0.65) {
              // Dorsal glowing fiber conduit
              if (surge > 0.1 && surgeWave > 0.3) {
                vertColor.lerp(surgeColor, 0.95);
              } else if (dataPulse1 > 0.4) {
                vertColor.lerp(darkAmberEnergy, 0.95);
              } else if (dataPulse2 > 0.1) {
                vertColor.lerp(darkSpineFlame, 0.95);
              } else {
                vertColor.lerp(darkSpineFlame, 0.65);
              }
            } else if (Math.abs(cosT) > 0.82 && i % 3 === 0) {
              // Flank micro cyber LEDs
              vertColor.lerp(darkCyanNode, 0.85);
            } else if (sinT < -0.42) {
              // Underbelly armor plating
              vertColor.lerp(darkUnderbelly, 0.8);
            }
          } else {
            // LIGHT MODE: Liquid White Chrome / Pearl Titanium with Crisp Coral Conduits
            vertColor = (isCollarPlate ? lightPlatePrimary : lightPlateSecondary).clone();

            if (isBulgePoint) {
              vertColor.lerp(surgeColor, 0.85);
            } else if (sinT > 0.68) {
              // Dorsal luminous coral & amber optical trace
              if (dataPulse1 > 0.3) {
                vertColor.lerp(lightAmberEnergy, 0.95);
              } else if (dataPulse2 > 0.0) {
                vertColor.lerp(lightSpineFlame, 0.95);
              } else {
                vertColor.lerp(lightSpineFlame, 0.65);
              }
            } else if (Math.abs(cosT) > 0.82) {
              // Specular plate bevel highlight
              if (i % 3 === 0) {
                vertColor.lerp(lightCyanNode, 0.8);
              } else {
                vertColor.lerp(lightPlateBevel, 0.45);
              }
            } else if (sinT < -0.4) {
              // Plated brushed steel underbelly
              vertColor.lerp(lightUnderbelly, 0.7);
            }
          }

          bodyColors[cIdx * 3] = vertColor.r;
          bodyColors[cIdx * 3 + 1] = vertColor.g;
          bodyColors[cIdx * 3 + 2] = vertColor.b;

          vIdx++;
          uvIdx++;
          cIdx++;
        }
      }

      bodyGeometry.setDrawRange(0, (activeSegments - 1) * RADIAL_SEGMENTS * 6);
      bodyGeometry.attributes.position.needsUpdate = true;
      bodyGeometry.computeVertexNormals();
      bodyGeometry.attributes.color.needsUpdate = true;
      bodyGeometry.attributes.uv.needsUpdate = true;

      // Precision position Viper Eyes on Segment 2 (Widest temples of head)
      const headFrame = spineTransforms[2];
      const headProfile = getSegmentProfile(2, activeSegments);
      const eyeOffsetX = headProfile.radiusX * 0.85;
      const eyeOffsetY = headProfile.radiusY * 0.68;
      const eyeOffsetZ = 0.02;

      leftEye.position
        .copy(headFrame.pos)
        .addScaledVector(headFrame.side, eyeOffsetX)
        .addScaledVector(headFrame.up, eyeOffsetY)
        .addScaledVector(headFrame.dir, eyeOffsetZ);
      leftEye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), headFrame.dir);

      rightEye.position
        .copy(headFrame.pos)
        .addScaledVector(headFrame.side, -eyeOffsetX)
        .addScaledVector(headFrame.up, eyeOffsetY)
        .addScaledVector(headFrame.dir, eyeOffsetZ);
      rightEye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), headFrame.dir);
    };

    // --- 13. Forked Tongue Animation ---
    const updateForkedTongue = (
      snoutFrame: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 },
      tongueExtension: number,
      tongueWiggle: number
    ) => {
      if (tongueExtension <= 0.01) {
        tongueMesh.visible = false;
        return;
      }
      tongueMesh.visible = true;

      const base = snoutFrame.pos.clone().addScaledVector(snoutFrame.dir, 0.038);
      const stemLen = tongueExtension * 0.36;
      const forkLen = tongueExtension * 0.14;
      const forkSpread = tongueExtension * 0.075;
      const wWidth = 0.015;

      const stemEnd = base
        .clone()
        .addScaledVector(snoutFrame.dir, stemLen)
        .addScaledVector(snoutFrame.side, Math.sin(tongueWiggle) * 0.022)
        .addScaledVector(snoutFrame.up, Math.cos(tongueWiggle) * 0.016);

      const leftForkTip = stemEnd
        .clone()
        .addScaledVector(snoutFrame.dir, forkLen)
        .addScaledVector(snoutFrame.side, forkSpread);

      const rightForkTip = stemEnd
        .clone()
        .addScaledVector(snoutFrame.dir, forkLen)
        .addScaledVector(snoutFrame.side, -forkSpread);

      const posArr = tongueGeo.attributes.position.array as Float32Array;

      const bL = base.clone().addScaledVector(snoutFrame.side, wWidth * 0.5);
      const bR = base.clone().addScaledVector(snoutFrame.side, -wWidth * 0.5);
      const sL = stemEnd.clone().addScaledVector(snoutFrame.side, wWidth * 0.4);
      const sR = stemEnd.clone().addScaledVector(snoutFrame.side, -wWidth * 0.4);

      let idx = 0;
      const setV = (v: THREE.Vector3) => {
        posArr[idx++] = v.x;
        posArr[idx++] = v.y;
        posArr[idx++] = v.z;
      };

      setV(bL); setV(sL); setV(bR);
      setV(bR); setV(sL); setV(sR);
      setV(sL); setV(leftForkTip); setV(stemEnd);
      setV(stemEnd); setV(leftForkTip); setV(stemEnd);
      setV(sR); setV(stemEnd); setV(rightForkTip);
      setV(stemEnd); setV(rightForkTip); setV(stemEnd);

      tongueGeo.attributes.position.needsUpdate = true;
    };

    // --- 14. High-FPS Fluid Kinematics Loop ---
    let lastAnimTime = performance.now();
    let animStartTime = lastAnimTime;
    let tongueTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const now = performance.now();
      const delta = Math.min((now - lastAnimTime) * 0.001, 0.1);
      lastAnimTime = now;
      const time = (now - animStartTime) * 0.001;

      let targetX = mouse.targetX;
      let targetY = mouse.targetY;
      let isHunting = false;

      // Animate & Cleanup Food Orbs
      for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        const age = (performance.now() - food.birthTime) * 0.001;

        if (age > 20.0) {
          foodGroup.remove(food.mesh);
          foods.splice(i, 1);
          continue;
        }

        food.mesh.position.y = food.pos.y + Math.sin(age * 3.5) * 0.08;
        food.mesh.rotation.z = age * 2.0;
        food.mesh.rotation.y = age * 1.5;

        const scale = 1.0 + Math.sin(age * 6.0) * 0.12;
        food.mesh.scale.set(scale, scale, scale);
      }

      const isMobile = window.innerWidth < 768;
      const eatHitRadius = isMobile ? 0.95 : 0.82;

      if (foods.length > 0) {
        isHunting = true;
        let closestDist = Infinity;
        let targetFood = foods[0];

        for (const food of foods) {
          const d = headPos.distanceTo(food.mesh.position);
          if (d < closestDist) {
            closestDist = d;
            targetFood = food;
          }
        }

        targetX = targetFood.mesh.position.x;
        targetY = targetFood.mesh.position.y;

        if (closestDist < 1.2) {
          const pull = (1.2 - closestDist) * 0.22;
          targetFood.mesh.position.x = THREE.MathUtils.lerp(targetFood.mesh.position.x, headPos.x, pull);
          targetFood.mesh.position.y = THREE.MathUtils.lerp(targetFood.mesh.position.y, headPos.y, pull);
        }

        if (closestDist < eatHitRadius) {
          const foodIdx = foods.findIndex((f) => f.id === targetFood.id);
          if (foodIdx !== -1) {
            foodGroup.remove(targetFood.mesh);
            foods.splice(foodIdx, 1);

            spawnRipple(headPos.x, headPos.y, 0x00ff88);
            eatSurgeTimer = 1.0;
            targetSegments = Math.min(MAX_SEGMENTS, targetSegments + 4);
          }
        }
      } else {
        const timeSinceMove = performance.now() - lastMouseMoveTime;
        if (timeSinceMove > 2200) {
          // Autonomous smooth wandering: Wide perimeter orbit framing the hero content
          mouse.isMoving = false;
          const orbitT = time * 0.22;
          targetX = Math.cos(orbitT) * 5.4 + Math.sin(orbitT * 2.0) * 0.8;
          targetY = Math.sin(orbitT) * 3.1 + Math.cos(orbitT * 1.5) * 0.5;
        } else {
          // Curiosity Orbit when mouse rests near head
          const distToMouse = Math.hypot(mouse.targetX - headPos.x, mouse.targetY - headPos.y);
          if (distToMouse < 1.6 && !mouse.isMoving) {
            const orbitAngle = time * 1.35;
            targetX = mouse.targetX + Math.cos(orbitAngle) * 1.3;
            targetY = mouse.targetY + Math.sin(orbitAngle) * 1.3;
          }
        }
      }

      currentSegments = THREE.MathUtils.lerp(currentSegments, targetSegments, delta * 2.2);
      const activeSegments = Math.min(MAX_SEGMENTS, Math.max(INITIAL_SEGMENTS, Math.round(currentSegments)));

      const toTargetX = targetX - headPos.x;
      const toTargetY = targetY - headPos.y;
      const distToTarget = Math.hypot(toTargetX, toTargetY);

      let desiredHeading = Math.atan2(toTargetY, toTargetX);

      // Self-collision avoidance
      let avoidanceSteer = 0;
      const headForwardX = Math.cos(headHeading);
      const headForwardY = Math.sin(headHeading);
      const headSideX = -Math.sin(headHeading);
      const headSideY = Math.cos(headHeading);

      for (let i = 8; i < activeSegments; i++) {
        const bodyNode = spineNodes[i];
        const dx = bodyNode.x - headPos.x;
        const dy = bodyNode.y - headPos.y;
        const dist = Math.hypot(dx, dy);

        const dotForward = dx * headForwardX + dy * headForwardY;
        const dotSide = dx * headSideX + dy * headSideY;

        const lookaheadDist = 2.2;
        const bodySafeWidth = 0.95;
        if (dotForward > 0.15 && dotForward < lookaheadDist && Math.abs(dotSide) < bodySafeWidth) {
          const steerSign = dotSide >= 0 ? -1.0 : 1.0;
          const urgency = (1.0 - dotForward / lookaheadDist) * (1.0 - Math.abs(dotSide) / bodySafeWidth);
          avoidanceSteer += steerSign * urgency * 7.5;
        }

        const proximityDist = 0.85;
        if (dist < proximityDist && dist > 0.001) {
          const steerSign = dotSide >= 0 ? -1.0 : 1.0;
          const repulse = Math.pow(1.0 - dist / proximityDist, 2);
          avoidanceSteer += steerSign * repulse * 5.5;

          const hardRadius = 0.28;
          if (dist < hardRadius) {
            const push = (hardRadius - dist) * 0.6;
            headPos.x -= (dx / dist) * push;
            headPos.y -= (dy / dist) * push;
          }
        }
      }

      if (Math.abs(avoidanceSteer) > 0.05) {
        const maxAvoidTurn = Math.PI * 0.75;
        const avoidAngle = THREE.MathUtils.clamp(avoidanceSteer * 0.45, -maxAvoidTurn, maxAvoidTurn);
        desiredHeading += avoidAngle;
      }

      let angleDiff = desiredHeading - headHeading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      let maxTurnRate: number;
      let turnFactor: number;
      if (Math.abs(avoidanceSteer) > 0.1) {
        maxTurnRate = 12.0;
        turnFactor = 10.0;
      } else if (isHunting) {
        maxTurnRate = distToTarget < 1.5 ? 14.0 : 8.5;
        turnFactor = distToTarget < 1.5 ? 12.0 : 7.0;
      } else if (mouse.isMoving) {
        maxTurnRate = 7.2;
        turnFactor = 5.5;
      } else {
        maxTurnRate = 3.8;
        turnFactor = 3.2;
      }

      const turnStep = THREE.MathUtils.clamp(
        angleDiff * turnFactor * delta,
        -maxTurnRate * delta,
        maxTurnRate * delta
      );
      headHeading += turnStep;

      let targetSpeed: number;
      if (isHunting) {
        targetSpeed = Math.max(3.2, Math.min(6.5, distToTarget * 2.5 + 2.4));
      } else if (mouse.isMoving) {
        targetSpeed = Math.min(6.0, 2.2 + distToTarget * 1.2);
      } else {
        targetSpeed = 2.4 + Math.sin(time * 0.5) * 0.4;
      }

      slitherSpeed = THREE.MathUtils.lerp(slitherSpeed, targetSpeed, 0.12);
      slitherCycle += delta * slitherSpeed * 3.6;

      if (eatSurgeTimer > 0) {
        eatSurgeTimer -= delta * 0.75;
      }

      const waveDamp = isHunting
        ? (distToTarget < 1.6 ? Math.max(0.12, (distToTarget - 0.4) / 1.2) : 1.0)
        : 1.0;

      const headSway = Math.sin(slitherCycle) * 0.22 * waveDamp;
      const currentHeadHeading = headHeading + headSway;

      const stepDist = slitherSpeed * delta;
      headPos.x += Math.cos(currentHeadHeading) * stepDist;
      headPos.y += Math.sin(currentHeadHeading) * stepDist;
      headPos.z = Math.sin(time * 0.7) * 0.18;

      headGlowLight.position.set(headPos.x, headPos.y, headPos.z + 1.2);

      // Micro Particle Trail Generator
      trailSpawnTimer += delta;
      if (trailSpawnTimer > 0.04) {
        trailSpawnTimer = 0;
        spawnTrailSpark(headPos, Math.random() > 0.4);
      }

      // Path History Tracking
      const distFromLatest = headPos.distanceTo(pathHistory[0]);
      if (distFromLatest >= 0.018) {
        pathHistory.unshift(headPos.clone());

        const maxNeededDist = (activeSegments - 1) * SEGMENT_DIST + 4.0;
        let accum = 0;
        let pruneIdx = pathHistory.length;
        for (let k = 0; k < pathHistory.length - 1; k++) {
          accum += pathHistory[k].distanceTo(pathHistory[k + 1]);
          if (accum > maxNeededDist) {
            pruneIdx = k + 2;
            break;
          }
        }
        if (pruneIdx < pathHistory.length) {
          pathHistory.length = pruneIdx;
        }
      } else {
        pathHistory[0].copy(headPos);
      }

      spineNodes[0].copy(headPos);

      let pathIdx = 0;
      let accumDist = 0;

      for (let i = 1; i < activeSegments; i++) {
        const targetDist = i * SEGMENT_DIST;

        while (pathIdx < pathHistory.length - 1) {
          const pA = pathHistory[pathIdx];
          const pB = pathHistory[pathIdx + 1];
          const segLen = pA.distanceTo(pB);

          if (accumDist + segLen >= targetDist) {
            const alpha = segLen > 0.00001 ? (targetDist - accumDist) / segLen : 0;
            spineNodes[i].lerpVectors(pA, pB, alpha);
            break;
          }

          accumDist += segLen;
          pathIdx++;
        }

        if (pathIdx >= pathHistory.length - 1) {
          const last = pathHistory[pathHistory.length - 1];
          const prevLast = pathHistory[pathHistory.length - 2] || last;
          const extDir = new THREE.Vector3().subVectors(last, prevLast).normalize();
          const rem = targetDist - accumDist;
          spineNodes[i].copy(last).addScaledVector(extDir, rem);
        }
      }

      for (let i = activeSegments; i < MAX_SEGMENTS; i++) {
        spineNodes[i].copy(spineNodes[activeSegments - 1]);
      }

      const spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[] = [];

      for (let i = 0; i < activeSegments; i++) {
        const pos = spineNodes[i];
        let dir: THREE.Vector3;

        if (i === 0) {
          dir = new THREE.Vector3().subVectors(spineNodes[0], spineNodes[1]).normalize();
        } else if (i === activeSegments - 1) {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i]).normalize();
        } else {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i + 1]).normalize();
        }

        const up = new THREE.Vector3(0, 0, 1);
        const side = new THREE.Vector3().crossVectors(dir, up).normalize();
        up.crossVectors(side, dir).normalize();

        spineTransforms.push({ pos, dir, up, side });
      }

      updateSnakeGeometry(spineTransforms, activeSegments, slitherCycle, eatSurgeTimer, time);

      // Forked Tongue Logic
      tongueTimer += delta * (isHunting ? 4.2 : 1.8);
      const flickCycle = tongueTimer % 2.8;
      let tongueExtension = 0;
      let tongueWiggle = 0;

      if (flickCycle < 0.55) {
        const t = flickCycle / 0.55;
        const flickShape = Math.sin(t * Math.PI * 2.0 - Math.PI * 0.5) * 0.5 + 0.5;
        tongueExtension = Math.sin(t * Math.PI) * (0.6 + flickShape * 0.4) * (isHunting ? 1.3 : 1.0);
        tongueWiggle = time * 32.0;
      }

      const snoutFrame = {
        pos: spineTransforms[0].pos,
        dir: spineTransforms[0].dir,
        up: spineTransforms[0].up,
        side: spineTransforms[0].side,
      };
      updateForkedTongue(snoutFrame, tongueExtension, tongueWiggle);

      // Trail Particles Update
      const tPos = trailGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < TRAIL_PARTICLES; i++) {
        if (trailLifes[i] > 0) {
          trailLifes[i] -= delta * 1.8;
          tPos[i * 3 + 2] -= delta * 0.15; // float gently back

          if (trailLifes[i] <= 0) {
            tPos[i * 3 + 2] = -100;
          }
        }
      }
      trailGeo.attributes.position.needsUpdate = true;

      // Ripples Update
      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const r = ripples[i];
        if (r.active) {
          r.scale += delta * 2.8;
          r.opacity -= delta * 1.1;
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
      themeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();

      foods.forEach((f) => foodGroup.remove(f.mesh));
      foods.length = 0;

      bodyGeometry.dispose();
      bodyMaterial.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      tongueGeo.dispose();
      tongueMat.dispose();
      foodCoreGeo.dispose();
      foodCoreMat.dispose();
      foodRingGeo.dispose();
      foodRingMat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
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
