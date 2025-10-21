import  { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children, containerId = "portal-root" }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement("div");
      el.id = containerId;
      document.body.appendChild(el);
    }
    setContainer(el);

    // cleanup optional
    return () => {
      // document.body.removeChild(el);
    };
  }, [containerId]);

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
