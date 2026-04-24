import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const app = new PIXI.Application({
      resizeTo: window,
      background: "#000",
      antialias: true,
    });

    containerRef.current.appendChild(app.view);

    // 🔥 pegar dados
    const res = await fetch("/api/games");
    const data = await res.json();

    const bubbles = data.map((g) => {
      const score = calcScore(g);
      const size = Math.max(40, score * 1.5);

      const container = new PIXI.Container();

      // círculo
      const circle = new PIXI.Graphics();
      circle.beginFill(getColor(score));
      circle.drawCircle(0, 0, size);
      circle.endFill();

      // glow
      circle.alpha = 0.9;

      // texto
      const text = new PIXI.Text(
        `${g.game}\n${g.oddHome}`,
        {
          fontSize: size > 80 ? 14 : 10,
          fill: "#000",
          align: "center",
          wordWrap: true,
          wordWrapWidth: size * 1.5,
        }
      );

      text.anchor.set(0.5);

      container.addChild(circle);
      container.addChild(text);

      container.x = Math.random() * window.innerWidth;
      container.y = Math.random() * window.innerHeight;

      container.vx = (Math.random() - 0.5) * 2;
      container.vy = (Math.random() - 0.5) * 2;
      container.size = size;

      app.stage.addChild(container);

      return container;
    });

    // 🚀 LOOP
    app.ticker.add(() => {
      bubbles.forEach((a, i) => {
        a.x += a.vx;
        a.y += a.vy;

        // parede
        if (a.x < 0 || a.x > window.innerWidth) a.vx *= -1;
        if (a.y < 0 || a.y > window.innerHeight) a.vy *= -1;

        // colisão
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) * 0.5;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.05;

            a.vx += Math.cos(angle) * force;
            a.vy += Math.sin(angle) * force;

            b.vx -= Math.cos(angle) * force;
            b.vy -= Math.sin(angle) * force;
          }
        }
      });
    });
  };

  const calcScore = (g) => {
    if (!g.oddHome) return 10;
    return Math.min(120, (1 / g.oddHome) * 120);
  };

  const getColor = (score) => {
    if (score > 80) return 0x00ff99;
    if (score > 50) return 0xffcc00;
    return 0xff4444;
  };

  return <div ref={containerRef} />;
}
