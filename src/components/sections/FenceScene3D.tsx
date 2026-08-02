import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
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

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

function range(p: number, a: number, b: number) {
  return THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Phase = "post" | "side" | "slat" | "clip" | "cap";

function classify(obj: THREE.Object3D): Phase {
  const chain: string[] = [];
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur.name) chain.push(cur.name.toLowerCase());
    cur = cur.parent;
  }
  const blob = chain.join(" ");
  if (blob.includes("capac") || blob.includes("autoforant")) return "cap";
  if (blob.includes("laterale")) return "side";
  if (blob.includes("cleme") || blob.includes("null")) return "clip";
  if (blob.includes("stalp") || blob.includes("cube")) return "post";
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

const PHASE_WINDOW: Record<Phase, { start: number; span: number }> = {
  post: { start: 0.05, span: 0.18 },
  side: { start: 0.18, span: 0.14 },
  slat: { start: 0.28, span: 0.42 },
  clip: { start: 0.55, span: 0.25 },
  cap: { start: 0.78, span: 0.12 },
};

function prepareClone(scene: THREE.Group) {
  const root = scene.clone(true);
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat) return;
        mat.metalness = 0.88;
        mat.roughness = 0.32;
        mat.envMapIntensity = 1.25;
        if (!mat.color || mat.color.getHex() === 0xffffff) {
          mat.color = new THREE.Color("#3a3f46");
        }
        mat.needsUpdate = true;
      });
    }
  });
  return root;
}

function fitRoot(root: THREE.Object3D, targetHeight = 2.35) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  const s = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(s);
  root.updateMatrixWorld(true);
  // re-center after scale
  const box2 = new THREE.Box3().setFromObject(root);
  const center2 = box2.getCenter(new THREE.Vector3());
  root.position.x -= center2.x;
  root.position.y -= center2.y;
  root.position.z -= center2.z;
  // sit on ground-ish
  const box3 = new THREE.Box3().setFromObject(root);
  root.position.y -= box3.min.y + 1.15;
  return new THREE.Box3().setFromObject(root);
}

function collectPieces(root: THREE.Object3D, phaseOverride?: Phase): Piece[] {
  const pieces: Piece[] = [];
  const byPhase: Record<Phase, number> = { post: 0, side: 0, slat: 0, clip: 0, cap: 0 };
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const phase = phaseOverride ?? classify(obj);
    pieces.push({
      obj,
      originPos: obj.position.clone(),
      originQuat: obj.quaternion.clone(),
      originScale: obj.scale.clone(),
      phase,
      order: byPhase[phase]++,
    });
  });
  return pieces;
}

function animatePieces(pieces: Piece[], p: number, dt: number) {
  const tmpEuler = new THREE.Euler();
  const tmpQuat = new THREE.Quaternion();

  for (const piece of pieces) {
    const win = PHASE_WINDOW[piece.phase];
    const countHint =
      piece.phase === "slat" ? 12 : piece.phase === "clip" ? 10 : piece.phase === "post" ? 4 : 3;
    const staggered = win.start + (piece.order % countHint) * (win.span / (countHint + 1));
    const local = easeOutCubic(range(p, staggered, staggered + win.span * 0.55));

    let ox = 0;
    let oy = 0;
    let oz = 0;
    let rx = 0;
    let ry = 0;
    let rz = 0;

    if (piece.phase === "post") {
      oy = -2.2;
      rx = 0.5;
    } else if (piece.phase === "side") {
      ox = piece.order % 2 === 0 ? -1.8 : 1.8;
      ry = piece.order % 2 === 0 ? -0.8 : 0.8;
    } else if (piece.phase === "slat") {
      oy = 2.4;
      oz = 1.4;
      rx = piece.order % 2 === 0 ? 1.4 : -1.2;
    } else if (piece.phase === "clip") {
      oz = -1.2;
      ox = (piece.order % 2 === 0 ? -1 : 1) * 0.6;
      rz = 0.9;
    } else {
      oy = 1.6;
      rx = -1.1;
    }

    const targetPos = piece.originPos
      .clone()
      .add(
        new THREE.Vector3(ox, oy, oz).multiplyScalar(1 - local),
      );
    piece.obj.position.x = damp(piece.obj.position.x, targetPos.x, 8, dt);
    piece.obj.position.y = damp(piece.obj.position.y, targetPos.y, 8, dt);
    piece.obj.position.z = damp(piece.obj.position.z, targetPos.z, 8, dt);

    tmpEuler.set(rx * (1 - local), ry * (1 - local), rz * (1 - local));
    tmpQuat.setFromEuler(tmpEuler).multiply(piece.originQuat);
    piece.obj.quaternion.slerpQuaternions(piece.obj.quaternion, tmpQuat, 1 - Math.exp(-8 * dt));

    const s = 0.2 + local * 0.8;
    piece.obj.scale.x = damp(piece.obj.scale.x, piece.originScale.x * s, 9, dt);
    piece.obj.scale.y = damp(piece.obj.scale.y, piece.originScale.y * s, 9, dt);
    piece.obj.scale.z = damp(piece.obj.scale.z, piece.originScale.z * s, 9, dt);

    piece.obj.visible = local > 0.02 || p > win.start - 0.02;
  }
}

