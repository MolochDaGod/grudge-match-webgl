'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Tower, TowerAbility } from '@/types/TowerDefense';

interface TowerRendererProps {
  tower: Tower;
  size?: { width: number; height: number };
  interactive?: boolean;
  showRange?: boolean;
  animationState?: 'idle' | 'attacking' | 'upgrading' | 'destroyed';
  className?: string;
}

interface TowerMeshProps {
  tower: Tower;
  animationState: 'idle' | 'attacking' | 'upgrading' | 'destroyed';
  showRange: boolean;
}

function TowerMesh({ tower, animationState, showRange }: TowerMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const particleSystemRef = useRef<THREE.Points>(null!);
  const rangeIndicatorRef = useRef<THREE.Mesh>(null!);
  
  const { geometry, material, rangeGeometry, particles } = useMemo(() => {
    const visual = tower.visualData;
    
    // Create geometry based on tower type
    let geometry: THREE.BufferGeometry;
    switch (visual.geometry?.baseShape) {
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          visual.geometry.radius,
          visual.geometry.radius,
          visual.geometry.height,
          visual.geometry.segments
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          visual.geometry.radius,
          visual.geometry.segments,
          visual.geometry.segments / 2
        );
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(
          visual.geometry.radius * 2,
          visual.geometry.height,
          visual.geometry.radius * 2
        );
        break;
      default:
        geometry = new THREE.CylinderGeometry(20, 20, 50, 16);
    }
    
    // Create material with tower colors
    const material = new THREE.MeshPhongMaterial({
      color: visual.baseColor,
      specular: visual.accentColor,
      emissive: visual.effectColor,
      emissiveIntensity: 0.1,
      shininess: 30
    });
    
    // Add wireframe overlay for accent color
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: visual.accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    // Range indicator geometry
    const rangeGeometry = new THREE.RingGeometry(
      tower.stats.range - 2,
      tower.stats.range,
      32
    );
    rangeGeometry.rotateX(-Math.PI / 2); // Lay flat on ground
    
    // Particle system for effects
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions around the tower
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (visual.geometry?.radius || 20) + 10;
      const height = Math.random() * (visual.geometry?.height || 50) + 10;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Color based on tower effect color
      const color = new THREE.Color(visual.effectColor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 5 + 2;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return {
      geometry,
      material: [material, wireframeMaterial],
      rangeGeometry,
      particles: particleGeometry
    };
  }, [tower]);
  
  // Animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const animation = tower.visualData.animations[animationState];
    
    if (animation && animation.keyframes.length > 0) {
      // Simple linear interpolation between keyframes
      const duration = animation.duration / 1000; // Convert to seconds
      const normalizedTime = (time % duration) / duration;
      
      // Find current and next keyframes
      const currentKeyframe = animation.keyframes.find((kf, i) => 
        i === animation.keyframes.length - 1 || 
        animation.keyframes[i + 1].time > normalizedTime
      );
      
      if (currentKeyframe) {
        if (currentKeyframe.rotation) {
          meshRef.current.rotation.set(
            currentKeyframe.rotation.x,
            currentKeyframe.rotation.y + time * 0.1, // Add slight continuous rotation
            currentKeyframe.rotation.z
          );
        }
        
        if (currentKeyframe.scale) {
          meshRef.current.scale.set(
            currentKeyframe.scale.x,
            currentKeyframe.scale.y,
            currentKeyframe.scale.z
          );
        }
        
        if (currentKeyframe.position) {
          meshRef.current.position.set(
            currentKeyframe.position.x,
            currentKeyframe.position.y,
            currentKeyframe.position.z
          );
        }
      }
    } else {
      // Default idle animation
      meshRef.current.rotation.y = time * 0.1;
    }
    
    // Animate particles if present
    if (particleSystemRef.current && tower.visualData.particles.auraEffect) {
      const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 2 + i) * 0.5;
      }
      
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      particleSystemRef.current.rotation.y = time * 0.2;
    }
    
    // Range indicator visibility and animation
    if (rangeIndicatorRef.current) {
      rangeIndicatorRef.current.visible = showRange;
      if (showRange) {
        const material = rangeIndicatorRef.current.material as THREE.MeshBasicMaterial;
        if (material && 'opacity' in material) {
          material.opacity = 0.3 + Math.sin(time * 3) * 0.1;
        }
      }
    }
  });
  
  return (
    <group>
      {/* Main tower mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      
      {/* Range indicator */}
      <mesh
        ref={rangeIndicatorRef}
        geometry={rangeGeometry}
        visible={showRange}
      >
        <meshBasicMaterial
          color={tower.visualData.accentColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particle effects */}
      {tower.visualData.particles.auraEffect && (
        <points ref={particleSystemRef} geometry={particles}>
          <pointsMaterial
            size={3}
            vertexColors
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Additional visual effects based on abilities */}
      {tower.abilities.map((ability, index) => (
        <AbilityEffectRenderer
          key={ability.id}
          ability={ability}
          tower={tower}
          index={index}
        />
      ))}
    </group>
  );
}

