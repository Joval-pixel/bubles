function poisson(lambda, k) {
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  return Math.exp(-lambda) * Math.pow(lambda, k) / fact(k);
}

export function scoreMatrix(expHome, expAway, max = 3) {
  const M = [];
  for (let i = 0; i <= max; i++) {
    M[i] = [];
    for (let j = 0; j <= max; j++) {
      M[i][j] = poisson(expHome, i) * poisson(expAway, j);
    }
  }
  return M;
}

export function probs1x2(expHome, expAway) {
  let ph = 0, pd = 0, pa = 0;
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const p = poisson(expHome, i) * poisson(expAway, j);
      if (i > j) ph += p; else if (i === j) pd += p; else pa += p;
    }
  }
  return { homeWin: ph, draw: pd, awayWin: pa };
}

export function probsOverUnder(expHome, expAway, line = 2.5) {
  let under = 0;
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const p = poisson(expHome, i) * poisson(expAway, j);
      if (i + j <= Math.floor(line)) under += p;
    }
  }
  const over = 1 - under;
  return { over, under };
}

export function probsBTTS(expHome, expAway) {
  const pH0 = poisson(expHome, 0);
  const pA0 = poisson(expAway, 0);
  const p00 = pH0 * pA0;
  const btts = 1 - pH0 - pA0 + p00;
  return { btts };
}

export function expectedGoals(teamRatings, match) {
  const H = teamRatings[match.home];
  const A = teamRatings[match.away];
  const homeAdv = 0.20;
  const expHome = Math.max(0.1, H.attack * A.defense * (1 + homeAdv));
  const expAway = Math.max(0.1, A.attack * H.defense);
  return { expHome, expAway };
}
