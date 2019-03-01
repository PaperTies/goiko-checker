import React, { useState } from "react";
import "./styles.css";
import "../styles/fadeIn.css";
import "../styles/fadeOut.css";

export default function StatusGif({ src, placeholderSrc, size }) {
  const [loaded, setLoaded] = useState(false);

  const className = `${size ? " status-image__size-" + size : ""}`;

  return (
    <div className="status-image__wrapper">
      <img
        src={placeholderSrc}
        className={`status-image__placeholder ${className}${loaded &&
          " hidden fade-out"}`}
      />
      <img
        src={src}
        className={`status-image ${className} fade-in`}
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </div>
  );
}