interface AbilityEffectRendererProps {
  ability: TowerAbility;
  tower: Tower;
  index: number;
}

function AbilityEffectRenderer({ ability, tower }: AbilityEffectRendererProps) {
  const effectRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!effectRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const isOnCooldown = (time * 1000 - ability.lastUsed) < ability.cooldown;
    
    // Show different effects based on ability type
    switch (ability.effect.type) {
      case 'slow':
        // Temporal distortion effect
        effectRef.current.visible = isOnCooldown;
        if (isOnCooldown) {
          effectRef.current.rotation.z = time * 2;
          effectRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
        }
        break;
        
      case 'chain':
        // Lightning effect
        effectRef.current.visible = isOnCooldown;
        if (isOnCooldown) {
          const material = effectRef.current.material as THREE.MeshBasicMaterial;
          if (material && 'opacity' in material) {
            material.opacity = Math.random() * 0.8 + 0.2;
          }
        }
        break;
    }
  });
  
  if (ability.effect.type === 'slow') {
    return (
      <mesh ref={effectRef} position={[0, tower.visualData.geometry?.height || 50, 0]}>
        <ringGeometry args={[15, 20, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }
  
  if (ability.effect.type === 'chain') {
    return (
      <mesh ref={effectRef} position={[0, (tower.visualData.geometry?.height || 50) / 2, 0]}>
        <sphereGeometry args={[5, 8, 8]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.7}
        />
      </mesh>
    );
  }
  
  return null;
}

function SceneSetup() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    scene.add(ambientLight);
    scene.add(directionalLight);
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    return () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(ground);
    };
  }, [scene]);
  
  return null;
}

export default function TowerRenderer({
  tower,
  size = { width: 400, height: 300 },
  interactive = true,
  showRange = false,
  animationState = 'idle',
  className = ''
}: TowerRendererProps) {
  return (
    <div 
      className={`tower-renderer ${className}`}
      style={{ width: size.width, height: size.height }}
    >
      <Canvas
        shadows
        camera={{ position: [50, 50, 50], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneSetup />
        
        <TowerMesh
          tower={tower}
          animationState={animationState}
          showRange={showRange}
        />
        
        {interactive && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={200}
            target={[0, 25, 0]}
          />
        )}
      </Canvas>
      
      {/* Tower info overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
        <div className="font-bold">{tower.name}</div>
        <div className="text-xs opacity-75">{tower.type.toUpperCase()}</div>
        <div className="text-xs">
          DMG: {Math.floor(tower.stats.damage)} | 
          RNG: {Math.floor(tower.stats.range)} | 
          SPD: {tower.stats.fireRate.toFixed(1)}/s
        </div>
        {tower.abilities.length > 0 && (
          <div className="text-xs mt-1">
            Abilities: {tower.abilities.length}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility component for rendering multiple towers
export function TowerGrid({ towers, onTowerSelect, selectedTower }: {
  towers: Tower[];
  onTowerSelect?: (tower: Tower) => void;
  selectedTower?: Tower | null;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {towers.map((tower) => (
        <div
          key={tower.id}
          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedTower?.id === tower.id
              ? 'border-blue-500 shadow-lg transform scale-105'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onTowerSelect?.(tower)}
        >
          <TowerRenderer
            tower={tower}
            size={{ width: 200, height: 150 }}
            interactive={false}
            showRange={selectedTower?.id === tower.id}
          />
        </div>
      ))}
    </div>
  );
}