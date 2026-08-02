import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";

const ProgressCtx = createContext<MutableRefObject<number> | null>(null);

function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("ProgressCtx missing");
  return ctx;
}

function damp(n: number, t: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(n, t, lambda, dt);
}
function range(p: number, a: number, b: number) {
  return THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Phase = "side" | "slat" | "clip" | "cap";

function classify(obj: THREE.Object3D): Phase {
  const names: string[] = [];
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur.name) names.push(cur.name.toLowerCase());
    cur = cur.parent;
  }
  const blob = names.join(" ");
  if (blob.includes("capac") || blob.includes("autoforant")) return "cap";
  if (blob.includes("laterale")) return "side";
  if (blob.includes("cleme") || /\bnull\b/.test(blob)) return "clip";
  return "slat";
}

type Piece = {
  obj: THREE.Object3D;
  originPos: THREE.Vector3;
  originQuat: THREE.Quaternion;
  originScale: THREE.Vector3;
  phase: Phase;
  order: number;
};

const PHASE: Record<Phase, { start: number; span: number; count: number }> = {
  side: { start: 0.08, span: 0.16, count: 4 },
  slat: { start: 0.22, span: 0.45, count: 12 },
  clip: { start: 0.52, span: 0.28, count: 10 },
  cap: { start: 0.78, span: 0.14, count: 3 },
};

const METAL = new THREE.Color("#5c646e"); // anthracite readable on dark bg

function polishMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const src = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = src.map((m) => {
      const base = (m as THREE.MeshStandardMaterial)?.color?.clone?.() ?? METAL.clone();
      // lift very dark CAD colors so studio light can read edges
      const lifted = base.clone().lerp(METAL, 0.55);
      const mat = new THREE.MeshPhysicalMaterial({
        color: lifted,
        metalness: 0.82,
        roughness: 0.28,
        envMapIntensity: 1.85,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        reflectivity: 0.6,
        sheen: 0.15,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color("#d7dde6"),
      });
      return mat;
    });
  });
}

function fitAndFrame(root: THREE.Object3D, targetHeight = 2.05) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.scale.setScalar(targetHeight / Math.max(size.y, 0.001));
  root.updateMatrixWorld(true);

  const box2 = new THREE.Box3().setFromObject(root);
  const c2 = box2.getCenter(new THREE.Vector3());
  root.position.x -= c2.x;
  root.position.y -= c2.y;
  root.position.z -= c2.z;

  const box3 = new THREE.Box3().setFromObject(root);
  root.position.y -= box3.min.y + 1.05;
  // slight product angle so louvers read in 3D
  root.rotation.y = -0.48;
  root.rotation.x = 0.06;
}

function collectPieces(root: THREE.Object3D): Piece[] {
  const pieces: Piece[] = [];
  const counts: Record<Phase, number> = { side: 0, slat: 0, clip: 0, cap: 0 };
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const phase = classify(obj);
    pieces.push({
      obj,
      originPos: obj.position.clone(),
      originQuat: obj.quaternion.clone(),
      originScale: obj.scale.clone(),
      phase,
      order: counts[phase]++,
    });
  });
  return pieces;
}

function animatePieces(pieces: Piece[], p: number, dt: number) {
  const tmpEuler = new THREE.Euler();
  const tmpQuat = new THREE.Quaternion();
  const offset = new THREE.Vector3();

  for (const piece of pieces) {
    const win = PHASE[piece.phase];
    const staggered =
      win.start + (piece.order % win.count) * (win.span / (win.count + 1.5));
    const local = easeOutCubic(range(p, staggered, staggered + win.span * 0.5));

    let ox = 0,
      oy = 0,
      oz = 0,
      rx = 0,
      ry = 0,
      rz = 0;

    if (piece.phase === "side") {
      ox = piece.order % 2 === 0 ? -2.2 : 2.2;
      ry = piece.order % 2 === 0 ? -0.9 : 0.9;
    } else if (piece.phase === "slat") {
      oy = 2.6;
      oz = 1.8;
      rx = piece.order % 2 === 0 ? 1.55 : -1.35;
    } else if (piece.phase === "clip") {
      oz = -1.5;
      ox = (piece.order % 2 === 0 ? -1 : 1) * 0.7;
      rz = 1.0;
    } else {
      oy = 1.8;
      rx = -1.2;
    }

    offset.set(ox, oy, oz).multiplyScalar(1 - local);
    const tx = piece.originPos.x + offset.x;
    const ty = piece.originPos.y + offset.y;
    const tz = piece.originPos.z + offset.z;

    piece.obj.position.x = damp(piece.obj.position.x, tx, 7.5, dt);
    piece.obj.position.y = damp(piece.obj.position.y, ty, 7.5, dt);
    piece.obj.position.z = damp(piece.obj.position.z, tz, 7.5, dt);

    tmpEuler.set(rx * (1 - local), ry * (1 - local), rz * (1 - local));
    tmpQuat.setFromEuler(tmpEuler).premultiply(piece.originQuat);
    piece.obj.quaternion.slerp(tmpQuat, 1 - Math.exp(-7 * dt));

    const s = THREE.MathUtils.lerp(0.35, 1, local);
    piece.obj.scale.x = damp(piece.obj.scale.x, piece.originScale.x * s, 8, dt);
    piece.obj.scale.y = damp(piece.obj.scale.y, piece.originScale.y * s, 8, dt);
    piece.obj.scale.z = damp(piece.obj.scale.z, piece.originScale.z * s, 8, dt);

    piece.obj.visible = local > 0.015 || p > win.start - 0.03;
  }
}

