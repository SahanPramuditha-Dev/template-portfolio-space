import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const DisposeOnUnmount = () => {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      try {
        // Best-effort cleanup of renderer and GPU resources
        gl.renderLists?.dispose?.();
        gl.dispose?.();

        // Attempt official context loss extension
        const ctx = gl.getContext && gl.getContext();
        const ext = ctx && ctx.getExtension && ctx.getExtension('WEBGL_lose_context');
        ext?.loseContext?.();

        // Fallback for implementations exposing forceContextLoss
        if (typeof gl.forceContextLoss === 'function') {
          gl.forceContextLoss();
        }
      } catch (e) {
        // swallow cleanup errors
      }
    };
  }, [gl]);

  return null;
};

export default DisposeOnUnmount;
