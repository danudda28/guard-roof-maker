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

import modelAsset from "@/assets/mx25-duo.glb.asset.json";

const ProgressCtx = createContext<MutableRefObject<number> | null>(null);

const MODEL_URL = modelAsset.url;

function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("ProgressCtx missing");
  return ctx;
}

function damp(n: number, t: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(n, t, lambda, dt);
}
function range(p: number, a: number, b: number) {
  return THREE.MathUtils.clamp((p - a) / Math.max(b - a, 1e-6), 0, 1);
}
function ease(t: number) {
  return 1 - (1 - t) ** 3;
}

type AnimGroup = {
  obj: THREE.Object3D;
  home: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  from: THREE.Vector3;
  start: number;
  end: number;
  side: number;
};

function applyMaterials(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    // Keep the model's own base color (RAL from the CAD export); only tune
    // the finish so it reads as coated metal under our lighting.
    const src = mesh.material as THREE.MeshStandardMaterial | undefined;
    const baseColor = src?.color ? src.color.clone() : new THREE.Color("#44322d");
    mesh.material = new THREE.MeshStandardMaterial({
      color: baseColor,
      map: src?.map ?? null,
      metalness: 0.55,
      roughness: 0.38,
      envMapIntensity: 1.25,
      side: THREE.DoubleSide,
    });
  });
}

function normalizeModel(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z, 1e-6);
  // Always fit the model to a predictable size so the camera framing holds.
  const scale = 1.35 / longest;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const c2 = box2.getCenter(new THREE.Vector3());
  root.position.set(-c2.x, -box2.min.y, -c2.z);
  root.updateMatrixWorld(true);
}

function getAnimTargets(root: THREE.Object3D): THREE.Object3D[] {
  let node = root;
  while (node.children.length === 1 && (node.children[0]?.children.length ?? 0) > 0) {
    node = node.children[0]!;
  }
  let list: THREE.Object3D[] = node.children.length ? [...node.children] : [node];

  // Expand into sub-parts until the assembly reads as many distinct pieces.
  while (list.length < 8) {
    const next = list.flatMap((o) => (o.children.length ? [...o.children] : [o]));
    if (next.length <= list.length || next.length > 40) break;
    list = next;
  }
  return list;
}

function FenceModel() {
  const progress = useProgress();
  const gltf = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);

  const { root, groups } = useMemo(() => {
    const root = gltf.scene.clone(true);
    applyMaterials(root);
    normalizeModel(root);

    const targets = getAnimTargets(root);
    const n = Math.max(targets.length, 1);
    const span = 0.34; // each piece animates over this slice of the assembly
    const groups: AnimGroup[] = targets.map((child, i) => {
      const home = child.position.clone();
      const homeQuat = child.quaternion.clone();
      const side = i % 2 === 0 ? -1 : 1;
      const k = i / n;
      // Modest explode — readable assembly, not chaos
      const from = home
        .clone()
        .add(new THREE.Vector3(side * (0.22 + k * 0.5), 0.15 + k * 0.35, 0.25 + k * 0.3));
      child.position.copy(home); // start assembled; explode only while scrolling early
      const start = k * (1 - span);
      return {
        obj: child,
        home,
        homeQuat,
        from,
        start,
        end: start + span,
        side,
      };
    });

    return { root, groups };
  }, [gltf.scene]);

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    while (g.children.length) g.remove(g.children[0]!);
    g.add(root);
  }, [root]);

  useFrame((_, dt) => {
    // 0 → ~0.55: parts fly in and lock; then hold
    const assembleP = ease(range(progress.current, 0, 0.55));
    for (const g of groups) {
      const t = ease(range(assembleP, g.start, g.end));
      g.obj.position.x = damp(g.obj.position.x, THREE.MathUtils.lerp(g.from.x, g.home.x, t), 8, dt);
      g.obj.position.y = damp(g.obj.position.y, THREE.MathUtils.lerp(g.from.y, g.home.y, t), 8, dt);
      g.obj.position.z = damp(g.obj.position.z, THREE.MathUtils.lerp(g.from.z, g.home.z, t), 8, dt);
      const twist = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          THREE.MathUtils.lerp(0.12, 0, t),
          THREE.MathUtils.lerp(g.side * 0.08, 0, t),
          0,
        ),
      );
      g.obj.quaternion.slerp(g.homeQuat.clone().premultiply(twist), 1 - Math.exp(-8 * dt));
    }
  });

  // 3/4 product angle — louvers face camera-ish
  return <group ref={groupRef} position={[0, 0, 0]} rotation={[0, -0.75, 0]} />;
}

function CameraRig() {
  const progress = useProgress();
  const { camera } = useThree();

  useFrame((_, dt) => {
    const t = ease(range(progress.current, 0, 1));
    // Eye-level product shot, pull back so nothing clips
    const x = THREE.MathUtils.lerp(1.6, 1.15, t);
    const y = THREE.MathUtils.lerp(0.72, 0.62, t);
    const z = THREE.MathUtils.lerp(3.55, 2.95, t);
    camera.position.x = damp(camera.position.x, x, 3.5, dt);
    camera.position.y = damp(camera.position.y, y, 3.5, dt);
    camera.position.z = damp(camera.position.z, z, 3.5, dt);
    camera.lookAt(0, 0.58, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 12, 26]} />
      <hemisphereLight args={["#f2f5f8", "#1a2030", 0.45]} />
      <ambientLight intensity={0.4} />
      <directionalLight castShadow position={[3.5, 5.5, 2.5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-2.5, 2, 3]} intensity={0.85} color="#c5d2e4" />
      <directionalLight position={[0.5, 2.5, -3]} intensity={1.2} color="#e8b84a" />
      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.7} />
      </Suspense>
      <CameraRig />
      <FenceModel />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.4}
        scale={7}
        blur={2.8}
        far={2.8}
        color="#000000"
      />
    </>
  );
}

useGLTF.preload(MODEL_URL);

export default function FenceScene3D({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="absolute inset-0 bg-black" />;

  return (
    <ProgressCtx.Provider value={progressRef}>
      <Canvas
        className="absolute inset-0 h-full w-full"
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ position: [1.6, 0.72, 3.55], fov: 35, near: 0.08, far: 80 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </ProgressCtx.Provider>
  );
}
