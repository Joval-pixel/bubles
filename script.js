/**************** BUBLES — script.js (ANTI-TRAVAMENTO HARD) ****************
 * Proteções:
 *  - AbortController com timeout em TODAS as chamadas à Brapi
 *  - Retry 1x e fallback mock garantido
 *  - Watchdog: se não desenhar nada em 3.5s => cria mock na hora
 *************************************************************************/

console.log("Bubles JS – v2025‑08‑14b watchdog");

const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints||0)>0;
const TOP_N = IS_MOBILE ? 35 : 200;

/* Física (mobile mais suave) */
const DEFAULT_HEADER_SAFE = 84;
const WALL_MARGIN      = IS_MOBILE ? 18 : 10;
const FRICTION         = IS_MOBILE ? 0.998 : 0.985;
const MAX_SPEED        = IS_MOBILE ? 0.12  : 0.90;
const START_VEL        = IS_MOBILE ? 0.05  : 0.45;
const REPULSE_COLLIDE  = IS_MOBILE ? 0.55  : 0.40;
const BORDER_WIDTH     = 2.5;
const COLLISION_PASSES = IS_MOBILE ? 5 : 1;

const MAX_RADIUS_BASE  = IS_MOBILE ? 46 : 80;
const SOFT_REPULSE_STRENGTH = IS_MOBILE ? 0.005 : 0.0035;
const NEIGHBOR_RANGE_MULT   = 1.7;
const CENTER_HOLE_RADIUS_FACTOR = IS_MOBILE ? 0.32 : 0.28;
const CENTER_HOLE_STRENGTH      = IS_MOBILE ? 0.012 : 0.008;
const ORBIT_STRENGTH            = IS_MOBILE ? 0.009 : 0.006;
const DRIFT_BASE        = IS_MOBILE ? 0.004 : 0.003;
const DRIFT_FREQ        = 0.0018;
const WOBBLE_STRENGTH   = IS_MOBILE ? 0.010 : 0.010;
const WOBBLE_FREQ       = 0.0025;

/* Watchdog: se não desenhar em 3.5s => mock forçado */
const WATCHDOG_MS = 3500;
let drewAnything = false;
let watchdogId = null;

/* Canvas retina */
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize(){
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const w = innerWidth, h = innerHeight;
  canvas.style.width = w+"px"; canvas.style.height = h+"px";
  canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize", resize);
addEventListener("orientationchange", ()=>setTimeout(resize,200));
resize();

/* Estado */
let category = "acoes";
let bubbles = [];
let lastTime = performance.now();

/* DOM/status (opcional) */
const headerEl = document.querySelector(".header");
const statusBar = document.getElementById("statusBar");
const setStatus = t => statusBar && (statusBar.textContent = t||"");
const headerHeight = ()=>