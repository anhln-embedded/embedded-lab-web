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

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff9900, 3.2);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3.0, 25);
    cyanLight.position.set(-6, -4, 6);
    scene.add(cyanLight);

    const snakeGlowLight = new THREE.PointLight(0xff6a00, 3.5, 10);
    scene.add(snakeGlowLight);

    // --- 3. Snake Anatomy: Ultra-Slender & High Segment Resolution ---
    const SEGMENTS = 72; // High resolution for silky smooth spine bending
    const RADIAL_SEGMENTS = 14;
    const SEGMENT_DIST = 0.14; // Ultra-flexible tight vertebra spacing

    interface SegmentProfile {
      radiusX: number;
      radiusY: number;
    }

    const profiles: SegmentProfile[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const u = i / (SEGMENTS - 1); // 0 (snout) to 1 (tail tip)
      let rx = 0.11;
      let ry = 0.08;

      if (u < 0.045) {
        // Sleek aerodynamic Viper Snout & Brow
        const t = u / 0.045;
        rx = 0.055 + Math.sin(t * Math.PI) * 0.09; // Snout -> Slim Viper Jaw
        ry = 0.045 + Math.sin(t * Math.PI) * 0.05;
      } else if (u < 0.09) {
        // Ultra-slender Neck constriction
        const t = (u - 0.045) / 0.045;
        rx = 0.145 - t * 0.04;
        ry = 0.095 - t * 0.02;
      } else if (u < 0.65) {
        // Long, slender, flexible muscular body
        const t = (u - 0.09) / 0.56;
        rx = 0.105 + Math.sin(t * Math.PI) * 0.02;
        ry = 0.075 + Math.sin(t * Math.PI) * 0.015;
      } else {
        // Long needle-point tapered tail
        const t = (u - 0.65) / 0.35;
        rx = 0.105 * (1 - t * 0.94);
        ry = 0.075 * (1 - t * 0.94);
      }

      profiles.push({
        radiusX: Math.max(0.007, rx),
        radiusY: Math.max(0.005, ry),
      });
    }

    // --- 4. Snake Body Mesh Buffers ---
    const bodyVertexCount = SEGMENTS * RADIAL_SEGMENTS;
    const bodyPositions = new Float32Array(bodyVertexCount * 3);
    const bodyNormals = new Float32Array(bodyVertexCount * 3);
    const bodyColors = new Float32Array(bodyVertexCount * 3);
    const bodyUVs = new Float32Array(bodyVertexCount * 2);

    const bodyIndices: number[] = [];
    for (let i = 0; i < SEGMENTS - 1; i++) {
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
    bodyGeometry.setAttribute("color", new THREE.BufferAttribute(bodyColors, 3));
    bodyGeometry.setAttribute("uv", new THREE.BufferAttribute(bodyUVs, 2));
    bodyGeometry.setIndex(bodyIndices);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.18,
      metalness: 0.85,
      emissive: new THREE.Color(0xff4400),
      emissiveIntensity: 0.5,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(bodyMesh);

    // --- 5. Glowing Cyber Eyes (Precision positioned on slender Viper Head) ---
    const eyeGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    scene.add(leftEye);
    scene.add(rightEye);

    // --- 6. Forked Snake Tongue (Lưỡi rắn chẻ đôi phát sáng) ---
    // A ribbon mesh with 6 points forming a Y-fork
    // Points: 0: mouth base, 1: mid-stem, 2: fork root, 3: left tip, 4: fork root (back), 5: right tip
    const tongueGeo = new THREE.BufferGeometry();
    const tonguePositions = new Float32Array(18 * 3); // 6 triangles for a solid 2D ribbon
    tongueGeo.setAttribute("position", new THREE.BufferAttribute(tonguePositions, 3));

    const tongueMat = new THREE.MeshBasicMaterial({
      color: 0xff0066, // Vibrant Electric Neon Crimson / Ruby
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    scene.add(tongueMesh);

    // --- 7. Interactive Food System (Mồi năng lượng khi click) ---
    const foods: FoodOrb[] = [];
    const foodGroup = new THREE.Group();
    scene.add(foodGroup);

    const foodCoreGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const foodCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });

    const foodRingGeo = new THREE.TorusGeometry(0.22, 0.02, 8, 24);
    const foodRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.85,
    });

    const MAX_FOODS = 6;
    let foodIdCounter = 0;
    const spawnFood = (x: number, y: number) => {
      // Giới hạn số lượng mồi tối đa để tránh lag và xung đột quỹ đạo
      while (foods.length >= MAX_FOODS) {
        const oldest = foods.shift();
        if (oldest) {
          foodGroup.remove(oldest.mesh);
        }
      }

      const fGroup = new THREE.Group();

      const core = new THREE.Mesh(foodCoreGeo, foodCoreMat.clone());
      fGroup.add(core);

      const ring = new THREE.Mesh(foodRingGeo, foodRingMat.clone());
      fGroup.add(ring);

      const light = new THREE.PointLight(0x00ff88, 2.5, 4);
      fGroup.add(light);

      fGroup.position.set(x, y, 0);
      foodGroup.add(fGroup);

      const newFood: FoodOrb = {
        mesh: fGroup,
        pos: new THREE.Vector3(x, y, 0),
        birthTime: performance.now(),
        id: ++foodIdCounter,
      };

      foods.push(newFood);
    };

    // --- 8. Particle Bursts (Sparks & Eating Burst) ---
    const BURST_PARTICLES = 60;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(BURST_PARTICLES * 3);
    const burstVelocities = new Float32Array(BURST_PARTICLES * 3);
    const burstLifes = new Float32Array(BURST_PARTICLES);
    const burstColors = new Float32Array(BURST_PARTICLES * 3);

    for (let i = 0; i < BURST_PARTICLES; i++) {
      burstPositions[i * 3 + 2] = -100;
      burstLifes[i] = 0;
    }
    burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute("color", new THREE.BufferAttribute(burstColors, 3));

    const burstMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const burstSystem = new THREE.Points(burstGeo, burstMat);
    scene.add(burstSystem);

    const triggerBurst = (pos: THREE.Vector3, colorHex: number) => {
      const c = new THREE.Color(colorHex);
      let spawned = 0;
      for (let i = 0; i < BURST_PARTICLES; i++) {
        if (burstLifes[i] <= 0 && spawned < 20) {
          burstPositions[i * 3] = pos.x;
          burstPositions[i * 3 + 1] = pos.y;
          burstPositions[i * 3 + 2] = pos.z;

          const angle = Math.random() * Math.PI * 2;
          const speed = 1.2 + Math.random() * 2.8;
          burstVelocities[i * 3] = Math.cos(angle) * speed;
          burstVelocities[i * 3 + 1] = Math.sin(angle) * speed;
          burstVelocities[i * 3 + 2] = (Math.random() - 0.5) * speed;

          burstColors[i * 3] = c.r;
          burstColors[i * 3 + 1] = c.g;
          burstColors[i * 3 + 2] = c.b;

          burstLifes[i] = 1.0;
          spawned++;
        }
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstGeo.attributes.color.needsUpdate = true;
    };

    // --- 9. Digital Wave Ripples (Click & Eat) ---
    const RIPPLE_COUNT = 8;
    const ripples: { mesh: THREE.Mesh; scale: number; opacity: number; active: boolean }[] = [];
    const rippleGroup = new THREE.Group();
    scene.add(rippleGroup);

    const rippleGeo = new THREE.RingGeometry(0.12, 0.18, 36);
    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const rippleMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rMesh.position.z = -0.5;
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

    // --- 10. Spine Kinematics & States ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isMoving: false };
    const headPos = new THREE.Vector3(0, 0, 0);
    const headVel = new THREE.Vector3(0, 0, 0);
    let headHeading = Math.PI * 0.5;
    let slitherCycle = 0;
    let slitherSpeed = 2.4;
    let eatSurgeTimer = 0; // Excitement & spine energy pulse upon eating

    // 72-joint spine nodes
    const spineNodes: THREE.Vector3[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      spineNodes.push(new THREE.Vector3(0, -i * SEGMENT_DIST, 0));
    }

    // --- 11. Precise 3D World Coordinate Tracking ---
    const get3DWorldPos = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      // Unproject to Z=0 plane for 1:1 exact pointer tip position
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
      // Spawn Food Target + Ripple Wave at exact click position
      spawnFood(worldPos.x, worldPos.y);
      spawnRipple(worldPos.x, worldPos.y, 0x00ff88);
    };

    // --- Hỗ trợ Chạm & Vuốt Mượt mà trên Điện thoại / Mobile ---
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const worldPos = get3DWorldPos(touch.clientX, touch.clientY);
        mouse.targetX = worldPos.x;
        mouse.targetY = worldPos.y;
        mouse.isMoving = true;
        lastMouseMoveTime = performance.now();

        // Tạo mồi ngay tại điểm chạm ngón tay
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

    // --- 12. Update Mesh Geometry Function ---
    const updateSnakeGeometry = (
      spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[],
      cycle: number,
      surge: number
    ) => {
      const darkScaleColor = new THREE.Color(0x0a101d); // Obsidian Cyber Steel
      const metallicAmber = new THREE.Color(0xff8c00); // Luminous Amber
      const neonGold = new THREE.Color(0xffc233); // Bright Gold
      const cyberCyan = new THREE.Color(0x00e5ff); // Cyan Hex
      const bellyColor = new THREE.Color(0x1e293b); // Slate underbelly
      const surgeColor = new THREE.Color(0x00ff88); // Emerald surge upon eating

      let vIdx = 0;
      let uvIdx = 0;
      let cIdx = 0;

      for (let i = 0; i < SEGMENTS; i++) {
        const u = i / (SEGMENTS - 1);
        const { pos, up, side } = spineTransforms[i];
        const { radiusX, radiusY } = profiles[i];

        // Pulse wave traveling down the spine
        const pulse = Math.sin(cycle * 3.2 - u * 18.0);
        // Energy surge wave traveling down when food is eaten
        const surgeWave = Math.sin(surge * 12.0 - u * 14.0);

        for (let j = 0; j < RADIAL_SEGMENTS; j++) {
          const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
          const cosT = Math.cos(theta); // lateral (+right / -left)
          const sinT = Math.sin(theta); // vertical (+dorsal spine / -belly)

          // Elliptical cross section offset
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

          // Color & Glow Mapping
          let vertColor = darkScaleColor.clone();

          if (sinT > 0.62) {
            // Dorsal glowing spine crest
            if (surge > 0.1 && surgeWave > 0.3) {
              vertColor.lerp(surgeColor, 0.95);
            } else if (pulse > 0.2) {
              vertColor.lerp(neonGold, 0.95);
            } else {
              vertColor.lerp(metallicAmber, 0.85);
            }
          } else if (Math.abs(cosT) > 0.75 && i % 4 === 0) {
            // Cyber scale lateral glowing accents
            vertColor.lerp(cyberCyan, 0.75);
          } else if (sinT < -0.38) {
            // Armored slate underbelly
            vertColor.lerp(bellyColor, 0.85);
          }

          bodyColors[cIdx * 3] = vertColor.r;
          bodyColors[cIdx * 3 + 1] = vertColor.g;
          bodyColors[cIdx * 3 + 2] = vertColor.b;

          vIdx++;
          uvIdx++;
          cIdx++;
        }
      }

      bodyGeometry.attributes.position.needsUpdate = true;
      bodyGeometry.attributes.normal.needsUpdate = true;
      bodyGeometry.attributes.color.needsUpdate = true;
      bodyGeometry.computeVertexNormals();

      // Precision position Viper Eyes on Head Frame (Node 1)
      const headFrame = spineTransforms[1];
      const eyeOffsetX = profiles[1].radiusX * 0.92;
      const eyeOffsetY = profiles[1].radiusY * 0.72;
      const eyeOffsetZ = 0.03;

      leftEye.position.copy(headFrame.pos)
        .addScaledVector(headFrame.side, eyeOffsetX)
        .addScaledVector(headFrame.up, eyeOffsetY)
        .addScaledVector(headFrame.dir, eyeOffsetZ);

      rightEye.position.copy(headFrame.pos)
        .addScaledVector(headFrame.side, -eyeOffsetX)
        .addScaledVector(headFrame.up, eyeOffsetY)
        .addScaledVector(headFrame.dir, eyeOffsetZ);
    };

    // --- 13. Update Forked Tongue Geometry ---
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

      const base = snoutFrame.pos.clone().addScaledVector(snoutFrame.dir, 0.04);
      const stemLen = tongueExtension * 0.42;
      const forkLen = tongueExtension * 0.16;
      const forkSpread = tongueExtension * 0.09;
      const wWidth = 0.018; // ribbon thickness

      const stemEnd = base.clone()
        .addScaledVector(snoutFrame.dir, stemLen)
        .addScaledVector(snoutFrame.side, Math.sin(tongueWiggle) * 0.03)
        .addScaledVector(snoutFrame.up, Math.cos(tongueWiggle) * 0.02);

      const leftForkTip = stemEnd.clone()
        .addScaledVector(snoutFrame.dir, forkLen)
        .addScaledVector(snoutFrame.side, forkSpread);

      const rightForkTip = stemEnd.clone()
        .addScaledVector(snoutFrame.dir, forkLen)
        .addScaledVector(snoutFrame.side, -forkSpread);

      // Build small ribbon mesh triangles for the Y-tongue
      const posArr = tongueGeo.attributes.position.array as Float32Array;

      // Stem Quad (2 Triangles = 6 vertices)
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

      // Triangle 1 & 2 (Main stem)
      setV(bL); setV(sL); setV(bR);
      setV(bR); setV(sL); setV(sR);

      // Triangle 3 & 4 (Left Fork)
      setV(sL); setV(leftForkTip); setV(stemEnd);
      setV(stemEnd); setV(leftForkTip); setV(stemEnd);

      // Triangle 5 & 6 (Right Fork)
      setV(sR); setV(stemEnd); setV(rightForkTip);
      setV(stemEnd); setV(rightForkTip); setV(stemEnd);

      tongueGeo.attributes.position.needsUpdate = true;
    };

    // --- 14. Main Animation & Game Loop ---
    const clock = new THREE.Clock();
    let tongueTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // --- FOOD ORB UPDATES & TARGETING ---
      let targetX = mouse.targetX;
      let targetY = mouse.targetY;
      let isHunting = false;

      // Clean up / Animate Food Orbs (Tự động tan biến mồi sau 20s)
      for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        const age = (performance.now() - food.birthTime) * 0.001;

        if (age > 20.0) {
          foodGroup.remove(food.mesh);
          foods.splice(i, 1);
          continue;
        }

        // Floating hover and ring spin
        food.mesh.position.y = food.pos.y + Math.sin(age * 3.5) * 0.08;
        food.mesh.rotation.z = age * 2.0;
        food.mesh.rotation.y = age * 1.5;

        // Subtle scale pulse
        const scale = 1.0 + Math.sin(age * 6.0) * 0.12;
        food.mesh.scale.set(scale, scale, scale);
      }

      // Xác định màn hình mobile để tối ưu bán kính đớp mồi
      const isMobile = window.innerWidth < 768;
      const eatHitRadius = isMobile ? 0.95 : 0.82; // Bán kính đớp mồi rộng rãi, không bao giờ bị trượt

      // If food is present, prioritize nearest food
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

        // Lực hút từ tính miệng rắn khi ở cự ly gần (< 1.2 unit)
        if (closestDist < 1.2) {
          const pull = (1.2 - closestDist) * 0.18;
          targetFood.mesh.position.x = THREE.MathUtils.lerp(targetFood.mesh.position.x, headPos.x, pull);
          targetFood.mesh.position.y = THREE.MathUtils.lerp(targetFood.mesh.position.y, headPos.y, pull);
        }

        // --- CHECK EAT COLLISION ---
        if (closestDist < eatHitRadius) {
          // EAT FOOD!
          const foodIdx = foods.findIndex((f) => f.id === targetFood.id);
          if (foodIdx !== -1) {
            foodGroup.remove(targetFood.mesh);
            foods.splice(foodIdx, 1);

            // Hiệu ứng bùng nổ năng lượng Cyber khi ăn mồi
            triggerBurst(headPos, 0x00ff88);
            spawnRipple(headPos.x, headPos.y, 0x00ff88);
            eatSurgeTimer = 1.0; // Kích hoạt luồng sáng dọc sống lưng
          }
        }
      } else {
        // No food: follow mouse or wander in infinity loop
        if (performance.now() - lastMouseMoveTime > 3000) {
          mouse.isMoving = false;
          targetX = Math.sin(time * 0.42) * 5.8;
          targetY = Math.sin(time * 0.84) * 3.2;
        }
      }

      const toTargetX = targetX - headPos.x;
      const toTargetY = targetY - headPos.y;
      const distToTarget = Math.hypot(toTargetX, toTargetY);

      // Desired heading angle directly pointing towards cursor / food
      let desiredHeading = Math.atan2(toTargetY, toTargetX);
      let angleDiff = desiredHeading - headHeading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Độ linh hoạt khi quay đầu (Turn Speed):
      // Khi săn mồi ở cự ly gần, tăng tốc độ quay góc cực mạnh để triệt tiêu hoàn toàn hiện tượng xoay tròn quanh mồi
      let turnSpeed: number;
      if (isHunting) {
        turnSpeed = Math.min(26.0, 10.0 + (3.5 / Math.max(0.25, distToTarget)) * 5.5);
      } else if (mouse.isMoving) {
        turnSpeed = Math.min(12.0, 4.5 + distToTarget * 1.8);
      } else {
        turnSpeed = 3.5;
      }

      // Xoay đầu mượt mà
      headHeading += angleDiff * Math.min(1.0, delta * turnSpeed);

      // Nếu góc lệch lớn khi đã ở gần mồi (< 1.4 unit), chủ động căn chỉnh góc ngắm thẳng mồi
      if (isHunting && distToTarget < 1.4 && Math.abs(angleDiff) > Math.PI * 0.35) {
        headHeading = THREE.MathUtils.lerp(headHeading, desiredHeading, Math.min(1.0, delta * 20.0));
      }

      // Điều tiết tốc độ di chuyển:
      // Khi đến gần mồi, hãm phanh mượt mà để đầu rắn lao trúng đích thay vì phi vọt qua (overshoot)
      let targetSpeed: number;
      if (isHunting) {
        targetSpeed = Math.max(2.8, Math.min(6.2, distToTarget * 2.8 + 2.0));
      } else if (mouse.isMoving) {
        targetSpeed = Math.min(7.5, 2.0 + distToTarget * 1.6);
      } else {
        targetSpeed = 2.2;
      }

      slitherSpeed = THREE.MathUtils.lerp(slitherSpeed, targetSpeed, 0.15);
      slitherCycle += delta * slitherSpeed * 4.6;

      if (eatSurgeTimer > 0) {
        eatSurgeTimer -= delta * 0.9;
      }

      // Triệt tiêu dao động ngang khi đớp mồi gần đích (< 1.3 unit) để đớp thẳng vào mồi
      const waveDamp = isHunting
        ? (distToTarget < 1.3 ? 0 : Math.min(1.0, (distToTarget - 1.3) * 0.9))
        : Math.min(1.0, distToTarget * 1.2);

      const slitherWave = Math.sin(slitherCycle) * 0.18 * waveDamp;
      const forwardX = Math.cos(headHeading);
      const forwardY = Math.sin(headHeading);
      const sideX = -Math.sin(headHeading);
      const sideY = Math.cos(headHeading);

      // Tiến về phía mục tiêu
      const stepDist = Math.min(distToTarget, slitherSpeed * delta * 1.8);
      headVel.set(
        (forwardX + sideX * slitherWave) * stepDist,
        (forwardY + sideY * slitherWave) * stepDist,
        Math.sin(time * 0.6) * 0.08 * delta
      );
      headPos.add(headVel);

      headPos.z = Math.sin(time * 0.5) * 0.4;
      snakeGlowLight.position.set(headPos.x, headPos.y, headPos.z + 1.2);

      // --- Sinuous Chain Constrained Spine (72 joints) ---
      spineNodes[0].copy(headPos);

      for (let i = 1; i < SEGMENTS; i++) {
        const prev = spineNodes[i - 1];
        const curr = spineNodes[i];

        // S-wave lateral propagation along the slender snake body
        const u = i / (SEGMENTS - 1);
        const waveAmp = Math.sin(u * Math.PI) * 0.24 + (u > 0.5 ? (u - 0.5) * 0.32 : 0);
        const waveOffset = Math.sin(slitherCycle - u * 8.6) * waveAmp;

        const dir = new THREE.Vector3().subVectors(curr, prev);
        if (dir.lengthSq() < 0.00001) dir.set(0, -1, 0);
        dir.normalize();

        // Strict distance constraint (No stretching/collapsing)
        curr.copy(prev).addScaledVector(dir, SEGMENT_DIST);

        // Add lateral S-wave perpendicular to direction
        const sideVec = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
        curr.addScaledVector(sideVec, waveOffset * delta * 8.2);
      }

      // Compute orthonormal basis frames for each segment
      const spineTransforms: { pos: THREE.Vector3; dir: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3 }[] = [];

      for (let i = 0; i < SEGMENTS; i++) {
        const pos = spineNodes[i];
        let dir: THREE.Vector3;

        if (i === 0) {
          dir = new THREE.Vector3().subVectors(spineNodes[0], spineNodes[1]).normalize();
        } else if (i === SEGMENTS - 1) {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i]).normalize();
        } else {
          dir = new THREE.Vector3().subVectors(spineNodes[i - 1], spineNodes[i + 1]).normalize();
        }

        const up = new THREE.Vector3(0, 0, 1);
        const side = new THREE.Vector3().crossVectors(dir, up).normalize();
        up.crossVectors(side, dir).normalize();

        spineTransforms.push({ pos, dir, up, side });
      }

      // Update Body Mesh & Eyes
      updateSnakeGeometry(spineTransforms, slitherCycle, eatSurgeTimer);

      // --- Forked Tongue Flicking Logic ---
      tongueTimer += delta * (isHunting ? 4.5 : 2.0);
      // Tongue flicks in rapid bursts every 2-3 seconds
      const flickWindow = tongueTimer % 3.0;
      let tongueExtension = 0;
      let tongueWiggle = 0;

      if (flickWindow < 0.6) {
        const t = flickWindow / 0.6;
        tongueExtension = Math.sin(t * Math.PI) * (isHunting ? 1.3 : 1.0);
        tongueWiggle = time * 28.0;
      }

      const snoutFrame = {
        pos: spineTransforms[0].pos,
        dir: spineTransforms[0].dir,
        up: spineTransforms[0].up,
        side: spineTransforms[0].side,
      };
      updateForkedTongue(snoutFrame, tongueExtension, tongueWiggle);

      // --- Update Burst Particles ---
      const bArr = burstGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < BURST_PARTICLES; i++) {
        if (burstLifes[i] > 0) {
          burstLifes[i] -= delta * 1.8;
          bArr[i * 3] += burstVelocities[i * 3] * delta;
          bArr[i * 3 + 1] += burstVelocities[i * 3 + 1] * delta;
          bArr[i * 3 + 2] += burstVelocities[i * 3 + 2] * delta;

          if (burstLifes[i] <= 0) {
            bArr[i * 3 + 2] = -100;
          }
        }
      }
      burstGeo.attributes.position.needsUpdate = true;

      // --- Update Ripples ---
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
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();

      // Clean up foods
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
      burstGeo.dispose();
      burstMat.dispose();
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