function MetallicPanel() {
  const progress = useProgress();
  const { scene } = useGLTF("/models/mx60-duo.glb");
  const root = useMemo(() => {
    const clone = scene.clone(true) as THREE.Group;
    polishMaterials(clone);
    fitAndFrame(clone, 2.05);
    return clone;
  }, [scene]);
  const pieces = useMemo(() => collectPieces(root), [root]);

  useLayoutEffect(() => {
    animatePieces(pieces, 0, 1);
  }, [pieces]);

  useFrame((_, dt) => {
    animatePieces(pieces, progress.current, dt);
  });

  return <primitive object={root} />;
}

function StudioLights() {
  return (
    <>
      <hemisphereLight args={["#f3f6fa", "#1a1d24", 0.55]} />
      <ambientLight intensity={0.55} />
      {/* key */}
      <directionalLight
        castShadow
        position={[3.8, 5.5, 4.2]}
        intensity={2.4}
        color="#fff7ea"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      {/* fill */}
      <directionalLight position={[-4.2, 2.8, 2.2]} intensity={1.15} color="#c9d6e8" />
      {/* rim */}
      <directionalLight position={[-1.5, 3.2, -4]} intensity={1.4} color="#f0c018" />
      <spotLight
        position={[0, 6, 3]}
        angle={0.55}
        penumbra={0.8}
        intensity={1.6}
        color="#ffffff"
      />
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[0, 4, 2]}
          scale={[8, 3, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="ring"
          intensity={1.6}
          position={[0, 2, -3]}
          scale={5}
          color="#f0c018"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 1, 1]}
          scale={[3, 6, 1]}
          color="#a9c0df"
        />
      </Environment>
    </>
  );
}

function CameraRig() {
  const progress = useProgress();
  const { camera } = useThree();

  useFrame((_, dt) => {
    const p = progress.current;
    const reveal = easeOutCubic(range(p, 0.05, 0.95));
    // strong 3/4 product angle → gentle orbit as it builds
    const targetX = THREE.MathUtils.lerp(3.15, 1.55, reveal);
    const targetY = THREE.MathUtils.lerp(1.15, 0.55, reveal);
    const targetZ = THREE.MathUtils.lerp(4.35, 3.55, reveal);

    camera.position.x = damp(camera.position.x, targetX, 3.4, dt);
    camera.position.y = damp(camera.position.y, targetY, 3.4, dt);
    camera.position.z = damp(camera.position.z, targetZ, 3.4, dt);
    camera.lookAt(0, 0.05, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#151820"]} />
      <fog attach="fog" args={["#151820", 10, 22]} />
      <StudioLights />
      <CameraRig />
      <MetallicPanel />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#1b1f28" metalness={0.2} roughness={0.9} />
      </mesh>
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.65}
        scale={12}
        blur={2.2}
        far={6}
        color="#000"
      />
    </>
  );
}

useGLTF.preload("/models/mx60-duo.glb");

export default function FenceScene3D({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="absolute inset-0 bg-[#151820]" />;

  return (
    <ProgressCtx.Provider value={progressRef}>
      <Canvas
        className="absolute inset-0"
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
        }}
        camera={{ position: [3.15, 1.15, 4.35], fov: 34, near: 0.1, far: 50 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </ProgressCtx.Provider>
  );
}
