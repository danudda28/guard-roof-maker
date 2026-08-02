import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
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

const BAYS = 3;
const SLATS = 9;
const POST_X = [-2.55, -0.85, 0.85, 2.55];
const BAY_WIDTH = 1.55;
const FENCE_H = 2.35;
const SLAT_H = 0.18;
const SLAT_GAP = 0.045;

function MetalMaterial({ map }: { map: THREE.Texture }) {
  return (
    <meshStandardMaterial
      map={map}
      color="#c8ccd1"
      metalness={0.92}
      roughness={0.28}
      envMapIntensity={1.35}
    />
  );
}

function Post({
  x,
  index,
  map,
}: {
  x: number;
  index: number;
  map: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const progress = useProgress();

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const p = progress.current;
    const local = easeOutCubic(range(p, 0.06 + index * 0.04, 0.22 + index * 0.04));
    g.position.y = damp(g.position.y, -1.15 + local * 1.15, 6, dt);
    g.rotation.x = damp(g.rotation.x, (1 - local) * 0.35, 7, dt);
    g.scale.setScalar(damp(g.scale.x, 0.15 + local * 0.85, 8, dt));
  });

  return (
    <group ref={ref} position={[x, -1.15, 0]} scale={0.15}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.14, FENCE_H, 0.14]} />
        <MetalMaterial map={map} />
      </mesh>
      <mesh position={[0, FENCE_H / 2 + 0.03, 0]} castShadow>
        <boxGeometry args={[0.16, 0.06, 0.16]} />
        <meshStandardMaterial color="#f0c018" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Rail({
  bay,
  y,
  side,
  map,
}: {
  bay: number;
  y: number;
  side: "top" | "bottom";
  map: THREE.Texture;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useProgress();
  const x0 = POST_X[bay]!;
  const x1 = POST_X[bay + 1]!;
  const cx = (x0 + x1) / 2;
  const fromX = side === "top" ? -4.5 : 4.5;

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const p = progress.current;
    const start = 0.24 + bay * 0.035 + (side === "bottom" ? 0.02 : 0);
    const local = easeOutCubic(range(p, start, start + 0.12));
    m.position.x = damp(m.position.x, THREE.MathUtils.lerp(fromX, cx, local), 7, dt);
    m.position.z = damp(m.position.z, (1 - local) * (side === "top" ? 0.8 : -0.8), 7, dt);
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.opacity = damp(mat.opacity, local, 10, dt);
  });

  return (
    <mesh ref={ref} position={[fromX, y, 0]} castShadow>
      <boxGeometry args={[BAY_WIDTH - 0.12, 0.07, 0.08]} />
      <meshStandardMaterial
        map={map}
        color="#b8bcc2"
        metalness={0.9}
        roughness={0.3}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

function Slat({
  bay,
  index,
  map,
}: {
  bay: number;
  index: number;
  map: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const progress = useProgress();
  const x0 = POST_X[bay]!;
  const x1 = POST_X[bay + 1]!;
  const cx = (x0 + x1) / 2;
  const y = -FENCE_H / 2 + 0.28 + index * (SLAT_H + SLAT_GAP) + SLAT_H / 2;
  const start = 0.38 + (bay * SLATS + index) * 0.012;

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const p = progress.current;
    const local = easeOutCubic(range(p, start, start + 0.1));
    const spin = (1 - local) * (index % 2 === 0 ? 1.2 : -1.2);
    g.position.y = damp(g.position.y, THREE.MathUtils.lerp(y + 2.4, y, local), 8, dt);
    g.position.z = damp(g.position.z, THREE.MathUtils.lerp(1.6, 0, local), 8, dt);
    g.rotation.x = damp(g.rotation.x, THREE.MathUtils.lerp(spin, -0.32, local), 8, dt);
    g.rotation.z = damp(g.rotation.z, (1 - local) * 0.25, 8, dt);
    g.scale.x = damp(g.scale.x, 0.2 + local * 0.8, 9, dt);
  });

  return (
    <group ref={ref} position={[cx, y + 2.4, 1.6]} scale={[0.2, 1, 1]}>
      <mesh castShadow receiveShadow rotation={[0.15, 0, 0]}>
        <boxGeometry args={[BAY_WIDTH - 0.22, SLAT_H, 0.085]} />
        <MetalMaterial map={map} />
      </mesh>
      <mesh position={[0, 0.02, 0.035]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[BAY_WIDTH - 0.24, 0.05, 0.04]} />
        <meshStandardMaterial
          map={map}
          color="#d0d4d9"
          metalness={0.95}
          roughness={0.22}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

function WeldSparks() {
  const ref = useRef<THREE.Points>(null);
  const progress = useProgress();
  const positions = useMemo(() => {
    const arr = new Float32Array(48 * 3);
    let i = 0;
    for (const x of POST_X.slice(0, 3)) {
      for (let k = 0; k < 8; k++) {
        arr[i++] = x + 0.08;
        arr[i++] = -0.9 + Math.random() * 1.8;
        arr[i++] = 0.08;
      }
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const p = progress.current;
    const local = range(p, 0.86, 0.94);
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = damp(mat.opacity, local > 0 ? Math.sin(local * Math.PI) : 0, 10, dt);
    pts.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f0c018"
        size={0.06}
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

    const targetX = THREE.MathUtils.lerp(0.9, -0.35, mid) + end * 0.15;
    const targetY = THREE.MathUtils.lerp(0.55, 0.15, intro) + mid * 0.05;
    const targetZ = THREE.MathUtils.lerp(7.2, 4.6, easeOutCubic(range(p, 0.05, 0.9)));

    camera.position.x = damp(camera.position.x, targetX, 3.5, dt);
    camera.position.y = damp(camera.position.y, targetY, 3.5, dt);
    camera.position.z = damp(camera.position.z, targetZ, 3.5, dt);
    camera.lookAt(0, 0.05, 0);
  });

  return null;
}

function FenceModel() {
  const map = useLoader(THREE.TextureLoader, "/images/produs-garduri.webp");
  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1.2, 1.2);
    map.anisotropy = 8;
  }, [map]);

  return (
    <group>
      {POST_X.map((x, i) => (
        <Post key={`post-${x}`} x={x} index={i} map={map} />
      ))}
      {Array.from({ length: BAYS }).map((_, bay) => (
        <group key={`bay-${bay}`}>
          <Rail bay={bay} y={0.95} side="top" map={map} />
          <Rail bay={bay} y={-0.95} side="bottom" map={map} />
          {Array.from({ length: SLATS }).map((__, s) => (
            <Slat key={`slat-${bay}-${s}`} bay={bay} index={s} map={map} />
          ))}
        </group>
      ))}
      <WeldSparks />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]} receiveShadow>
        <circleGeometry args={[6.5, 64]} />
        <meshStandardMaterial color="#12141a" metalness={0.4} roughness={0.85} />
      </mesh>
      <ContactShadows
        position={[0, -1.17, 0]}
        opacity={0.55}
        scale={12}
        blur={2.8}
        far={5}
        color="#000"
      />
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#101218"]} />
      <fog attach="fog" args={["#101218", 8, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.6}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#8aa0c0" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.55}
        penumbra={0.6}
        intensity={1.1}
        color="#f0c018"
      />
      <Environment preset="city" environmentIntensity={0.45} />
      <CameraRig />
      <FenceModel />
    </>
  );
}

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
        camera={{ position: [0.9, 0.55, 7.2], fov: 38, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </ProgressCtx.Provider>
  );
}
