import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Layers, Sparkles, Box, Sun, Compass } from 'lucide-react';
import { getCandidateCoverUrls } from '../../services/coverService';

/**
 * Creates dynamic canvas texture from book title, author, and gradient
 */
function createCustomCoverTexture(title, author, isbn, customImg) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');

  if (customImg && customImg.complete && customImg.naturalWidth !== 0) {
    ctx.drawImage(customImg, 0, 0, 1024, 1400);
    // Add subtle spine groove shadow on left
    const spineGrad = ctx.createLinearGradient(0, 0, 90, 0);
    spineGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
    spineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spineGrad;
    ctx.fillRect(0, 0, 90, 1400);
    return new THREE.CanvasTexture(canvas);
  }

  // Fallback procedural art cover
  const gradients = [
    ['#1e1b4b', '#312e81', '#4338ca'],
    ['#064e3b', '#047857', '#059669'],
    ['#701a75', '#86198f', '#a21caf'],
    ['#7c2d12', '#9a3412', '#c2410c'],
    ['#111827', '#1f2937', '#374151']
  ];
  const charCode = (title || 'A').charCodeAt(0);
  const pal = gradients[charCode % gradients.length];

  const grad = ctx.createLinearGradient(0, 0, 1024, 1400);
  grad.addColorStop(0, pal[0]);
  grad.addColorStop(0.5, pal[1]);
  grad.addColorStop(1, pal[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1400);

  // Geometric grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1400);
    ctx.stroke();
  }
  for (let j = 0; j < 1400; j += 64) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(1024, j);
    ctx.stroke();
  }

  // Gold foil borders
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 6;
  ctx.strokeRect(50, 50, 924, 1300);
  ctx.strokeRect(70, 70, 884, 1260);

  // Big initials stamp
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(512, 480, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 110px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((title || 'BK').slice(0, 2).toUpperCase(), 512, 480);

  // Title
  ctx.font = '800 60px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  const words = (title || 'Book Title').split(' ');
  if (words.length > 3) {
    ctx.fillText(words.slice(0, 3).join(' '), 512, 750);
    ctx.fillText(words.slice(3, 7).join(' '), 512, 830);
  } else {
    ctx.fillText(title || 'Book Title', 512, 790);
  }

  // Author
  ctx.fillStyle = '#fde047';
  ctx.font = '600 36px "Inter", sans-serif';
  ctx.fillText((author || 'Author Name').toUpperCase(), 512, 940);

  // ISBN footer
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '500 24px monospace';
  ctx.fillText(`ISBN: ${isbn || '978-0000000000'}`, 512, 1250);

  return new THREE.CanvasTexture(canvas);
}

function createPaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#faf6ed';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(217, 119, 6, 0.04)';
    ctx.fillRect(0, y, 512, 1.5);
  }
  return new THREE.CanvasTexture(canvas);
}

