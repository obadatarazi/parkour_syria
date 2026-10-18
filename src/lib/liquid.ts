import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Ripples spread out from the pointer, with a slight colour split on the wave.
const FRAG = `
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uCover;
uniform float uAspect;
uniform float uStrength;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 d = vUv - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float fall = smoothstep(0.5, 0.0, dist);
  float wave = sin(dist * 34.0 - uTime * 5.0);
  vec2 off = normalize(d + 1e-5) * wave * 0.014 * fall * uStrength;
  off.x /= uAspect;

  vec2 uv = (vUv + off - 0.5) * uCover + 0.5;
  vec2 split = off * 0.7 * uCover;
  float r = texture2D(uTex, uv + split).r;
  float g = texture2D(uTex, uv).g;
  float b = texture2D(uTex, uv - split).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export interface LiquidHandle {
  enter: () => void;
  leave: () => void;
  move: (x: number, y: number) => void;
  destroy: () => void;
}

// The WebGL context only exists while the pointer is on the image, then it is released.
export function attachLiquid(img: HTMLImageElement): LiquidHandle {
  let renderer: THREE.WebGLRenderer | null = null;
  let material: THREE.ShaderMaterial | null = null;
  let texture: THREE.Texture | null = null;
  let mesh: THREE.Mesh | null = null;
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const mouse = new THREE.Vector2(0.5, 0.5);
  const target = new THREE.Vector2(0.5, 0.5);
  let strength = 0;
  let hovering = false;
  let raf = 0;
  const start = performance.now();

  const setup = () => {
    const w = img.clientWidth;
    const h = img.clientHeight;
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    const canvas = renderer.domElement;
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      filter: getComputedStyle(img).filter,
      opacity: '0',
      transition: 'opacity 0.35s ease',
    });
    img.after(canvas);

    // Copy at natural size: uploading the <img> directly mixes its layout size with its pixel size.
    const source = document.createElement('canvas');
    source.width = img.naturalWidth;
    source.height = img.naturalHeight;
    source.getContext('2d')!.drawImage(img, 0, 0);
    texture = new THREE.CanvasTexture(source);
    const boxAspect = w / h;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const cover =
      imgAspect > boxAspect
        ? new THREE.Vector2(boxAspect / imgAspect, 1)
        : new THREE.Vector2(1, imgAspect / boxAspect);

    material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTex: { value: texture },
        uMouse: { value: mouse },
        uCover: { value: cover },
        uAspect: { value: boxAspect },
        uStrength: { value: 0 },
        uTime: { value: 0 },
      },
    });
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    requestAnimationFrame(() => (canvas.style.opacity = '1'));
  };

  const teardown = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (!renderer) return;
    renderer.domElement.remove();
    mesh?.geometry.dispose();
    material?.dispose();
    texture?.dispose();
    if (mesh) scene.remove(mesh);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  };

  const tick = () => {
    if (!renderer || !material) return;
    mouse.lerp(target, 0.12);
    strength += ((hovering ? 1 : 0) - strength) * 0.06;
    material.uniforms.uStrength.value = strength;
    material.uniforms.uTime.value = (performance.now() - start) / 1000;
    renderer.render(scene, camera);

    if (!hovering && strength < 0.01) {
      teardown();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  return {
    enter() {
      if (!img.complete || !img.naturalWidth) return;
      hovering = true;
      if (!renderer) setup();
      if (renderer) renderer.domElement.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(tick);
    },
    leave() {
      hovering = false;
    },
    move(x, y) {
      target.set(x, 1 - y);
    },
    destroy: teardown,
  };
}
