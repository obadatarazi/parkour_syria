import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function MouseTrackerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 40;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;

      const t = Math.random();
      if (t < 0.5) {
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else if (t < 0.85) {
        colors[i3] = 0.78;
        colors[i3 + 1] = 0.06;
        colors[i3 + 2] = 0.18;
      } else {
        colors[i3] = 0.1;
        colors[i3 + 1] = 0.1;
        colors[i3 + 2] = 0.1;
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDist;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;

          float wave = sin(uTime * 0.5 + pos.x * 0.1) * 2.0;
          pos.y += wave;

          vec2 toMouse = uMouse - pos.xy;
          float dist = length(toMouse);
          vDist = dist;

          float force = 1.0 - smoothstep(0.0, 20.0, dist);
          pos.xy -= normalize(toMouse + vec2(0.001)) * force * 6.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * (1.0 + force * 2.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDist;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          float glow = 1.0 - smoothstep(10.0, 40.0, vDist);
          vec3 col = vColor + vec3(glow * 0.3);

          gl_FragColor = vec4(col, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineCount = 40;
    const linePositions = new Float32Array(lineCount * 6);
    const lineColors = new Float32Array(lineCount * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = ((clientX - rect.left) / rect.width) * 80 - 40;
      targetMouse.y = -((clientY - rect.top) / rect.height) * 40 + 20;
    };

    const handleMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      mouse.lerp(targetMouse, 0.08);

      material.uniforms.uTime.value = elapsed;
      material.uniforms.uMouse.value.copy(mouse);

      points.rotation.y = Math.sin(elapsed * 0.1) * 0.1;
      points.rotation.x = Math.cos(elapsed * 0.07) * 0.05;

      const pos = geometry.attributes.position.array as Float32Array;
      let lineIdx = 0;
      const linePos = lineGeometry.attributes.position.array as Float32Array;
      const lineCol = lineGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount && lineIdx < lineCount; i++) {
        const i3 = i * 3;
        const dx = mouse.x - pos[i3];
        const dy = mouse.y - pos[i3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 18) {
          const li = lineIdx * 6;
          linePos[li] = pos[i3];
          linePos[li + 1] = pos[i3 + 1];
          linePos[li + 2] = pos[i3 + 2];
          linePos[li + 3] = mouse.x;
          linePos[li + 4] = mouse.y;
          linePos[li + 5] = 0;

          const intensity = 1 - dist / 18;
          lineCol[li] = 1 * intensity;
          lineCol[li + 1] = 1 * intensity;
          lineCol[li + 2] = 1 * intensity;
          lineCol[li + 3] = 0.78 * intensity;
          lineCol[li + 4] = 0.06 * intensity;
          lineCol[li + 5] = 0.18 * intensity;

          lineIdx++;
        }
      }

      for (let i = lineIdx; i < lineCount; i++) {
        const li = i * 6;
        for (let j = 0; j < 6; j++) linePos[li + j] = 0;
        for (let j = 0; j < 6; j++) lineCol[li + j] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