export default function HoloBookViewer3D({
  book,
  imgUrl,
  className = ""
}) {
  const containerRef = useRef(null);
  const [theme, setTheme] = useState('luxury'); // 'luxury' | 'hologram' | 'gold' | 'wireframe'
  const [exploded, setExploded] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(4.8);

  const title = book?.['Book-Title'] || 'Featured Book';
  const author = book?.['Book-Author'] || 'Author';
  const isbn = book?.['ISBN'] || '';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, zoomLevel);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(
      theme === 'hologram' ? 0x06b6d4 : 0xffffff,
      theme === 'hologram' ? 1.8 : 1.4
    );
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
      theme === 'gold' ? 0xfef08a : (theme === 'hologram' ? 0xd946ef : 0xfffbeb),
      2.5
    );
    mainLight.position.set(5, 6, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const backRimLight = new THREE.PointLight(
      theme === 'hologram' ? 0x06b6d4 : 0x8b5cf6,
      2.2,
      12
    );
    backRimLight.position.set(-4, -2, -3);
    scene.add(backRimLight);

    // 4. Image Preloading & Texture Prep via candidate fallback chain
    const candidateUrls = getCandidateCoverUrls(book, 'L');
    if (imgUrl && !candidateUrls.includes(imgUrl)) candidateUrls.unshift(imgUrl);

    let coverTexture = createCustomCoverTexture(title, author, isbn, null);
    const paperTexture = createPaperTexture();

    // 5. Materials based on active theme
    let coverMat, pagesMat, spineMat, backMat;

    if (theme === 'hologram') {
      coverMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x083344,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
        wireframe: false
      });
      pagesMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x3b0764,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
      });
      spineMat = coverMat;
      backMat = coverMat;
    } else if (theme === 'gold') {
      coverMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.85,
        roughness: 0.2,
        map: coverTexture
      });
      pagesMat = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 0.7, metalness: 0.1 });
      spineMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.9, roughness: 0.15 });
      backMat = new THREE.MeshStandardMaterial({ color: 0xa16207, metalness: 0.85, roughness: 0.25 });
    } else if (theme === 'wireframe') {
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true });
      coverMat = wireMat;
      pagesMat = wireMat;
      spineMat = wireMat;
      backMat = wireMat;
    } else {
      // Luxury default
      coverMat = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.28, metalness: 0.2 });
      pagesMat = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 0.85, metalness: 0.05 });
      spineMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.3 });
      backMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4, metalness: 0.25 });
    }

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Asynchronously update cover with best high-res candidate
    const tryLoadImage = (index) => {
      if (index >= candidateUrls.length) return;
      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => {
        if (testImg.naturalWidth > 5 && testImg.naturalHeight > 5) {
          const newTex = createCustomCoverTexture(title, author, isbn, testImg);
          if (coverMat && theme !== 'wireframe') {
            coverMat.map = newTex;
            coverMat.needsUpdate = true;
          }
        } else {
          tryLoadImage(index + 1);
        }
      };
      testImg.onerror = () => tryLoadImage(index + 1);
      testImg.src = candidateUrls[index];
    };
    tryLoadImage(0);

    // Front Cover Plate
    const coverGeo = new THREE.BoxGeometry(2.1, 2.9, 0.04);
    const frontCoverMesh = new THREE.Mesh(coverGeo, coverMat);
    frontCoverMesh.position.set(0, 0, 0.21);
    frontCoverMesh.castShadow = true;
    masterGroup.add(frontCoverMesh);

    // Page Block (Thick body)
    const pagesGeo = new THREE.BoxGeometry(2.02, 2.82, 0.36);
    const pagesMaterials = [
      pagesMat, // Right
      spineMat, // Left / Spine
      pagesMat, // Top
      pagesMat, // Bottom
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), // Front
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })  // Back
    ];
    const pageBlockMesh = new THREE.Mesh(pagesGeo, pagesMaterials);
    pageBlockMesh.position.set(-0.02, 0, 0);
    masterGroup.add(pageBlockMesh);

    // Back Cover Plate
    const backCoverMesh = new THREE.Mesh(coverGeo, backMat);
    backCoverMesh.position.set(0, 0, -0.21);
    backCoverMesh.castShadow = true;
    masterGroup.add(backCoverMesh);

    // Spine Curved Mesh
    const spineGeo = new THREE.CylinderGeometry(0.21, 0.21, 2.9, 24, 1, false, Math.PI * 0.5, Math.PI);
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(-1.05, 0, 0);
    masterGroup.add(spineMesh);

    // Hologram ambient beacon rings
    const beaconGeo = new THREE.RingGeometry(2.2, 2.24, 64);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: theme === 'hologram' ? 0x06b6d4 : 0x7c3aed,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.rotation.x = Math.PI / 2;
    beaconMesh.position.y = -1.6;
    scene.add(beaconMesh);

    // Holographic Cyber Particles
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: theme === 'hologram' ? 0x38bdf8 : 0xc084fc,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particleCloud = new THREE.Points(pGeo, pMat);
    scene.add(particleCloud);

    // 7. Interaction Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotX = 0.15;
    let rotY = -0.4;

    const onMouseDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      rotY += dx * 0.012;
      rotX += dy * 0.012;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (autoSpin && !isDragging) {
        rotY += delta * 0.4;
      }

      masterGroup.rotation.y = THREE.MathUtils.lerp(masterGroup.rotation.y, rotY, 0.1);
      masterGroup.rotation.x = THREE.MathUtils.lerp(masterGroup.rotation.x, rotX, 0.1);

      // Exploded View smooth transition
      const targetFrontZ = exploded ? 0.8 : 0.21;
      const targetBackZ = exploded ? -0.8 : -0.21;
      const targetPagesScale = exploded ? 0.9 : 1.0;

      frontCoverMesh.position.z = THREE.MathUtils.lerp(frontCoverMesh.position.z, targetFrontZ, 0.1);
      backCoverMesh.position.z = THREE.MathUtils.lerp(backCoverMesh.position.z, targetBackZ, 0.1);
      pageBlockMesh.scale.x = THREE.MathUtils.lerp(pageBlockMesh.scale.x, targetPagesScale, 0.1);

      // Particle float & beacon pulse
      particleCloud.rotation.y = time * 0.08;
      beaconMesh.rotation.z = time * 0.2;
      beaconMesh.scale.setScalar(1 + Math.sin(time * 2) * 0.05);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
      coverGeo.dispose();
      pagesGeo.dispose();
      spineGeo.dispose();
      beaconGeo.dispose();
      pGeo.dispose();
      coverTexture.dispose();
      paperTexture.dispose();
    };
  }, [book, imgUrl, theme, exploded, autoSpin, zoomLevel]);

  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden border border-purple-200/60 bg-gradient-to-b from-white/90 to-purple-50/40 backdrop-blur-xl shadow-xl ${className}`}>
      {/* 3D Canvas stage */}
      <div className="relative w-full h-[400px] cursor-grab active:cursor-grabbing flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full" />

        {/* Top telemetry HUD */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-sm text-[11px] font-bold text-gray-800">
          <Compass className="w-3.5 h-3.5 text-purple-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span>3D Holographic Inspector</span>
        </div>

        {/* Zoom & Quick Action Floating Pill */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-sm">
          <button
            onClick={() => setZoomLevel(z => Math.max(3.0, z - 0.5))}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.min(7.0, z + 0.5))}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`p-1.5 rounded-xl transition-colors ${autoSpin ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Toggle Spin"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Left: Exploded View Toggle */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <button
            onClick={() => setExploded(!exploded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 backdrop-blur-md border shadow-sm ${
              exploded
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/25'
                : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{exploded ? 'Collapse Book' : '3D Anatomy Split'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar for Material Themes */}
      <div className="px-5 py-3.5 bg-white/70 backdrop-blur-md border-t border-purple-100/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Shading & Material:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'luxury', label: 'Luxury Hardcover', icon: Box, color: 'hover:border-purple-300' },
            { id: 'hologram', label: 'Cyber Holo', icon: Sparkles, color: 'hover:border-cyan-300' },
            { id: 'gold', label: 'Gold Leaf', icon: Sun, color: 'hover:border-amber-300' },
            { id: 'wireframe', label: '3D Wireframe', icon: Layers, color: 'hover:border-indigo-300' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 border ${
                theme === m.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
