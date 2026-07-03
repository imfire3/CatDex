import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CatModelId } from '@catdex/shared';
import { getModelColors } from '../constants/api';

interface StylizedCatMeshProps {
  modelId: CatModelId;
  scale?: number;
  autoRotate?: boolean;
}

function StylizedCatMesh({ modelId, scale = 1, autoRotate = true }: StylizedCatMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = getModelColors(modelId);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  const bodyColor = colors.primaryColor;
  const accent = colors.secondaryColor;
  const belly = colors.accentColor;
  const isLongHair = colors.furLength === 'long';

  return (
    <group ref={groupRef} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, -0.1, 0.2]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={belly} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.55, 0.15]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.22, 0.85, 0.1]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.12, 0.22, 4]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0.22, 0.85, 0.1]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.12, 0.22, 4]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.14, 0.6, 0.42]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#2ecc71" emissive="#1a8a4a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.14, 0.6, 0.42]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#2ecc71" emissive="#1a8a4a" emissiveIntensity={0.3} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.48, 0.48]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#e94560" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.1, -0.55]} rotation={[0.5, 0, 0]}>
        <capsuleGeometry args={[0.06, isLongHair ? 0.7 : 0.45, 4, 8]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-0.25, -0.45, 0.2], [0.25, -0.45, 0.2], [-0.25, -0.45, -0.15], [0.25, -0.45, -0.15]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      ))}
      {/* Pattern overlays */}
      {colors.pattern === 'tabby' && (
        <mesh position={[0, 0.3, 0.45]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      )}
      {colors.pattern === 'calico' && (
        <>
          <mesh position={[-0.2, 0.2, 0.4]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          <mesh position={[0.2, 0.35, 0.35]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
        </>
      )}
      {colors.pattern === 'tuxedo' && (
        <mesh position={[0, 0.1, 0.35]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
      )}
    </group>
  );
}

interface Cat3DAvatarProps {
  modelId: CatModelId;
  size?: number;
  autoRotate?: boolean;
  goldenAura?: boolean;
}

export function Cat3DAvatar({ modelId, size = 120, autoRotate = true, goldenAura = false }: Cat3DAvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, goldenAura && styles.goldenAura]}>
      <Canvas camera={{ position: [0, 0.3, 2.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <pointLight position={[-2, 1, 1]} intensity={0.4} color="#f39c12" />
        <StylizedCatMesh modelId={modelId} scale={1.2} autoRotate={autoRotate} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  goldenAura: {
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#ffd70055',
  },
});
