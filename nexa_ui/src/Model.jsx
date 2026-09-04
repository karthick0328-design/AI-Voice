import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect } from "react";

  
export default function Model({ animation }) {
  const group = useRef();

  const { scene, animations } = useGLTF("/model/animatedModel2.glb");
  const { actions } = useAnimations(animations, group);

useEffect(() => {
  
  if (!actions || !animation) return;
// console.log(Object.keys(actions));

 Object.values(actions).forEach((action) => {
      action.stop();
    });

  const current = actions[animation];
  if (current) {
    current.reset().fadeIn(.5).play();
  }

}, [animation,actions]);


  return <primitive ref={group} object={scene}  scale={3}  position={[0, -2, 0.5]}/>;
}