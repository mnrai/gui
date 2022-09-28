import * as React from "react";


import { animated, useSpring } from "@react-spring/web";


const Container: React.FC<{children:any, isVisible:boolean}> = ({children, isVisible}) => {
  const styles = useSpring({
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? "all" : "none",
    height: isVisible ? "auto" : 0,
    color: "#232129",
    paddingBottom: isVisible ?40:0,
    maxWidth: 780,
    fontFamily: "Roboto, sans-serif, serif",
  });
  // @ts-ignore
  return <animated.div style={styles}>
    {children}
    </animated.div>;
};

export  {Container}

