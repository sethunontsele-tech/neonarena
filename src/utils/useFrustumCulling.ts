import { useFrame, useThree } from '@react-three/fiber';
import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Frustum Culling Hook for R3F
 * @param getPosition Function to get the current position [x, y, z]
 * @param options Culling options (radius, maxDistance, checkEvery)
 * @returns boolean isVisible
 */
export function useVisibilityCulling(
  getPosition: () => [number, number, number] | null | undefined,
  options: { radius?: number; maxDistance?: number; checkEvery?: number } = {}
) {
  const { radius = 1, maxDistance = 200, checkEvery = 2 } = options;
  const [isVisible, setIsVisible] = useState(true);
  const { camera } = useThree();
  const frameCount = useRef(0);
  const frustum = useRef(new THREE.Frustum());
  const projScreenMatrix = useRef(new THREE.Matrix4());
  const sphere = useRef(new THREE.Sphere());

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % checkEvery !== 0) return;

    const pos = getPosition();
    if (!pos) {
      if (isVisible) setIsVisible(false);
      return;
    }

    // 1. Fast Distance Check
    const distSq = 
      (pos[0] - camera.position.x) ** 2 + 
      (pos[1] - camera.position.y) ** 2 + 
      (pos[2] - camera.position.z) ** 2;
    
    if (distSq > maxDistance * maxDistance) {
      if (isVisible) setIsVisible(false);
      return;
    }

    // 2. Frustum Check
    projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projScreenMatrix.current);
    
    sphere.current.center.set(pos[0], pos[1], pos[2]);
    sphere.current.radius = radius;

    const visibleNow = frustum.current.intersectsSphere(sphere.current);
    
    if (visibleNow !== isVisible) {
      setIsVisible(visibleNow);
    }
  });

  return isVisible;
}
