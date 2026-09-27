import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, RotateCw, Package, Bookmark } from 'lucide-react';

/**
 * Creates procedural canvas texture in the iconic Aardvark Book Club edition style
 */
function createAardvarkCoverTexture(title = "MAZYWOOD", author = "Tananarive Due") {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');

  // Aardvark deep editorial background (rich dark navy / ink)
  const grad = ctx.createLinearGradient(0, 0, 1024, 1400);
  grad.addColorStop(0, '#101014');
  grad.addColorStop(0.5, '#181820');
  grad.addColorStop(1, '#0c0c10');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1400);

  // Aardvark Butter Yellow header bar
  ctx.fillStyle = '#FAED8F';
  ctx.fillRect(50, 60, 924, 100);
  ctx.strokeStyle = '#141416';
  ctx.lineWidth = 6;
  ctx.strokeRect(50, 60, 924, 100);

  // Aardvark Club label
  ctx.fillStyle = '#141416';
  ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AARDVARK BOOK CLUB · EXCLUSIVE HARDCOVER', 512, 110);

  // Spine hinge shadow
  const spineGrad = ctx.createLinearGradient(0, 0, 90, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
  spineGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 90, 1400);

  // Bold Art Circle Emblem
  ctx.beginPath();
  ctx.arc(512, 490, 180, 0, Math.PI * 2);
  ctx.fillStyle = '#FAED8F';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#141416';
  ctx.stroke();

  // SmartBook Stylized Mascot & Emblem
  ctx.fillStyle = '#141416';
  ctx.font = '900 120px "Fraunces", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SB', 512, 490);

  // Recommendation Badge
  ctx.fillStyle = '#FF4A32';
  ctx.fillRect(332, 700, 360, 56);
  ctx.strokeStyle = '#141416';
  ctx.lineWidth = 4;
  ctx.strokeRect(332, 700, 360, 56);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SMARTBOOK AI · REC 01', 512, 728);

  // Big Bold Editorial Book Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 76px "Fraunces", Georgia, serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 12;

  const words = title.toUpperCase().split(' ');
  if (words.length > 2) {
    ctx.fillText(words.slice(0, 2).join(' '), 512, 850);
    ctx.fillText(words.slice(2).join(' '), 512, 940);
  } else {
    ctx.fillText(title.toUpperCase(), 512, 890);
  }

  // Yellow rule
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FAED8F';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(250, 1020);
  ctx.lineTo(774, 1020);
  ctx.stroke();

  // Author Name
  ctx.fillStyle = '#FAED8F';
  ctx.font = '800 42px "Fraunces", serif';
  ctx.fillText(author.toUpperCase(), 512, 1090);

  // Footer Tag
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('UNBOX STORIES WORTH TALKING ABOUT', 512, 1260);

  return new THREE.CanvasTexture(canvas);
}

function createAardvarkPagesTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? 'rgba(20,20,22,0.06)' : 'rgba(250, 237, 143, 0.08)';
    ctx.fillRect(0, y, 512, 2);
  }
  return new THREE.CanvasTexture(canvas);
}

export default function Hero3DBookCanvas({
  title = "MAZYWOOD",
  author = "Tananarive Due",
  className = ""
}) {
  const containerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Warm Studio Lighting (Aardvark catalog style)
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.4);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    warmKeyLight.position.set(4, 5, 4);
    warmKeyLight.castShadow = true;
    scene.add(warmKeyLight);

    const yellowRimLight = new THREE.PointLight(0xfaed8f, 2.8, 12);
    yellowRimLight.position.set(-4, -2, -3);
    scene.add(yellowRimLight);

    const softFill = new THREE.PointLight(0xffffff, 1.2, 10);
    softFill.position.set(0, 3, 2);
    scene.add(softFill);

    // 4. Book Dimensions
    const bookWidth = 2.1;
    const bookHeight = 2.95;
    const bookDepth = 0.46;

    const coverTex = createAardvarkCoverTexture(title, author);
    const pagesTex = createAardvarkPagesTexture();

    // Material setup: [Right, Left/Spine, Top, Bottom, Front, Back]
    const materials = [
      new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.85, metalness: 0.05 }), // Right (pages)
      new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.35, metalness: 0.2 }), // Left (Spine)
      new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.85, metalness: 0.05 }), // Top (pages)
      new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.85, metalness: 0.05 }), // Bottom (pages)
      new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.25, metalness: 0.2 }),  // Front cover
      new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4, metalness: 0.15 }), // Back cover
    ];

    const bookGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
    const bookMesh = new THREE.Mesh(bookGeo, materials);
    bookMesh.castShadow = true;
    bookMesh.receiveShadow = true;

    // Master Pivot Group
    const bookGroup = new THREE.Group();
    bookGroup.add(bookMesh);

    // 5. Signature Silk Bookmark Ribbon (Draping out from the bottom)
    const ribbonGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xfaed8f,
      roughness: 0.4,
      metalness: 0.3
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0.1, -1.8, 0.15);
    ribbonMesh.rotation.z = -0.2;
    bookGroup.add(ribbonMesh);

    // Book Tilt Angle
    bookGroup.rotation.x = 0.2;
    bookGroup.rotation.y = -0.5;
    scene.add(bookGroup);

    // 6. Floating Aardvark Paper Confetti / Star Particles
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 6;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfaed8f,
      size: 0.06,
      transparent: true,
      opacity: 0.9
    });
    const confettiSystem = new THREE.Points(pGeo, pMat);
    scene.add(confettiSystem);

    // 7. Mouse Orbit & Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let currentRotX = 0.2;
    let currentRotY = -0.5;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        currentRotY += deltaX * 0.012;
        currentRotX += deltaY * 0.012;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        mouseTargetX = x * 0.3;
        mouseTargetY = y * 0.2;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Breathing float
      bookMesh.position.y = Math.sin(time * 1.5) * 0.07;
      ribbonMesh.position.y = -1.8 + Math.sin(time * 1.5) * 0.07;
      ribbonMesh.rotation.x = Math.sin(time * 2.5) * 0.15;

      if (!isDragging && autoRotate) {
        currentRotY += delta * 0.35;
      }

      bookGroup.rotation.y = THREE.MathUtils.lerp(bookGroup.rotation.y, currentRotY + mouseTargetX, 0.08);
      bookGroup.rotation.x = THREE.MathUtils.lerp(bookGroup.rotation.x, currentRotX - mouseTargetY, 0.08);

      confettiSystem.rotation.y = time * 0.05;

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
      bookGeo.dispose();
      ribbonGeo.dispose();
      pGeo.dispose();
      coverTex.dispose();
      pagesTex.dispose();
    };
  }, [title, author, autoRotate]);

  return (
    <div className={`relative w-full h-full min-h-[380px] select-none flex items-center justify-center ${className}`}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* SmartBook AI Edition Floating Pill */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAED8F] border-1.5 border-[#141416] shadow-[3px_3px_0px_#141416]">
        <Sparkles className="w-3.5 h-3.5 text-[#141416]" />
        <span className="text-[11px] font-black text-[#141416] tracking-wide uppercase">
          SmartBook 3D Edition
        </span>
      </div>

      {/* Spin control */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-1.5 border-[#141416] shadow-[2px_2px_0px_#141416] ${autoRotate
              ? 'bg-[#FAED8F] text-[#141416]'
              : 'bg-white text-[#5E5E68] hover:bg-gray-50'
            }`}
          title="Toggle 3D Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'Spinning' : 'Paused'}</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 pointer-events-none text-xs font-bold text-[#5E5E68] flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full border border-[#141416]/20">
        <Eye className="w-3 h-3 text-[#141416]" />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
}
