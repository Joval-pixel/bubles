import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    start();
  }, []);

  const start = async () => {
    const app = new PIXI.Application({
      resizeTo: window,
      background: "#000",
      antialias: true,
    });

    containerRef.current.appendChild(app.view);

    const world = new PIXI.Container();
    app.stage.addChild(world);

    // 🔥 ZOOM + DRAG
    let scale = 1;
    let dragging = false;
    let last = { x: 0, y: 0 };

    app.view.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale += e.deltaY * -0.001;
      scale = Math.max(0.5, Math.min(2.5, scale));
      world.scale.set(scale);
    });

    app.view.addEventListener("mousedown", (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
    });

    app.view.addEventListener("mouseup", () => (dragging = false));

    app.view.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      world.x += e.clientX - last.x;
      world.y += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
    });

    let bubbles = [];

    // 🚀 carregar dados
    const load = async () => {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();

        world.removeChildren();
        bubbles = [];

        data.forEach((g) => {
          const score = calcEV(g);
          const size = Math.max(30, score * 1.2);

          const container = new PIXI.Container();

          // círculo
          const circle = new PIXI.Graphics();
          circle.beginFill(getColor(score));
          circle.drawCircle(0, 0, size);
          circle.endFill();

          // texto
          const text = new PIXI.Text(
            `${shortName(g.game)}\n${g.oddHome}`,
            {
              fontSize: size > 80 ? 16 : 11,
              fill: "#000",
              align: "center",
              wordWrap: true,
              wordWrapWidth: size * 1.4,
            }
          );

          text.anchor.set(0.5);

          container.addChild(circle);
          container.addChild(text);

          container.x = Math.random() * window.innerWidth;
          container.y = Math.random() * window.innerHeight;

          container.vx = (Math.random() - 0.5) * 1.5;
          container.vy = (Math.random() - 0.5) * 1.5;
          container.size = size;

          world.addChild(container);
          bubbles.push(container);
        });
      } catch (e) {
        console.log("erro API", e);
      }
    };

    await load();
    setInterval(load, 20000); // 🔄 atualiza a cada 20s

    // 🚀 LOOP FÍSICA
    app.ticker.add(() => {
      bubbles.forEach((a, i) => {
        a.x += a.vx;
        a.y += a.vy;

        // borda infinita estilo crypto
        if (a.x < -2000) a.x = 2000;
        if (a.x > 2000) a.x = -2000;
        if (a.y < -2000) a.y = 2000;
        if (a.y > 2000) a.y = -2000;

        // colisão
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) * 0.5;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.03;

            a.vx += Math.cos(angle) * force;
            a.vy += Math.sin(angle) * force;

            b.vx -= Math.cos(angle) * force;
            b.vy -= Math.sin(angle) * force;
          }
        }
      });
    });
  };

  // 🔥 EV REAL (simples mas funcional)
  const calcEV = (g) => {
    if (!g.oddHome) return 10;

    const prob = 1 / g.oddHome;
    const ev = (prob * g.oddHome) - 1;

    return Math.max(10, ev * 120);
  };

  const getColor = (score) => {
    if (score > 80) return 0x00ff88; // verde
    if (score > 40) return 0xffcc00; // amarelo
    return 0xff4444; // vermelho
  };

  const shortName = (name) => {
    if (!name) return "Jogo";
    return name.length > 20 ? name.slice(0, 20) + "..." : name;
  };

  return <div ref={containerRef} />;
}
