import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Network, Compass, Layers, Zap } from 'lucide-react';

export default function VectorSpace3DCanvas({
  centerBook,
  recommendations = [],
  onSelectBook,
  className = ""
}) {
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xa855f7, 3, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 15);
    blueLight.position.set(4, 3, 2);
    scene.add(blueLight);

    // 4. Galaxy Galaxy Pivot Group
    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // 5. Center Query Node (The Origin)
    const centerGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x4c1d95,
      roughness: 0.2,
      metalness: 0.8
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    galaxyGroup.add(centerMesh);

    // Glowing halo ring around origin
    const haloGeo = new THREE.RingGeometry(0.8, 0.84, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    galaxyGroup.add(haloMesh);

    // 6. Recommendation Satellites (Nodes in 3D Embedding Space)
    const nodes = [];
    const interactiveObjects = [];

    const bookList = recommendations.slice(0, 10);
    const count = bookList.length;

    bookList.forEach((b, idx) => {
      const score = b.similarity_score !== undefined ? b.similarity_score : 0.85;
      // Higher similarity = closer to origin
      const radius = 2.2 + (1.0 - Math.min(1.0, score)) * 4.0;
      const angle = (idx / (count || 1)) * Math.PI * 2 + (idx % 2 ? 0.3 : -0.2);
      const yOffset = Math.sin(idx * 1.5) * 1.2;

      const posX = Math.cos(angle) * radius;
      const posY = yOffset;
      const posZ = Math.sin(angle) * radius;

      // Color based on match score
      const nodeColor = score > 0.85 ? 0x059669 : (score > 0.65 ? 0x4f46e5 : 0xd97706);

      const nodeGeo = new THREE.SphereGeometry(0.28, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.6
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(posX, posY, posZ);
      nodeMesh.userData = { book: b, idx, originalScale: 1, originalPos: new THREE.Vector3(posX, posY, posZ) };
      galaxyGroup.add(nodeMesh);
      nodes.push(nodeMesh);
      interactiveObjects.push(nodeMesh);

      // Connecting energy line to center
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(posX, posY, posZ)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.35
      });
      const line = new THREE.Line(lineGeo, lineMat);
      galaxyGroup.add(line);
    });

    // 7. Ambient Dust Stars
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 16;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.04,
      transparent: true,
      opacity: 0.6
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    // 8. Raycaster for Hover & Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const target = intersects[0].object;
        setHoveredNode({
          book: target.userData.book,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        target.scale.setScalar(1.4);
      } else {
        setHoveredNode(null);
        interactiveObjects.forEach(obj => obj.scale.setScalar(1));
      }
    };

    const onClick = (e) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0 && onSelectBook) {
        onSelectBook(intersects[0].object.userData.book);
      }
    };

    // 9. Orbit drag controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotX = 0.3;
    let rotY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      rotX = Math.max(-1.0, Math.min(1.0, rotX));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('click', onClick);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        rotY += delta * 0.25;
      }

      galaxyGroup.rotation.y = THREE.MathUtils.lerp(galaxyGroup.rotation.y, rotY, 0.08);
      galaxyGroup.rotation.x = THREE.MathUtils.lerp(galaxyGroup.rotation.x, rotX, 0.08);

      // Node breathing & wave pulse
      nodes.forEach((n, i) => {
        n.position.y = n.userData.originalPos.y + Math.sin(time * 2 + i) * 0.12;
      });

      centerMesh.rotation.y = time * 0.5;
      haloMesh.rotation.z = time * 0.3;
      dustSystem.rotation.y = time * 0.02;

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
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
      centerGeo.dispose();
      haloGeo.dispose();
      dustGeo.dispose();
    };
  }, [centerBook, recommendations, autoRotate, onSelectBook]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl ${className}`}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-[440px] cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Vector Space Galaxy</span>
        </div>
        <p className="text-[11px] text-indigo-200/70 ml-1">
          Distances mapped directly from Cosine Similarity
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 backdrop-blur-md border ${
            autoRotate
              ? 'bg-purple-600/80 text-white border-purple-400/50'
              : 'bg-white/10 text-gray-300 border-white/15 hover:bg-white/20'
          }`}
        >
          {autoRotate ? 'Orbit: Active' : 'Orbit: Paused'}
        </button>
      </div>

      {/* Interactive Tooltip Hover HUD */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-full px-3.5 py-2.5 rounded-2xl bg-gray-900/90 backdrop-blur-xl border border-purple-500/40 shadow-xl text-left max-w-xs transition-all duration-150"
          style={{
            left: `${hoveredNode.x}px`,
            top: `${hoveredNode.y - 14}px`
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              {hoveredNode.book?.similarity_score !== undefined
                ? `${(hoveredNode.book.similarity_score * 100).toFixed(1)}% Similarity Match`
                : 'Nearest Neighbor'}
            </span>
          </div>
          <h5 className="font-extrabold text-xs text-white line-clamp-1">
            {hoveredNode.book?.['Book-Title']}
          </h5>
          <p className="text-[10px] text-gray-300 truncate">
            {hoveredNode.book?.['Book-Author']}
          </p>
          <p className="text-[9px] text-purple-300 font-mono mt-1">
            Click node to view details
          </p>
        </div>
      )}

      {/* Legend footer */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Active Book</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>High Match (&gt;85%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Medium Match</span>
        </div>
      </div>
    </div>
  );
}
