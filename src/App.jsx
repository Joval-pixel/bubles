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

    let bubbles = [];

    const load = async () => {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();

        world.removeChildren();
        bubbles = [];

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        data.forEach((g) => {
          const score = calcScore(g);
          const size = score * 1.5;

          const bubble = new PIXI.Container();

          const circle = new PIXI.Graphics();
          circle.beginFill(getColor(score));
          circle.drawCircle(0, 0, size);
          circle.endFill();

          const text = new PIXI.Text(
            `${short(g.game)}\n@${g.bestOdd}`,
            {
              fontSize: size > 80 ? 16 : 11,
              fill: "#000",
              align: "center",
              wordWrap: true,
              wordWrapWidth: size * 1.4,
            }
          );

          text.anchor.set(0.5);

          bubble.addChild(circle);
          bubble.addChild(text);

          bubble.x = centerX + (Math.random() - 0.5) * 800;
          bubble.y = centerY + (Math.random() - 0.5) * 600;

          bubble.vx = (Math.random() - 0.5) * 1.5;
          bubble.vy = (Math.random() - 0.5) * 1.5;
          bubble.size = size;

          world.addChild(bubble);
          bubbles.push(bubble);
        });
      } catch (e) {
        console.log("erro front", e);
      }
    };

    await load();
    setInterval(load, 20000);

    app.ticker.add(() => {
      bubbles.forEach((a, i) => {
        a.x += a.vx;
        a.y += a.vy;

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

  // 🔥 SCORE MELHORADO (visual bom)
  const calcScore = (g) => {
    const odd = g.bestOdd || 2;

    let score = 100 / odd;

    if (odd < 1.5) score += 40;
    if (odd > 2.5) score -= 30;

    return Math.max(20, Math.min(120, score));
  };

  const getColor = (score) => {
    if (score > 90) return 0x00ff88;
    if (score > 65) return 0x66ffcc;
    if (score > 45) return 0xffcc00;
    return 0xff4444;
  };

  const short = (t) => {
    if (!t) return "Jogo";
    return t.length > 22 ? t.slice(0, 22) + "..." : t;
  };

  return <div ref={containerRef} />;
}
