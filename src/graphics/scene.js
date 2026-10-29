import * as THREE from 'three';
export function createScene(host) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return { setState() {}, dispose() {} }; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 50); camera.position.z = 7.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); host.append(renderer.domElement); host.parentElement.classList.add('has-webgl');
  const geometry = new THREE.IcosahedronGeometry(1.15, 0);
  const material = new THREE.MeshStandardMaterial({ color: 0x688c82, metalness: .35, roughness: .35, flatShading: true });
  const core = new THREE.Mesh(geometry, material); core.rotation.set(.2, .4, .15); scene.add(core);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xc4fce2, transparent: true, opacity: .2 })); core.add(edges);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x7c9baf, transparent: true, opacity: .24 });
  const orbitGeometry = new THREE.TorusGeometry(1.85, .005, 6, 100);
  const rings = new THREE.Group();
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(orbitGeometry, orbitMaterial); ring.rotation.set(1.1 + i * .6, i * .8, -.4); rings.add(ring); } scene.add(rings);
  scene.add(new THREE.AmbientLight(0xc8ddff, 2)); const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(-3, 4, 5); scene.add(key);
  const accent = new THREE.PointLight(0x22c55e, 15); accent.position.set(3, -1, 3); scene.add(accent);
  const motion = matchMedia('(prefers-reduced-motion: reduce)'); let state = 'idle', raf = 0, previous = 0, elapsed = 0, disposed = false, failed = false;
  function render() { if (!disposed && !failed) renderer.render(scene, camera); }
  function loop(time) { raf = 0; const delta = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    if (!motion.matches && state !== 'ready') { elapsed += delta; core.rotation.y += delta * .18; core.rotation.x += delta * .07; core.position.y = Math.sin(elapsed * .8) * .08; rings.rotation.z += delta * .035; if (state === 'completed') core.scale.setScalar(1 + Math.sin(Math.min(elapsed, 1) * Math.PI) * .06); }
    render(); if (!document.hidden && !motion.matches && !disposed && !failed) raf = requestAnimationFrame(loop);
  }
  function resume() { if (raf) cancelAnimationFrame(raf); raf = 0; previous = 0; if (!document.hidden && !failed) { render(); if (!motion.matches) raf = requestAnimationFrame(loop); } }
  function resize() { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.position.z = width < 450 ? 9 : 7.5; camera.updateProjectionMatrix(); render(); }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const lost = event => { event.preventDefault(); failed = true; cancelAnimationFrame(raf); host.parentElement.classList.remove('has-webgl'); };
  renderer.domElement.addEventListener('webglcontextlost', lost); document.addEventListener('visibilitychange', resume); motion.addEventListener('change', resume); resize(); resume();
  return {
    setState(next) { state = next; elapsed = 0; core.scale.setScalar(1); material.color.set(next === 'waiting' || next === 'early' ? 0xef4444 : next === 'ready' || next === 'completed' ? 0x22c55e : 0x688c82); orbitMaterial.opacity = next === 'waiting' || next === 'ready' ? .1 : .24; render(); },
    dispose() { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener('visibilitychange', resume); motion.removeEventListener('change', resume); renderer.domElement.removeEventListener('webglcontextlost', lost); geometry.dispose(); material.dispose(); edges.geometry.dispose(); edges.material.dispose(); orbitGeometry.dispose(); orbitMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
