// The sky behind the whole page. It's fixed to the screen, so the forecast "sheet"
// slides up over it when you scroll. It follows the real weather and time of day.
//
// The clouds and sun are drawn with WebGL (lib/cloudShader.js): perspective cloud
// layers, lit by the sun, with darker undersides. Rain, snow, fog, the storm flash,
// stars and the moon are CSS layers on top (see sky.css). If WebGL isn't
// available, simple CSS clouds are shown instead, so the page always works.
import { useEffect, useRef, useState } from "react";
import { LOOKS, VERTEX, fragment, hexToVec } from "../lib/cloudShader.js";

// Fallback CSS cloud slots: [top in vh, width in px, seconds to cross, start 0–1, depth].
const SLOTS = [
  [7, 170, 150, 0.15, "far"], [15, 240, 190, 0.6, "far"], [24, 140, 130, 0.85, "far"],
  [32, 260, 210, 0.38, "far"], [50, 360, 95, 0.25, "near"], [58, 460, 120, 0.72, "near"],
  [66, 320, 85, 0.5, "near"], [44, 400, 140, 0.95, "near"], [74, 520, 110, 0.05, "near"],
];
const USE = {
  clear: [0, 2], partly: [0, 1, 2, 4, 5, 6], overcast: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  rain: [0, 1, 2, 3, 4, 5, 6, 7, 8], storm: [0, 1, 2, 3, 4, 5, 6, 7, 8], snow: [0, 1, 3, 4, 5, 7], fog: [1, 3],
};

// Sets up WebGL once. Returns null if the browser can't do it.
function createRenderer(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return null;
  const high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, fragment(high && high.precision > 0 ? "highp" : "mediump"));
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // One triangle that covers the whole screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ["uRes", "uTime", "uCover", "uDark", "uTop", "uHor", "uLit", "uShade", "uSun", "uSunOn", "uHorizon"].forEach(
    (name) => (u[name] = gl.getUniformLocation(prog, name))
  );
  return { gl, u };
}

export function Sky({ group = "overcast", night = false, loading = false }) {
  const canvasRef = useRef(null);
  const renderer = useRef(undefined); // undefined = not tried yet, null = no WebGL
  const [webgl, setWebgl] = useState(true);

  // If the graphics card drops the context (can happen on phones in the
  // background), fall back to the CSS sky instead of showing a blank canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const onLost = (e) => {
      e.preventDefault();
      renderer.current = null;
      setWebgl(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, []);

  useEffect(() => {
    if (renderer.current === undefined) renderer.current = createRenderer(canvasRef.current);
    const r = renderer.current;
    if (!r || !webgl) {
      setWebgl(false);
      return;
    }
    const { gl, u } = r;
    const canvas = canvasRef.current;
    const look = LOOKS[night ? `n-${group}` : group] ?? LOOKS.overcast;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    // Draw at a reduced size and let CSS scale it up: clouds are soft, so it
    // looks the same and costs far less (important on phones).
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(0.75, 900 / Math.max(w, h));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = w / h;
      const phone = w < 768;
      // Sun beside the temperature on phones; on wider screens in the open middle of
      // the sky, away from the text on the left and the facts on the right.
      const sx = phone ? 0.84 : 0.58;
      const sy = phone ? 0.33 : 0.2;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform2f(u.uSun, (sx - 0.5) * aspect, 0.5 - sy);
    };

    gl.uniform3fv(u.uTop, hexToVec(look.top));
    gl.uniform3fv(u.uHor, hexToVec(look.hor));
    gl.uniform3fv(u.uLit, hexToVec(look.lit));
    gl.uniform3fv(u.uShade, hexToVec(look.shade));
    gl.uniform1f(u.uCover, look.cover);
    gl.uniform1f(u.uDark, look.dark);
    gl.uniform1f(u.uSunOn, look.sun);
    gl.uniform1f(u.uHorizon, -0.32); // horizon low on the screen, behind the sheet

    const draw = (now) => {
      gl.uniform1f(u.uTime, 30 + (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30 frames a second is plenty for drifting clouds
      last = now;
      draw(now);
    };

    resize();
    if (reduce) draw(start);
    else raf = requestAnimationFrame(loop);
    const onResize = () => {
      resize();
      if (reduce) draw(start);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [group, night, webgl]);

  const clear = group === "clear" || group === "partly";
  const slots = webgl ? [] : (USE[group] ?? USE.overcast).map((i) => SLOTS[i]);

  return (
    <div
      className="sky"
      data-group={group}
      data-night={night || undefined}
      data-loading={loading || undefined}
      data-webgl={webgl || undefined}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="sky-canvas" hidden={!webgl} />
      {night && clear && <div className="sky-stars" />}
      {night && group === "clear" && <div className="sky-shoot" />}
      {!webgl && !night && clear && <div className="sky-sun" />}
      {night && clear && <div className="sky-moon" />}

      {slots.map(([top, w, dur, start, depth]) => (
        <div
          key={`${top}-${w}`}
          className={`cloud cloud-${depth}`}
          style={{ "--top": `${top}vh`, "--w": `${w}px`, "--dur": `${dur}s`, "--start": start }}
        />
      ))}

      {group === "fog" && (
        <>
          <div className="sky-fog sky-fog-1" />
          <div className="sky-fog sky-fog-2" />
          <div className="sky-fog sky-fog-3" />
        </>
      )}
      {(group === "rain" || group === "storm") && (
        <>
          <div className="sky-rain sky-rain-far" />
          <div className="sky-rain" />
        </>
      )}
      {group === "storm" && <div className="sky-flash" />}
      {group === "snow" && (
        <>
          <div className="sky-snow sky-snow-1" />
          <div className="sky-snow sky-snow-2" />
        </>
      )}
      <div className="sky-scrim" />
    </div>
  );
}
