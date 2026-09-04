import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CyberCompanion({ aiState = 'IDLE' }) {
  const groupRef = useRef();
  const innerCoreRef = useRef();
  const outerRing1Ref = useRef();
  const outerRing2Ref = useRef();
  const radarSweepRef = useRef();
  const particlesRef = useRef();
  const visorRef = useRef();

  // Color mapping based on AI state
  const stateColors = {
    IDLE: { core: '#00f0ff', ring: '#0284c7', glow: '#00f0ff', intensity: 1.2 },
    LISTENING: { core: '#38bdf8', ring: '#0284c7', glow: '#38bdf8', intensity: 2.0 },
    THINKING: { core: '#a855f7', ring: '#7c3aed', glow: '#c084fc', intensity: 2.2 },
    SEARCHING: { core: '#06b6d4', ring: '#0891b2', glow: '#22d3ee', intensity: 2.5 },
    EXECUTING: { core: '#f59e0b', ring: '#d97706', glow: '#fbbf24', intensity: 2.6 },
    SPEAKING: { core: '#10b981', ring: '#059669', glow: '#34d399', intensity: 2.4 },
    SUCCESS: { core: '#10b981', ring: '#047857', glow: '#6ee7b7', intensity: 3.0 },
    ERROR: { core: '#ef4444', ring: '#b91c1c', glow: '#f87171', intensity: 3.0 }
  };

  const currentColor = stateColors[aiState] || stateColors.IDLE;

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Overall subtle levitation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.12;
      groupRef.current.rotation.y += 0.003;
    }

    // 2. Inner Core Pulsing
    if (innerCoreRef.current) {
      let pulseSpeed = 2.0;
      let pulseAmp = 0.05;

      if (aiState === 'THINKING') {
        pulseSpeed = 6.0;
        pulseAmp = 0.12;
      } else if (aiState === 'SPEAKING') {
        pulseSpeed = 8.0;
        pulseAmp = 0.15;
      } else if (aiState === 'LISTENING') {
        pulseSpeed = 4.0;
        pulseAmp = 0.08;
      }

      const scale = 1 + Math.sin(time * pulseSpeed) * pulseAmp;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }

    // 3. Orbital Rings Rotation
    if (outerRing1Ref.current) {
      let ringSpeed = 0.8;
      if (aiState === 'THINKING' || aiState === 'EXECUTING') ringSpeed = 3.2;
      if (aiState === 'SEARCHING') ringSpeed = 2.2;
      outerRing1Ref.current.rotation.x += delta * ringSpeed;
      outerRing1Ref.current.rotation.y += delta * (ringSpeed * 0.7);
    }

    if (outerRing2Ref.current) {
      let ringSpeed = 0.6;
      if (aiState === 'THINKING' || aiState === 'EXECUTING') ringSpeed = 2.5;
      outerRing2Ref.current.rotation.y -= delta * ringSpeed;
      outerRing2Ref.current.rotation.z += delta * (ringSpeed * 0.9);
    }

    // 4. Radar Sweep for SEARCHING state
    if (radarSweepRef.current) {
      if (aiState === 'SEARCHING') {
        radarSweepRef.current.visible = true;
        radarSweepRef.current.rotation.z += delta * 4.0;
        radarSweepRef.current.scale.setScalar(1.2 + Math.sin(time * 3) * 0.3);
      } else {
        radarSweepRef.current.visible = false;
      }
    }

    // 5. Visor / Speaking Waveform displacement
    if (visorRef.current) {
      if (aiState === 'SPEAKING') {
        const speakFactor = 1 + Math.sin(time * 15) * 0.25;
        visorRef.current.scale.y = speakFactor;
      } else {
        visorRef.current.scale.y = 1;
      }
    }

    // 6. Nebula particles drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05;
    }
  });

  // Generate particle positions
  const particleCount = 100;
  const particlePositions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.4 + Math.random() * 0.9;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Cybernetic Spherical Head */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[0.75, 48, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.15}
          metalness={0.9}
          emissive={currentColor.core}
          emissiveIntensity={currentColor.intensity * 0.4}
        />
      </mesh>

      {/* Cybernetic Visor / Eye Interface */}
      <mesh ref={visorRef} position={[0, 0.05, 0.65]}>
        <boxGeometry args={[0.7, 0.16, 0.22]} />
        <meshStandardMaterial
          color={currentColor.glow}
          emissive={currentColor.glow}
          emissiveIntensity={currentColor.intensity * 1.5}
          roughness={0.1}
          metalness={0.2}
          wireframe={aiState === 'EXECUTING'}
        />
      </mesh>

      {/* Primary Orbital Ring */}
      <mesh ref={outerRing1Ref}>
        <torusGeometry args={[1.15, 0.035, 16, 64]} />
        <meshStandardMaterial
          color={currentColor.ring}
          emissive={currentColor.ring}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Secondary Diagonal Orbital Ring */}
      <mesh ref={outerRing2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.35, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={currentColor.ring}
          emissive={currentColor.ring}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Radar Scanner Ring (Active in SEARCHING) */}
      <mesh ref={radarSweepRef} visible={false}>
        <ringGeometry args={[0.9, 1.4, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* Dynamic Particle Nebula */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={currentColor.glow}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dynamic Internal Light */}
      <pointLight
        color={currentColor.glow}
        intensity={currentColor.intensity * 3}
        distance={5}
      />
    </group>
  );
}