function MetallicPanel() {
  const progress = useProgress();
  const { scene } = useGLTF("/models/mx60-duo.glb");
  const root = useMemo(() => prepareClone(scene as THREE.Group), [scene]);
  const pieces = useMemo(() => {
    fitRoot(root, 2.2);
    return collectPieces(root);
  }, [root]);

  useLayoutEffect(() => {
    // start disassembled
    animatePieces(pieces, 0, 1);
  }, [pieces]);

  useFrame((_, dt) => {
    animatePieces(pieces, progress.current, dt);
  });

  return <primitive object={root} />;
}

function Posts() {
  const progress = useProgress();
  const { scene } = useGLTF("/models/stalp.glb");
  const left = useMemo(() => prepareClone(scene as THREE.Group), [scene]);
  const right = useMemo(() => prepareClone(scene as THREE.Group), [scene]);

  const leftPieces = useMemo(() => {
    fitRoot(left, 2.55);
    left.position.x = -1.55;
    return collectPieces(left, "post");
  }, [left]);

  const rightPieces = useMemo(() => {
    fitRoot(right, 2.55);
    right.position.x = 1.55;
    return collectPieces(right, "post");
  }, [right]);

  useLayoutEffect(() => {
    animatePieces(leftPieces, 0, 1);
    animatePieces(rightPieces, 0, 1);
  }, [leftPieces, rightPieces]);

  useFrame((_, dt) => {
    const p = progress.current;
    animatePieces(leftPieces, p, dt);
    animatePieces(rightPieces, p, dt);
  });

  return (
    <>
      <primitive object={left} />
      <primitive object={right} />
    </>
  );
}

function WeldSparks() {
  const ref = useRef<THREE.Points>(null);
  const progress = useProgress();
  const positions = useMemo(() => {
    const arr = new Float32Array(36 * 3);
    let i = 0;
    for (const x of [-1.55, 0, 1.55]) {
      for (let k = 0; k < 12; k++) {
        arr[i++] = x + (Math.random() - 0.5) * 0.15;
        arr[i++] = -0.8 + Math.random() * 1.6;
        arr[i++] = (Math.random() - 0.5) * 0.2;
      }
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const local = range(progress.current, 0.86, 0.95);
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = damp(mat.opacity, local > 0 ? Math.sin(local * Math.PI) : 0, 10, dt);
    pts.rotation.y = state.clock.elapsedTime * 0.35;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f0c018"
        size={0.05}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig() {
  const progress = useProgress();
  const { camera } = useThree();

  useFrame((_, dt) => {
    const p = progress.current;
    const intro = range(p, 0, 0.2);
    const mid = range(p, 0.2, 0.75);
    const end = range(p, 0.75, 1);

    const targetX = THREE.MathUtils.lerp(1.15, -0.45, mid) + end * 0.2;
    const targetY = THREE.MathUtils.lerp(0.7, 0.2, intro) + mid * 0.08;
    const targetZ = THREE.MathUtils.lerp(6.4, 4.1, easeOutCubic(range(p, 0.05, 0.92)));

    camera.position.x = damp(camera.position.x, targetX, 3.2, dt);
    camera.position.y = damp(camera.position.y, targetY, 3.2, dt);
    camera.position.z = damp(camera.position.z, targetZ, 3.2, dt);
    camera.lookAt(0, 0.05, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#101218"]} />
      <fog attach="fog" args={["#101218", 7.5, 16]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[4.5, 6.5, 3.2]}
        intensity={1.55}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3.5, 2.2, -2]} intensity={0.5} color="#9bb0c8" />
      <spotLight
        position={[0.2, 5.2, 2.4]}
        angle={0.5}
        penumbra={0.65}
        intensity={1.15}
        color="#f0c018"
      />
      <Environment preset="city" environmentIntensity={0.5} />
      <CameraRig />
      <Posts />
      <MetallicPanel />
      <WeldSparks />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]} receiveShadow>
        <circleGeometry args={[6.2, 64]} />
        <meshStandardMaterial color="#12141a" metalness={0.35} roughness={0.88} />
      </mesh>
      <ContactShadows
        position={[0, -1.17, 0]}
        opacity={0.55}
        scale={11}
        blur={2.6}
        far={5}
        color="#000"
      />
    </>
  );
}

useGLTF.preload("/models/mx60-duo.glb");
useGLTF.preload("/models/stalp.glb");

export default function FenceScene3D({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="absolute inset-0 bg-[#101218]" />;

  return (
    <ProgressCtx.Provider value={progressRef}>
      <Canvas
        className="absolute inset-0"
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [1.15, 0.7, 6.4], fov: 36, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </ProgressCtx.Provider>
  );
}
