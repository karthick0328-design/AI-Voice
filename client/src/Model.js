import { useGLTF, useAnimations } from "@react-three/drei";
import React, { useRef, useEffect } from "react";

function BoyModel({ animation, onAvatarClick }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/model/animatedModel.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => a.stop());

    let target = null;
    if (animation === "wave" || animation === "hello" || animation === "hello.001") {
      target = actions["hello"] || actions["hello.001"] || actions["Armature|mixamo.com|Layer0.005 Retarget"];
    } else if (animation === "speaking" || animation?.includes("Layer") || animation === "thinking.001") {
      target = actions["Armature|mixamo.com|Layer0.005 Retarget"] || actions["thinking"];
    } else {
      target = actions["idel Retarget"] || actions["idel"] || Object.values(actions)[0];
    }

    if (target) {
      target.reset().fadeIn(0.3).play();
    }
  }, [animation, actions]);

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onAvatarClick) onAvatarClick();
  };

  return (
    <group 
      ref={group}
      position={[0, -1.05, 0]}
      onClick={handleClick}
      onPointerDown={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={scene} scale={1.3} rotation={[0, 0, 0]} />
      {/* Invisible broad hitbox for 100% reliable click & tap detection */}
      <mesh position={[0, 1.0, 0]} onClick={handleClick} onPointerDown={handleClick} visible={false}>
        <boxGeometry args={[1.5, 2.2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function GirlModel({ animation, onAvatarClick }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/model/animatedModel2.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => a.stop());
    
    let target = null;
    if (animation === "hello" || animation === "wave" || animation === "hello.001") {
      target = actions["hello.001"] || actions["Armature|mixamo.com|Layer0.005 Retarget"];
    } else if (animation === "speaking" || animation?.includes("Layer") || animation === "thinking.001") {
      target = actions["Armature|mixamo.com|Layer0.005 Retarget"] || actions["thinking.001"];
    } else {
      target = actions["idel Retarget.001"] || actions["idel.001"] || Object.values(actions)[0];
    }
    
    if (target) {
      target.reset().fadeIn(0.3).play();
    }
  }, [animation, actions]);

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onAvatarClick) onAvatarClick();
  };

  return (
    <group 
      ref={group}
      position={[0, -1.05, 0]}
      onClick={handleClick}
      onPointerDown={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={scene} scale={1.35} rotation={[0, 0, 0]} />
      {/* Invisible broad hitbox for 100% reliable click & tap detection */}
      <mesh position={[0, 1.0, 0]} onClick={handleClick} onPointerDown={handleClick} visible={false}>
        <boxGeometry args={[1.5, 2.2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function Model({ animation, avatarType = "boy", onAvatarClick }) {
  return avatarType === "boy" ? (
    <BoyModel animation={animation} onAvatarClick={onAvatarClick} />
  ) : (
    <GirlModel animation={animation} onAvatarClick={onAvatarClick} />
  );
}

useGLTF.preload("/model/animatedModel.glb");
useGLTF.preload("/model/animatedModel2.glb");
