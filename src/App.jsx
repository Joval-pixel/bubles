import React, { useEffect, useMemo, useRef, useState } from "react";

const WIDGET_SPORTS = [
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "baseball", label: "Baseball" },
  { key: "hockey", label: "Hockey" },
  { key: "rugby", label: "Rugby" },
  { key: "volleyball", label: "Volleyball" },
  { key: "handball", label: "Handball" },
];

const CONTACT_EMAIL = "jogos@joval.com.br";
const BOOKMAKER_URL_TEMPLATES = {
  bet365: import.meta.env.VITE_BET365_URL || "https://www.bet365.com/",
  betano: import.meta.env.VITE_BETANO_URL || "https://www.betano.bet.br/",
};
const BOOKMAKER_LABELS = {
  bet365: "Bet365",
  betano: "Betano",
};
const AGE_GATE_STORAGE_KEY = "bubles-age-confirmed-v1";
const COOKIE_CONSENT_STORAGE_KEY = "bubles-cookie-consent-v1";

const SPONSORS = [
  {
    label: "Patrocinador master",
    title: "Espaco premium",
    note: "Topo do radar da Copa 2026",
  },
  {
    label: "Odds parceiras",
    title: "Disponivel",
    note: "Cota principal por jogo",
  },
  {
    label: "Publicidade",
    title: "Cota lateral",
    note: "Marca visivel no mapa",
  },
];

const RADAR_INITIAL_LIMIT = 30;
const AI_STATS_MIN_SAMPLE = 1;
const AI_STATS_MIN_CONFIDENCE = 0.6;
const VALID_FILTERS = new Set(["best", "live", "goals", "btts"]);
const VALID_MODES = new Set(["today", "worldcup"]);
const WORLD_CUP_VIEW_TABS = [
  { id: "games", label: "Jogos da Copa" },
  { id: "teams", label: "48 selecoes" },
  { id: "table", label: "Tabela" },
  { id: "bracket", label: "Mata-mata" },
];
const BRASILIA_TIMEZONE = "America/Sao_Paulo";
const BRASILIA_TIMEZONE_LABEL = "Horario de Brasilia";
const ROUTE_DEFAULTS = {
  "/": { mode: "today", filter: "best", view: "radar" },
  "/palpites-de-hoje": { mode: "today", filter: "best", view: "radar" },
  "/jogos-ao-vivo": { mode: "today", filter: "live", view: "radar" },
  "/lista-jogos-hoje": { mode: "today", filter: "best", view: "radar" },
  "/palpites-gols": { mode: "today", filter: "goals", view: "radar" },
  "/ambas-marcam": { mode: "today", filter: "btts", view: "radar" },
  "/copa-2026": { mode: "worldcup", filter: "best", view: "radar" },
};

const LEGAL_ROUTES = {
  "/jogo-responsavel": "responsible",
  "/politica-lgpd": "privacy",
};

const getInitialSearchParam = (name, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  return new URLSearchParams(window.location.search).get(name) || fallback;
};

const getInitialRouteValue = (name, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const queryValue = new URLSearchParams(window.location.search).get(name);

  if (queryValue) {
    return queryValue;
  }

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  return ROUTE_DEFAULTS[pathname]?.[name] || fallback;
};

const normalizeBookmakerText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getBookmakerKey = (name) => {
  const normalized = normalizeBookmakerText(name);

  if (normalized.includes("bet365")) {
    return "bet365";
  }

  if (normalized.includes("betano")) {
    return "betano";
  }

  return "";
};

const replaceAllTemplateTokens = (template, replacements) =>
  Object.entries(replacements).reduce(
    (result, [token, replacement]) => result.split(token).join(replacement),
    template,
  );

const buildBookmakerUrl = (template, game) => {
  if (!template) {
    return "";
  }

  const gameName = game?.game || [game?.homeTeam, game?.awayTeam].filter(Boolean).join(" x ");
  const query = [game?.homeTeam, game?.awayTeam].filter(Boolean).join(" ");
  const replacements = {
    "{game}": encodeURIComponent(gameName),
    "{home}": encodeURIComponent(game?.homeTeam || ""),
    "{away}": encodeURIComponent(game?.awayTeam || ""),
    "{query}": encodeURIComponent(query || gameName),
  };

  return replaceAllTemplateTokens(template, replacements);
};

const getGameBookmakerLinks = (game) => {
  const keys = new Set((game?.allowedBookmakers || []).map(getBookmakerKey).filter(Boolean));

  return Array.from(keys)
    .map((key) => ({
      key,
      label: BOOKMAKER_LABELS[key],
      href: buildBookmakerUrl(BOOKMAKER_URL_TEMPLATES[key], game),
    }))
    .filter((bookmaker) => bookmaker.label && bookmaker.href);
};

function BublesLogo() {
  return (
    <span className="bubles-wordmark" aria-label="Bubles">
      <span className="logo-blue">B</span>
      <span className="logo-yellow">u</span>
      <span className="logo-green">b</span>
      <span className="logo-white">l</span>
      <span className="logo-blue">e</span>
      <span className="logo-yellow">s</span>
    </span>
  );
}

function AiHitLogo({ state = "pending", compact = false }) {
  const symbol = state === "miss" ? "X" : "V";

  return (
    <span
      aria-hidden="true"
      className={compact ? `ai-hit-logo is-${state} is-compact` : `ai-hit-logo is-${state}`}
    >
      {symbol}
    </span>
  );
}

function BookmakerLinks({ game, compact = false }) {
  const links = getGameBookmakerLinks(game);

  if (!links.length) {
    return <span className="bookmaker-links-empty">Sem casa parceira</span>;
  }

  return (
    <div className={compact ? "bookmaker-links is-compact" : "bookmaker-links"}>
      {links.map((bookmaker) => (
        <a
          aria-label={`Abrir ${bookmaker.label} para ${game?.game || "este jogo"}`}
          href={bookmaker.href}
          key={bookmaker.key}
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer sponsored nofollow"
          target="_blank"
        >
          {bookmaker.label}
        </a>
      ))}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Informacoes legais">
      <div className="footer-main">
        <div>
          <a className="footer-brand" href="/">
            <BublesLogo />
            <strong>Palpites</strong>
          </a>
          <p>
            Conteudo informativo para maiores de 18 anos. O Bubles Palpites nao promete
            lucro, nao vende resultado garantido e nao substitui sua propria analise.
          </p>
        </div>

        <nav className="footer-links" aria-label="Links institucionais">
          <a href="/jogo-responsavel">Jogo Responsavel</a>
          <a href="/politica-lgpd">Politica LGPD</a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Contato%20Bubles%20Palpites`}>
            Contato
          </a>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>18+ | Aposte com responsabilidade.</span>
        <span>Use as informacoes apenas como apoio. Resultados esportivos sao imprevisiveis.</span>
      </div>
    </footer>
  );
}

function CookieConsent() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setShouldShow(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) !== "accepted");
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
    setShouldShow(false);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <section className="cookie-banner" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <div>
        <strong>Cookies e privacidade</strong>
        <p>
          Usamos cookies essenciais e metricas de acesso para melhorar o site. Nao usamos
          cookies para prometer ganhos ou resultados. Veja a nossa{" "}
          <a href="/politica-lgpd">Politica LGPD</a>.
        </p>
      </div>
      <button type="button" onClick={acceptCookies}>
        Entendi
      </button>
    </section>
  );
}

function LegalPage({ type }) {
  const isPrivacy = type === "privacy";

  return (
    <div className="legal-page">
      <header className="cup-toolbar legal-toolbar">
        <a className="cup-brand" href="/">
          <BublesLogo />
          <strong className="brand-context">PALPITES</strong>
        </a>
        <nav className="cup-controls compact" aria-label="Atalhos legais">
          <a className="chip-link" href="/">
            Voltar ao radar
          </a>
          <a className="chip-link contact-chip" href={`mailto:${CONTACT_EMAIL}?subject=Contato%20Bubles%20Palpites`}>
            Contato
          </a>
        </nav>
      </header>

      <main className="legal-content">
        <section className="legal-hero">
          <span>{isPrivacy ? "Privacidade e dados" : "Uso consciente"}</span>
          <h1>{isPrivacy ? "Politica LGPD" : "Jogo Responsavel"}</h1>
          <p>
            {isPrivacy
              ? "Explicamos de forma simples como tratamos dados, cookies e contato dos usuarios."
              : "Palpites esportivos devem ser usados apenas como informacao. Nao existe aposta garantida."}
          </p>
        </section>

        {isPrivacy ? (
          <section className="legal-grid">
            <article className="legal-card">
              <h2>Quais dados podemos coletar</h2>
              <p>
                Podemos registrar dados tecnicos de navegacao, como paginas acessadas,
                dispositivo, navegador, horario aproximado e metricas agregadas de uso.
              </p>
            </article>
            <article className="legal-card">
              <h2>Para que usamos</h2>
              <p>
                Usamos esses dados para medir acessos, melhorar desempenho, corrigir erros,
                proteger o site e entender quais areas sao mais utilizadas.
              </p>
            </article>
            <article className="legal-card">
              <h2>Cookies</h2>
              <p>
                O site pode usar cookies essenciais, aceite de cookies, confirmacao de idade
                e ferramentas de analytics. Voce pode apagar cookies no seu navegador.
              </p>
            </article>
            <article className="legal-card">
              <h2>Seus direitos</h2>
              <p>
                Voce pode pedir acesso, correcao ou exclusao de dados pessoais eventualmente
                tratados pelo site. Para isso, envie email para {CONTACT_EMAIL}.
              </p>
            </article>
            <article className="legal-card is-wide">
              <h2>Contato LGPD</h2>
              <p>
                Para solicitacoes de privacidade, duvidas sobre dados ou remocao de informacoes,
                fale com a equipe pelo email{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=LGPD%20Bubles%20Palpites`}>
                  {CONTACT_EMAIL}
                </a>.
              </p>
            </article>
          </section>
        ) : (
          <section className="legal-grid">
            <article className="legal-card">
              <h2>Maioridade</h2>
              <p>
                O conteudo e destinado somente a pessoas com 18 anos ou mais. Se voce nao tem
                idade legal para apostar, nao utilize o site.
              </p>
            </article>
            <article className="legal-card">
              <h2>Sem promessa de lucro</h2>
              <p>
                As informacoes sao estimativas, leituras de odds e dados esportivos. Nao
                prometemos lucro, renda, retorno financeiro ou acerto garantido.
              </p>
            </article>
            <article className="legal-card">
              <h2>Controle de risco</h2>
              <p>
                Aposte apenas valores que nao afetem sua vida financeira. Defina limites,
                faca pausas e nunca tente recuperar perdas aumentando o risco.
              </p>
            </article>
            <article className="legal-card">
              <h2>Quando parar</h2>
              <p>
                Se apostar deixar de ser entretenimento, causar ansiedade, dividas ou conflitos,
                procure ajuda e interrompa o uso de sites de apostas.
              </p>
            </article>
            <article className="legal-card is-wide">
              <h2>Mensagem principal</h2>
              <ul className="legal-list">
                <li>Palpite nao e certeza.</li>
                <li>Odd muda o tempo todo.</li>
                <li>Resultado esportivo e imprevisivel.</li>
                <li>Use o site como apoio, nunca como garantia.</li>
              </ul>
            </article>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatChance = (value) => `${Math.round((value || 0) * 100)}%`;
const getPredictionChance = (game) =>
  clamp(Number(game?.displayProbability ?? game?.probability ?? 0), 0, 1);
const formatOdd = (value) =>
  value && Number.isFinite(value) && value > 0 ? value.toFixed(2).replace(".", ",") : "--";
const formatClock = (game) => {
  if (game?.isLive) {
    return `${Math.max(1, Math.round(game.minute || 1))}'`;
  }

  if (game?.isFinished) {
    return "FT";
  }

  return "PRE";
};

const hasLiveMinute = (game) => Boolean(game?.isLive || Number(game?.minute) > 0);

const formatLiveMinute = (game) => {
  const minute = Math.round(Number(game?.minute) || 0);

  if (minute > 0) {
    return `${minute}' ao vivo`;
  }

  return game?.isLive ? "Ao vivo" : "";
};

const hasScoreLine = (game) => {
  const score = String(game?.scoreLine || "").trim();
  return Boolean(score && score !== "Pre-jogo");
};

const formatScoreLine = (game) => {
  if (hasScoreLine(game)) {
    return game.scoreLine;
  }

  if (game?.isLive) {
    return "-- x --";
  }

  return "Pre-jogo";
};

const formatKickoff = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatKickoffShort = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", "")
    : "--";

const formatKickoffTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatBrasiliaUpdateTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

const getKickoffStamp = (game) => {
  const stamp = new Date(game?.commenceTime || "").getTime();
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
};

const getGameStatusLabel = (game) => {
  if (game?.isLive) {
    return `Ao vivo ${formatClock(game)}`;
  }

  if (game?.isFinished) {
    return "Encerrado";
  }

  return "Pre-jogo";
};

const formatScoreContext = (game) => {
  if (game?.isLive) {
    return `Online agora, ${formatClock(game)}`;
  }

  if (game?.isFinished) {
    return `Resultado final | ${formatKickoff(game?.commenceTime)}`;
  }

  return `Comeca em ${formatKickoff(game?.commenceTime)}`;
};

const formatBoardTime = (game, mode) => {
  if (game?.isLive) {
    return formatClock(game);
  }

  return mode === "worldcup" ? formatKickoffShort(game?.commenceTime) : formatKickoffTime(game?.commenceTime);
};

const formatRecentDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
      })
    : "--";

const formatStandingLabel = (standing) => {
  if (!standing?.rank) {
    return "Classificacao indisponivel";
  }

  return `${standing.rank}o lugar${standing.group ? ` | ${standing.group}` : ""}`;
};

const getStatValue = (value) =>
  value === null || value === undefined || value === "" ? "--" : value;

const getRecentFormProfile = (team) => {
  const source = team?.recentForm || team?.recentSummary || {};
  const played = Number(source.played || 0);
  const wins = Number(source.wins || 0);
  const draws = Number(source.draws || 0);
  const losses = Number(source.losses || 0);
  const goalsFor = Number(source.goalsFor || 0);
  const goalsAgainst = Number(source.goalsAgainst || 0);
  const points = Number(source.points ?? wins * 3 + draws);
  const pointsPerGame = Number(source.pointsPerGame ?? (played ? points / played : 0));
  const goalsDiff = Number(source.goalsDiff ?? goalsFor - goalsAgainst);
  const unbeaten = Number(source.unbeaten ?? wins + draws);
  const isStrong = Boolean(
    source.isStrong ||
      (played >= 5 &&
        losses <= 2 &&
        goalsDiff >= 0 &&
        (wins >= 5 || pointsPerGame >= 1.8 || unbeaten >= 8))
  );
  const isWeak = Boolean(source.isWeak || (played >= 5 && wins <= 2 && (losses >= 5 || pointsPerGame <= 0.9)));

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points,
    pointsPerGame,
    goalsDiff,
    unbeaten,
    isStrong,
    isWeak,
  };
};

const formatRecentFormRecord = (profile) =>
  `${profile.wins}V ${profile.draws}E ${profile.losses}D`;

function TeamDetailsPanel({ fallbackName, loading, team }) {
  const name = team?.name || fallbackName || "Time";
  const standing = team?.standing;
  const summary = team?.summary || {};
  const last10 = Array.isArray(team?.last10) ? team.last10 : [];
  const recentForm = getRecentFormProfile(team);

  return (
    <article className="team-details-panel">
      <header>
        <div>
          <span>Time</span>
          <strong>{name}</strong>
        </div>
        <em>{loading ? "Carregando..." : formatStandingLabel(standing)}</em>
      </header>

      <div className="team-stats-grid">
        <div>
          <span>Gols marcados</span>
          <strong>{getStatValue(summary.goalsFor)}</strong>
        </div>
        <div>
          <span>Gols sofridos</span>
          <strong>{getStatValue(summary.goalsAgainst)}</strong>
        </div>
        <div>
          <span>Pontos</span>
          <strong>{getStatValue(standing?.points)}</strong>
        </div>
        <div>
          <span>Campanha</span>
          <strong>
            {getStatValue(summary.wins)}V {getStatValue(summary.draws)}E {getStatValue(summary.losses)}D
          </strong>
        </div>
      </div>

      <div className="last-results-strip" aria-label={`Ultimos resultados de ${name}`}>
        {last10.length ? (
          last10.map((match) => (
            <span className={`last-result-dot is-${match.resultKey}`} key={match.id || `${match.date}-${match.opponent}`}>
              {match.result}
            </span>
          ))
        ) : (
          <small>{loading ? "Buscando ultimos jogos..." : "Ultimos jogos indisponiveis"}</small>
        )}
      </div>

      {recentForm.played ? (
        <div className={`team-form-note ${recentForm.isStrong ? "is-strong" : recentForm.isWeak ? "is-weak" : ""}`}>
          <span>Ultimos 10 jogos</span>
          <strong>{formatRecentFormRecord(recentForm)}</strong>
          <small>
            {recentForm.isStrong
              ? "Boa fase: evitar apostar contra sem motivo forte."
              : recentForm.isWeak
                ? "Fase fraca: exige cuidado antes de confiar."
                : "Fase equilibrada nos jogos recentes."}
          </small>
        </div>
      ) : null}

      {last10.length ? (
        <div className="last-results-list">
          {last10.slice(0, 10).map((match) => (
            <div className="last-result-row" key={match.id || `${match.date}-${match.opponent}`}>
              <span>{formatRecentDate(match.date)}</span>
              <strong>{match.score}</strong>
              <small>{match.isHome ? "Casa" : "Fora"} x {match.opponent}</small>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

const translateBetText = (value) => {
  const text = String(value || "").trim();

  if (!text) {
    return "--";
  }

  return text
    .replace(
      /Nao combina ambas marcam com mais de 2\.5 gols/gi,
      "Um dos times nao marca"
    )
    .replace(
      /Nao: ambas marcam \+ mais de 2[,.]5 gols/gi,
      "Um dos times nao marca"
    )
    .replace(/Ambas marcam - Nao/gi, "Um dos times nao marca")
    .replace(/Ambas marcam e mais de 2\.5 gols/gi, "Jogo aberto com gols dos dois times")
    .replace(/Ambas marcam \+ mais de 2[,.]5 gols/gi, "Jogo aberto com gols dos dois times")
    .replace(/vence e ambas nao marcam/gi, "vence e ambas NAO marcam")
    .replace(/\bHome Team Score a Goal\b/gi, "Mandante marca gol")
    .replace(/\bAway Team Score a Goal\b/gi, "Visitante marca gol")
    .replace(/\bMandante Team Score a Goal\b/gi, "Mandante marca gol")
    .replace(/\bVisitante Team Score a Goal\b/gi, "Visitante marca gol")
    .replace(/\bTeam Score a Goal\b/gi, "Time marca gol")
    .replace(/\bTeam To Score\b/gi, "Time marca gol")
    .replace(/\bOwn Goal\b/gi, "Gol contra")
    .replace(/\bMatch Winner\b/gi, "Resultado final")
    .replace(/\bWinner\b/gi, "Vencedor")
    .replace(/\bDouble Chance\b/gi, "Dupla chance")
    .replace(/\bDraw No Bet\b/gi, "Empate anula")
    .replace(/\bBoth Teams To Score\b/gi, "Ambas marcam")
    .replace(/\bClean Sheet\b/gi, "Sem sofrer gol")
    .replace(/\bCorners\b/gi, "Escanteios")
    .replace(/\bCorner\b/gi, "Escanteio")
    .replace(/\bOver\b/gi, "Mais de")
    .replace(/\bUnder\b/gi, "Menos de")
    .replace(/\bYes\b/gi, "Sim")
    .replace(/\bNo\b/gi, "Nao")
    .replace(/\bDraw\b/gi, "Empate")
    .replace(/\bHome\b/gi, "Mandante")
    .replace(/\bAway\b/gi, "Visitante")
    .replace(/\bGoals\b/gi, "Gols")
    .replace(/\bOdd\b/gi, "Impar")
    .replace(/\bEven\b/gi, "Par");
};

const normalizeBetText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getBetSearchText = (value) => `${value || ""} ${translateBetText(value)}`.toLowerCase();

const hasOpenGameCombo = (value) => {
  const text = getBetSearchText(value);

  return (
    (text.includes("ambas marcam") ||
      text.includes("ambos marcam") ||
      text.includes("dois times marcam")) &&
    (text.includes("2.5") || text.includes("2,5") || text.includes("+2"))
  );
};

const isAvoidOpenGameCombo = (value) => {
  const text = getBetSearchText(value);

  return hasOpenGameCombo(value) && (text.includes("nao") || text.includes("evitar"));
};

const getTeamResultText = (value, game) => {
  const text = translateBetText(value);
  const normalized = text.toLowerCase();
  const plainText = normalizeBetText(text);
  const homeName = normalizeBetText(game?.homeTeam);
  const awayName = normalizeBetText(game?.awayTeam);
  const code = String(game?.pickCode || "").toUpperCase();

  if (game && homeName && plainText === homeName) {
    return `${game.homeTeam} vence`;
  }

  if (game && awayName && plainText === awayName) {
    return `${game.awayTeam} vence`;
  }

  if (!game || !["favorito", "mandante", "visitante", "home", "away"].includes(normalized)) {
    return text;
  }

  if (normalized === "visitante" || normalized === "away" || code === "2") {
    return `${game.awayTeam} vence`;
  }

  if (code === "X") {
    return "Empate";
  }

  return `${game.homeTeam} vence`;
};

const getReadableMarketName = (game) =>
  translateBetText(
    game?.displayMarketName ||
      game?.marketName ||
      game?.displayMarketCategory ||
      ""
  )
    .replace(/\s+/g, " ")
    .trim();

const isGenericMarketName = (value) => {
  const normalized = normalizeBetText(value);

  return !normalized || normalized === "principal" || normalized === "melhor palpite";
};

const getContextMarketNameForAnswer = (game, answer) => {
  const normalizedAnswer = normalizeBetText(answer);
  const candidates = [
    {
      category: game?.displayMarketCategory,
      name: game?.displayMarketName,
      label: game?.displayPickLabel,
    },
    ...(Array.isArray(game?.betMarkets) ? game.betMarkets : []).map((market) => ({
      category: market?.category,
      name: market?.name,
      label: market?.leader?.label,
    })),
  ];

  const match = candidates.find((market) => {
    const label = normalizeBetText(translateBetText(market?.label));
    const name = translateBetText(market?.name || market?.category || "");

    return label === normalizedAnswer && !isGenericMarketName(name);
  });

  return match ? translateBetText(match.name || match.category || "") : "";
};

const getPrimaryBetText = (value, game) => {
  const text = translateBetText(value);
  const normalized = text.toLowerCase();
  const marketName = getReadableMarketName(game);

  if (normalized === "sim" || normalized === "nao" || normalized === "não") {
    const answer = normalized.startsWith("n") ? "Nao" : "Sim";
    const contextMarketName = isGenericMarketName(marketName)
      ? getContextMarketNameForAnswer(game, answer)
      : marketName;
    const contextSearch = `${contextMarketName} ${game?.displayMarketCategory || ""}`.toLowerCase();

    if (
      contextSearch.includes("ambas marcam") ||
      contextSearch.includes("both teams") ||
      contextSearch.includes("btts")
    ) {
      return answer === "Nao" ? "Um dos times nao marca" : "Ambas marcam - Sim";
    }

    if (contextSearch.includes("gol contra") || contextSearch.includes("own goal")) {
      return answer === "Nao" ? "Sem gol contra" : "Gol contra no jogo";
    }

    if (contextMarketName && !isGenericMarketName(contextMarketName)) {
      return `${contextMarketName}: ${answer}`;
    }

    return answer === "Sim" ? "Sim no mercado selecionado" : "Nao no mercado selecionado";
  }

  if (isAvoidOpenGameCombo(value)) {
    return "Um dos times nao marca";
  }

  if (hasOpenGameCombo(value)) {
    return "Jogo aberto com gols dos dois times";
  }

  return getTeamResultText(value, game);
};

const getBetHelpText = (value, game) => {
  const primaryText = game ? getPrimaryBetText(value, game) : "";
  const text = `${getBetSearchText(value)} ${getBetSearchText(primaryText)} ${getReadableMarketName(game)}`.toLowerCase();

  if (isAvoidOpenGameCombo(value)) {
    return "Para bater, pelo menos um dos times precisa terminar sem gol.";
  }

  if (hasOpenGameCombo(value)) {
    return "Para bater, os dois times precisam marcar e o jogo precisa ter 3 gols ou mais.";
  }

  if (text.includes("um dos times nao marca")) {
    return "Para bater, pelo menos um dos times precisa terminar sem gol.";
  }

  if (text.includes("ambas marcam") || text.includes("dois times marcam")) {
    return "Para bater, mandante e visitante precisam fazer pelo menos 1 gol cada.";
  }

  if (text.includes("gol contra") || text.includes("own goal")) {
    return "Mercado raro. Melhor usar apenas como observacao, nao como palpite principal.";
  }

  if (text.includes("dupla chance")) {
    return "Para bater, voce tem dois resultados a favor: vitoria de um lado ou empate.";
  }

  if (text.includes("mais de")) {
    return "Para bater, o jogo precisa passar da linha de gols indicada.";
  }

  if (text.includes("menos de")) {
    return "Para bater, o jogo precisa terminar abaixo da linha de gols indicada.";
  }

  return "";
};

const parseRecentScore = (score) => {
  const match = String(score || "").match(/(\d+)\s*x\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  };
};

const getRecentMatches = (team, limit = 10) =>
  (Array.isArray(team?.last10) ? team.last10 : [])
    .filter((match) => match?.resultKey && match.resultKey !== "pending")
    .slice(0, limit);

const buildRecentStats = (team, limit = 10, venue = "all") => {
  const matches = getRecentMatches(team, limit).filter((match) => {
    if (venue === "home") {
      return match.isHome;
    }

    if (venue === "away") {
      return !match.isHome;
    }

    return true;
  });

  const stats = matches.reduce(
    (summary, match) => {
      const score = parseRecentScore(match.score);

      if (!score) {
        return summary;
      }

      const teamGoals = match.isHome ? score.home : score.away;
      const opponentGoals = match.isHome ? score.away : score.home;
      const totalGoals = teamGoals + opponentGoals;

      summary.played += 1;
      summary.goalsFor += teamGoals;
      summary.goalsAgainst += opponentGoals;
      summary.totalGoals += totalGoals;
      summary.btts += teamGoals > 0 && opponentGoals > 0 ? 1 : 0;
      summary.over15 += totalGoals > 1.5 ? 1 : 0;
      summary.over25 += totalGoals > 2.5 ? 1 : 0;
      summary.over35 += totalGoals > 3.5 ? 1 : 0;
      summary.under25 += totalGoals < 2.5 ? 1 : 0;
      summary.cleanSheets += opponentGoals === 0 ? 1 : 0;
      summary.failedToScore += teamGoals === 0 ? 1 : 0;

      if (match.resultKey === "win") {
        summary.wins += 1;
      } else if (match.resultKey === "loss") {
        summary.losses += 1;
      } else if (match.resultKey === "draw") {
        summary.draws += 1;
      }

      return summary;
    },
    {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      totalGoals: 0,
      btts: 0,
      over15: 0,
      over25: 0,
      over35: 0,
      under25: 0,
      cleanSheets: 0,
      failedToScore: 0,
    }
  );

  return {
    ...stats,
    avgFor: stats.played ? stats.goalsFor / stats.played : null,
    avgAgainst: stats.played ? stats.goalsAgainst / stats.played : null,
    avgTotalGoals: stats.played ? stats.totalGoals / stats.played : null,
    points: stats.wins * 3 + stats.draws,
    pointsRate: stats.played ? (stats.wins * 3 + stats.draws) / (stats.played * 3) : null,
  };
};

const formatAdvancedAverage = (value) =>
  Number.isFinite(value) ? value.toFixed(2).replace(".", ",") : "--";

const formatAdvancedPercent = (value) =>
  Number.isFinite(value) ? `${Math.round(value * 100)}%` : "Sem dados";

const getTrendRate = (stats, key) => (stats?.played ? stats[key] / stats.played : null);

const getRecentSequenceText = (team) => {
  const matches = getRecentMatches(team, 10);

  if (!matches.length) {
    return "Sequencia indisponivel";
  }

  const first = matches[0].resultKey;
  const count = matches.findIndex((match) => match.resultKey !== first);
  const streak = count === -1 ? matches.length : count;

  if (first === "win") {
    return streak > 1 ? `${streak} vitorias seguidas` : "Vitoria no ultimo jogo";
  }

  if (first === "loss") {
    return streak > 1 ? `${streak} derrotas seguidas` : "Derrota no ultimo jogo";
  }

  return streak > 1 ? `${streak} empates seguidos` : "Empate no ultimo jogo";
};

const getResultProbabilities = (game) => {
  const options = Array.isArray(game?.marketOptions) ? game.marketOptions : [];
  const homeName = normalizeBetText(game?.homeTeam);
  const awayName = normalizeBetText(game?.awayTeam);
  const probabilities = { home: null, draw: null, away: null };

  options.forEach((option) => {
    const code = String(option?.code || "").toUpperCase();
    const label = normalizeBetText(option?.label);
    const probability = Number(option?.probability);

    if (!Number.isFinite(probability)) {
      return;
    }

    if (code === "1" || (homeName && label === homeName)) {
      probabilities.home = probability;
    } else if (code === "X" || label === "empate" || label === "draw") {
      probabilities.draw = probability;
    } else if (code === "2" || (awayName && label === awayName)) {
      probabilities.away = probability;
    }
  });

  return probabilities;
};

const findMarketProbability = (game, predicate) => {
  for (const market of game?.betMarkets || []) {
    for (const option of market?.options || []) {
      const text = normalizeBetText(`${market.category || ""} ${market.name || ""} ${option.label || ""}`);

      if (predicate(text, market, option)) {
        const probability = Number(option.probability);
        return Number.isFinite(probability) ? probability : null;
      }
    }
  }

  return null;
};

const getBttsProbability = (game, homeStats, awayStats) => {
  const marketProbability = findMarketProbability(game, (text) => {
    const isBtts = text.includes("ambas") || text.includes("both teams") || text.includes("btts");
    const isYes = text.includes("sim") || text.includes("yes");
    return isBtts && isYes && !text.includes("nao") && !text.includes("no");
  });

  if (Number.isFinite(marketProbability)) {
    return marketProbability;
  }

  const homeRate = getTrendRate(homeStats, "btts");
  const awayRate = getTrendRate(awayStats, "btts");

  return Number.isFinite(homeRate) && Number.isFinite(awayRate) ? (homeRate + awayRate) / 2 : null;
};

const getOver25Probability = (game, homeStats, awayStats) => {
  const marketProbability = findMarketProbability(game, (text) => {
    const isGoals = text.includes("gols") || text.includes("goals");
    const isOver = text.includes("mais de") || text.includes("over");
    return isGoals && isOver && (text.includes("2.5") || text.includes("2,5"));
  });

  if (Number.isFinite(marketProbability)) {
    return marketProbability;
  }

  const homeRate = getTrendRate(homeStats, "over25");
  const awayRate = getTrendRate(awayStats, "over25");

  return Number.isFinite(homeRate) && Number.isFinite(awayRate) ? (homeRate + awayRate) / 2 : null;
};

const getUnder25Probability = (homeStats, awayStats, over25Probability) => {
  if (Number.isFinite(over25Probability)) {
    return clamp(1 - over25Probability, 0, 1);
  }

  const homeRate = getTrendRate(homeStats, "under25");
  const awayRate = getTrendRate(awayStats, "under25");

  return Number.isFinite(homeRate) && Number.isFinite(awayRate) ? (homeRate + awayRate) / 2 : null;
};

const getInterestingAdvancedMarkets = (game) => {
  const insightMarkets = Array.isArray(game?.aiInsights?.bestMarkets) ? game.aiInsights.bestMarkets : [];
  const directMarkets = (game?.betMarkets || [])
    .filter((market) => market?.leader)
    .map((market) => ({
      category: market.category,
      market: market.name,
      pick: market.leader.label,
      probability: market.leader.probability,
      odd: market.leader.odd,
      note: "",
    }));

  return [...insightMarkets, ...directMarkets]
    .filter((market) => Number.isFinite(Number(market?.probability)))
    .sort((left, right) => Number(right.probability) - Number(left.probability))
    .slice(0, 3);
};

const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) {
    return "ALTA";
  }

  if (confidence >= 0.65) {
    return "MEDIA";
  }

  return "ARRISCADA";
};

const getRiskLabel = (confidence) => {
  if (confidence >= 0.8) {
    return "Baixo";
  }

  if (confidence >= 0.65) {
    return "Medio";
  }

  return "Alto";
};

const getProbableScore = (homeStats, awayStats) => {
  const homeExpected = Number.isFinite(homeStats.avgFor) && Number.isFinite(awayStats.avgAgainst)
    ? (homeStats.avgFor + awayStats.avgAgainst) / 2
    : null;
  const awayExpected = Number.isFinite(awayStats.avgFor) && Number.isFinite(homeStats.avgAgainst)
    ? (awayStats.avgFor + homeStats.avgAgainst) / 2
    : null;

  if (!Number.isFinite(homeExpected) || !Number.isFinite(awayExpected)) {
    return "--";
  }

  return `${clamp(Math.round(homeExpected), 0, 4)}x${clamp(Math.round(awayExpected), 0, 4)}`;
};

const getAdvancedMarketDisplayText = (market, game) => {
  const pick = translateBetText(market?.pick);
  const normalizedPick = normalizeBetText(pick);
  const marketName = translateBetText(market?.market || market?.category || "");

  if (["sim", "nao", "no", "yes"].includes(normalizedPick) && marketName) {
    return `${marketName} - ${normalizedPick.startsWith("n") ? "Nao" : "Sim"}`;
  }

  return getPrimaryBetText(market?.pick, game);
};

const getStrongestResultSide = (probabilities) => {
  const entries = [
    ["home", probabilities.home],
    ["draw", probabilities.draw],
    ["away", probabilities.away],
  ].filter((entry) => Number.isFinite(entry[1]));

  if (!entries.length) {
    return { side: null, probability: null, gap: null };
  }

  const sorted = entries.sort((left, right) => right[1] - left[1]);

  return {
    side: sorted[0][0],
    probability: sorted[0][1],
    gap: sorted.length > 1 ? sorted[0][1] - sorted[1][1] : null,
  };
};

const getConservativeConfidence = (baseConfidence, homeStats, awayStats, resultProbabilities) => {
  const resultLeader = getStrongestResultSide(resultProbabilities);
  const formGap = Number.isFinite(homeStats.pointsRate) && Number.isFinite(awayStats.pointsRate)
    ? Math.abs(homeStats.pointsRate - awayStats.pointsRate)
    : null;
  const hasEnoughRecentData = homeStats.played >= 5 && awayStats.played >= 5;
  const isBalancedByOdds = Number.isFinite(resultLeader.gap) && resultLeader.gap < 0.12;
  const isBalancedByForm = Number.isFinite(formGap) && formGap < 0.1;
  let adjusted = clamp(baseConfidence || 0, 0, 1);

  if (!hasEnoughRecentData) {
    adjusted = Math.min(adjusted, 0.64);
  }

  if (isBalancedByOdds || isBalancedByForm) {
    adjusted = Math.min(adjusted, 0.74);
  }

  if (adjusted >= 0.8 && (!hasEnoughRecentData || isBalancedByOdds || isBalancedByForm)) {
    adjusted = 0.79;
  }

  return {
    confidence: adjusted,
    hasEnoughRecentData,
    isBalanced: Boolean(isBalancedByOdds || isBalancedByForm),
  };
};

const getSideName = (side, game) => {
  if (side === "home") {
    return game?.homeTeam || "Mandante";
  }

  if (side === "away") {
    return game?.awayTeam || "Visitante";
  }

  if (side === "draw") {
    return "Empate";
  }

  return "Sem favorito claro";
};

const getValueText = (game) => {
  const ev = Number(game?.ev);
  const edge = Number(game?.marketEdge);

  if (Number.isFinite(ev) && ev > 0.08) {
    return "Possivel valor estatistico, mas confirme liquidez e odd atual.";
  }

  if (Number.isFinite(edge) && edge > 0.18) {
    return "Odd acima da leitura justa estimada. Exige conferencia antes da entrada.";
  }

  if (Number.isFinite(ev) && ev < -0.05) {
    return "Odd nao parece oferecer valor claro neste momento.";
  }

  return "Sem movimento historico de odds disponivel; leitura baseada na odd atual.";
};

const getZebraDetectorText = (game, analysis) => {
  const leader = getStrongestResultSide(analysis.resultProbabilities);
  const favoriteName = getSideName(leader.side, game);
  const favoriteStats = leader.side === "home" ? analysis.homeStats10 : leader.side === "away" ? analysis.awayStats10 : null;
  const underdogStats = leader.side === "home" ? analysis.awayStats10 : leader.side === "away" ? analysis.homeStats10 : null;
  const favoriteWeak = favoriteStats?.played >= 5 && favoriteStats.wins <= 2;
  const underdogStrong = underdogStats?.played >= 5 && underdogStats.losses <= 2 && underdogStats.pointsRate >= 0.55;

  if (!leader.side || leader.side === "draw") {
    return "Jogo sem favorito claro. Tratar como partida imprevisivel.";
  }

  if (favoriteWeak || underdogStrong || analysis.isBalanced) {
    return `${favoriteName} tem risco oculto. Evite confiar so no favoritismo.`;
  }

  return `${favoriteName} aparece mais consistente, sem alerta forte de zebra pelos dados atuais.`;
};

const buildAdvancedAnalysis = (game, details) => {
  const homeTeam = details?.teams?.home;
  const awayTeam = details?.teams?.away;
  const homeStats5 = buildRecentStats(homeTeam, 5);
  const awayStats5 = buildRecentStats(awayTeam, 5);
  const homeStats10 = buildRecentStats(homeTeam, 10);
  const awayStats10 = buildRecentStats(awayTeam, 10);
  const homeVenue = buildRecentStats(homeTeam, 10, "home");
  const awayVenue = buildRecentStats(awayTeam, 10, "away");
  const resultProbabilities = getResultProbabilities(game);
  const rawConfidence = clamp(Number(game?.displayProbability || game?.probability || 0), 0, 1);
  const bttsProbability = getBttsProbability(game, homeStats10, awayStats10);
  const over25Probability = getOver25Probability(game, homeStats10, awayStats10);
  const under25Probability = getUnder25Probability(homeStats10, awayStats10, over25Probability);
  const totalAverage = [homeStats10.avgTotalGoals, awayStats10.avgTotalGoals].filter(Number.isFinite);
  const matchGoalsAverage = totalAverage.length
    ? totalAverage.reduce((sum, value) => sum + value, 0) / totalAverage.length
    : null;
  const markets = getInterestingAdvancedMarkets(game);
  const probableScore = getProbableScore(homeStats10, awayStats10);
  const confidenceProfile = getConservativeConfidence(rawConfidence, homeStats10, awayStats10, resultProbabilities);
  const confidence = confidenceProfile.confidence;
  const confidenceClass = getConfidenceClass(confidence);
  const risk = getRiskLabel(confidence);
  const homeName = game?.homeTeam || homeTeam?.name || "Mandante";
  const awayName = game?.awayTeam || awayTeam?.name || "Visitante";
  const partialAnalysis = {
    homeStats10,
    awayStats10,
    resultProbabilities,
    isBalanced: confidenceProfile.isBalanced,
  };

  return {
    awayName,
    awayStats5,
    awayStats10,
    awayVenue,
    bttsProbability,
    confidence,
    confidenceClass,
    hasEnoughRecentData: confidenceProfile.hasEnoughRecentData,
    homeName,
    homeStats5,
    homeStats10,
    homeVenue,
    matchGoalsAverage,
    markets,
    over25Probability,
    probableScore,
    rawConfidence,
    resultProbabilities,
    risk,
    valueText: getValueText(game),
    under25Probability,
    zebraText: getZebraDetectorText(game, partialAnalysis),
    isBalanced: confidenceProfile.isBalanced,
  };
};

function AdvancedAnalysisPanel({ game, details, loading }) {
  const analysis = buildAdvancedAnalysis(game, details);
  const pickText = getPrimaryBetText(game?.displayPickLabel || game?.pickLabel, game);
  const hasRecentData = analysis.homeStats10.played || analysis.awayStats10.played;

  return (
    <section className="advanced-analysis-card">
      <div className="advanced-analysis-head">
        <div>
          <span>Analise estatistica avancada</span>
          <strong>Leitura profissional da partida</strong>
        </div>
        <em className={`confidence-pill is-${analysis.confidenceClass.toLowerCase()}`}>
          {formatChance(analysis.confidence)} {analysis.confidenceClass}
        </em>
      </div>

      {loading ? (
        <p className="advanced-loading">Carregando forma recente, casa/fora e ultimos confrontos...</p>
      ) : null}

      <div className="advanced-analysis-grid">
        <article>
          <span>🏆 JOGO</span>
          <strong>{analysis.homeName} x {analysis.awayName}</strong>
          <small>{pickText}</small>
        </article>

        <article>
          <span>📊 MOMENTO DAS EQUIPES</span>
          <strong>
            {hasRecentData
              ? `${analysis.homeName}: ${formatRecentFormRecord(analysis.homeStats10)} | ${analysis.awayName}: ${formatRecentFormRecord(analysis.awayStats10)}`
              : "Aguardando historico recente"}
          </strong>
          <small>
            {analysis.homeName}: {getRecentSequenceText(details?.teams?.home)}. {analysis.awayName}:{" "}
            {getRecentSequenceText(details?.teams?.away)}.
          </small>
        </article>

        <article>
          <span>⚽ MEDIA DE GOLS</span>
          <strong>Total previsto: {formatAdvancedAverage(analysis.matchGoalsAverage)}</strong>
          <small>
            {analysis.homeName}: {formatAdvancedAverage(analysis.homeStats10.avgFor)} feitos /{" "}
            {formatAdvancedAverage(analysis.homeStats10.avgAgainst)} sofridos. {analysis.awayName}:{" "}
            {formatAdvancedAverage(analysis.awayStats10.avgFor)} feitos /{" "}
            {formatAdvancedAverage(analysis.awayStats10.avgAgainst)} sofridos.
          </small>
        </article>

        <article>
          <span>🏠 CASA E FORA</span>
          <strong>
            Casa: {formatAdvancedAverage(analysis.homeVenue.avgFor)} gols | Fora:{" "}
            {formatAdvancedAverage(analysis.awayVenue.avgFor)} gols
          </strong>
          <small>
            Mandante em casa: {analysis.homeVenue.played || 0} jogos. Visitante fora:{" "}
            {analysis.awayVenue.played || 0} jogos.
          </small>
        </article>

        <article>
          <span>🔥 TENDENCIAS</span>
          <strong>BTTS {formatAdvancedPercent(analysis.bttsProbability)} | Over 2.5 {formatAdvancedPercent(analysis.over25Probability)}</strong>
          <small>
            Under 2.5: {formatAdvancedPercent(analysis.under25Probability)}. Escanteios: sem dados reais na API atual.
          </small>
        </article>

        <article>
          <span>📈 PROBABILIDADES DA IA</span>
          <strong>
            {analysis.homeName}: {formatAdvancedPercent(analysis.resultProbabilities.home)} | Empate:{" "}
            {formatAdvancedPercent(analysis.resultProbabilities.draw)}
          </strong>
          <small>
            {analysis.awayName}: {formatAdvancedPercent(analysis.resultProbabilities.away)}.
          </small>
        </article>

        <article>
          <span>🚑 DESFALQUES IMPORTANTES</span>
          <strong>Nao disponivel no plano atual</strong>
          <small>Sem lesionados, suspensos ou escalações confirmadas pela API neste momento.</small>
        </article>

        <article>
          <span>🎯 PLACAR MAIS PROVAVEL</span>
          <strong>{analysis.probableScore}</strong>
          <small>Estimativa baseada em gols marcados/sofridos nos ultimos jogos. Nao e garantia.</small>
        </article>

        <article>
          <span>⚠️ RISCO</span>
          <strong>{analysis.risk}</strong>
          <small>
            Confiança IA: {formatChance(analysis.confidence)}. Classificacao: {analysis.confidenceClass}.
          </small>
        </article>
      </div>

      <div className="advanced-bottom-grid">
        <article>
          <span>📌 MERCADOS MAIS INTERESSANTES</span>
          <ol>
            {(analysis.markets.length ? analysis.markets : [{ pick: pickText, probability: analysis.confidence, odd: game?.displayOdd || game?.oddHome }]).map((market, index) => (
              <li key={`${market.pick}-${index}`}>
                <strong>{getAdvancedMarketDisplayText(market, game)}</strong>
                <small>{formatChance(market.probability)} | Odd {formatOdd(market.odd)}</small>
              </li>
            ))}
          </ol>
        </article>

        <article>
          <span>🧠 CONCLUSAO GOL365</span>
          <p>
            A melhor leitura estatistica e <strong>{pickText}</strong>. A IA combina momento recente,
            gols, casa/fora e odds disponiveis para apontar valor provavel, sempre como apoio de analise
            e nunca como promessa de lucro.
          </p>
        </article>
      </div>
    </section>
  );
}

function PremiumAdvancedAnalysisPanel({ game, details, loading }) {
  const analysis = buildAdvancedAnalysis(game, details);
  const pickText = getPrimaryBetText(game?.displayPickLabel || game?.pickLabel, game);
  const hasRecentData = analysis.homeStats10.played || analysis.awayStats10.played;
  const marketFallback = [
    {
      pick: pickText,
      probability: analysis.confidence,
      odd: game?.displayOdd || game?.oddHome,
    },
  ];

  return (
    <section className="advanced-analysis-card">
      <div className="advanced-analysis-head">
        <div>
          <span>Analise estatistica avancada</span>
          <strong>Leitura profissional com risco controlado</strong>
        </div>
        <em className={`confidence-pill is-${analysis.confidenceClass.toLowerCase()}`}>
          {formatChance(analysis.confidence)} {analysis.confidenceClass}
        </em>
      </div>

      {loading ? (
        <p className="advanced-loading">Carregando forma recente, casa/fora e ultimos confrontos...</p>
      ) : null}

      <div className="advanced-analysis-grid">
        <article>
          <span>{"\u{1F3C6} JOGO"}</span>
          <strong>{analysis.homeName} x {analysis.awayName}</strong>
          <small>{pickText}</small>
        </article>

        <article>
          <span>{"\u{1F4CA} MOMENTO DAS EQUIPES"}</span>
          <strong>
            {hasRecentData
              ? `${analysis.homeName}: ${formatRecentFormRecord(analysis.homeStats10)} | ${analysis.awayName}: ${formatRecentFormRecord(analysis.awayStats10)}`
              : "Aguardando historico recente"}
          </strong>
          <small>
            {analysis.homeName}: {getRecentSequenceText(details?.teams?.home)}. {analysis.awayName}:{" "}
            {getRecentSequenceText(details?.teams?.away)}.
          </small>
        </article>

        <article>
          <span>{"\u26BD MEDIA DE GOLS"}</span>
          <strong>Total previsto: {formatAdvancedAverage(analysis.matchGoalsAverage)}</strong>
          <small>
            {analysis.homeName}: {formatAdvancedAverage(analysis.homeStats10.avgFor)} feitos /{" "}
            {formatAdvancedAverage(analysis.homeStats10.avgAgainst)} sofridos. {analysis.awayName}:{" "}
            {formatAdvancedAverage(analysis.awayStats10.avgFor)} feitos /{" "}
            {formatAdvancedAverage(analysis.awayStats10.avgAgainst)} sofridos.
          </small>
        </article>

        <article>
          <span>{"\u{1F3E0} CASA E FORA"}</span>
          <strong>
            Casa: {formatAdvancedAverage(analysis.homeVenue.avgFor)} gols | Fora:{" "}
            {formatAdvancedAverage(analysis.awayVenue.avgFor)} gols
          </strong>
          <small>
            Mandante em casa: {analysis.homeVenue.played || 0} jogos. Visitante fora:{" "}
            {analysis.awayVenue.played || 0} jogos.
          </small>
        </article>

        <article>
          <span>{"\u{1F525} TENDENCIAS"}</span>
          <strong>
            BTTS {formatAdvancedPercent(analysis.bttsProbability)} | Over 2.5{" "}
            {formatAdvancedPercent(analysis.over25Probability)}
          </strong>
          <small>
            Under 2.5: {formatAdvancedPercent(analysis.under25Probability)}. Escanteios: sem dados reais na API atual.
          </small>
        </article>

        <article>
          <span>{"\u{1F4C8} PROBABILIDADES"}</span>
          <strong>
            {analysis.homeName}: {formatAdvancedPercent(analysis.resultProbabilities.home)} | Empate:{" "}
            {formatAdvancedPercent(analysis.resultProbabilities.draw)}
          </strong>
          <small>{analysis.awayName}: {formatAdvancedPercent(analysis.resultProbabilities.away)}.</small>
        </article>

        <article>
          <span>{"\u{1F6A8} ATAQUE E DEFESA"}</span>
          <strong>
            Clean sheets: {analysis.homeName} {analysis.homeStats10.cleanSheets}/{analysis.homeStats10.played || 0} |{" "}
            {analysis.awayName} {analysis.awayStats10.cleanSheets}/{analysis.awayStats10.played || 0}
          </strong>
          <small>
            xG, xGA, finalizacoes e chances criadas: nao disponiveis na API atual. A leitura usa gols, fase e odds.
          </small>
        </article>

        <article>
          <span>{"\u{1F9E9} ESTILO TATICO"}</span>
          <strong>{analysis.isBalanced ? "Encaixe equilibrado" : "Leitura com lado mais forte"}</strong>
          <small>
            Posse, pressao alta, contra-ataque e linha defensiva exigem dados taticos externos. Sem esses dados, a IA reduz a confianca.
          </small>
        </article>

        <article>
          <span>{"\u{1F9E0} PSICOLOGICO E FISICO"}</span>
          <strong>{analysis.hasEnoughRecentData ? "Forma recente considerada" : "Dados recentes limitados"}</strong>
          <small>
            Crise interna, troca de tecnico, viagens, altitude e descanso nao estao confirmados pela API atual.
          </small>
        </article>

        <article>
          <span>{"\u{1F327} CLIMA E GRAMADO"}</span>
          <strong>Nao disponivel no plano atual</strong>
          <small>Chuva, temperatura e estado do gramado devem ser conferidos antes de entradas em gols ou escanteios.</small>
        </article>

        <article>
          <span>{"\u{1F691} DESFALQUES IMPORTANTES"}</span>
          <strong>Nao disponivel no plano atual</strong>
          <small>Sem lesionados, suspensos ou escalacoes confirmadas pela API neste momento.</small>
        </article>

        <article>
          <span>{"\u{1F4B0} ODDS E VALOR"}</span>
          <strong>{analysis.valueText}</strong>
          <small>Odds infladas e favoritismo exagerado precisam ser conferidos perto do inicio da partida.</small>
        </article>

        <article>
          <span>{"\u{1F40E} DETECTOR DE ZEBRAS"}</span>
          <strong>{analysis.zebraText}</strong>
          <small>Favoritos vulneraveis perdem forca quando fase recente e odds nao sustentam a leitura.</small>
        </article>

        <article>
          <span>{"\u{1F3AF} PLACAR MAIS PROVAVEL"}</span>
          <strong>{analysis.probableScore}</strong>
          <small>Estimativa baseada em gols marcados/sofridos nos ultimos jogos. Nao e garantia.</small>
        </article>

        <article>
          <span>{"\u26A0\uFE0F RISCO"}</span>
          <strong>{analysis.risk}</strong>
          <small>
            Confianca IA: {formatChance(analysis.confidence)}. Base bruta: {formatChance(analysis.rawConfidence)}. Classificacao: {analysis.confidenceClass}.
          </small>
        </article>

        <article>
          <span>{"\u{1F501} APRENDIZADO DA IA"}</span>
          <strong>Resultado alimenta o selo V/X</strong>
          <small>Depois do jogo, a previsao e comparada com o placar real para identificar padroes de acerto e erro.</small>
        </article>
      </div>

      <div className="advanced-bottom-grid">
        <article>
          <span>{"\u{1F4CC} MERCADOS MAIS INTERESSANTES"}</span>
          <ol>
            {(analysis.markets.length ? analysis.markets : marketFallback).map((market, index) => (
              <li key={`${market.pick}-${index}`}>
                <strong>{getAdvancedMarketDisplayText(market, game)}</strong>
                <small>{formatChance(market.probability)} | Odd {formatOdd(market.odd)}</small>
              </li>
            ))}
          </ol>
        </article>

        <article>
          <span>{"\u{1F9E0} CONCLUSAO GOL365"}</span>
          <p>
            A melhor leitura estatistica e <strong>{pickText}</strong>. A IA prioriza tendencia recente,
            consistencia, casa/fora e odds disponiveis. Se o jogo estiver equilibrado ou sem dados suficientes,
            a confianca e reduzida automaticamente. Use como apoio de analise, nunca como certeza de resultado.
          </p>
        </article>
      </div>
    </section>
  );
}

const isTeamNeutralMarket = (game, readablePick) => {
  const text = normalizeBetText(
    `${readablePick || ""} ${game?.displayPickLabel || ""} ${game?.pickLabel || ""} ${getReadableMarketName(game)}`
  );

  return (
    text.includes("ambas") ||
    text.includes("dois times") ||
    text.includes("gols") ||
    text.includes("mais de") ||
    text.includes("menos de") ||
    text.includes("jogo aberto") ||
    text.includes("gol contra") ||
    text.includes("escanteio") ||
    text.includes("cartao")
  );
};

const getPredictionSupportSide = (game) => {
  if (!game) {
    return null;
  }

  const readablePick = getPrimaryBetText(game.displayPickLabel || game.pickLabel, game);

  if (isTeamNeutralMarket(game, readablePick)) {
    return null;
  }

  const text = normalizeBetText(`${readablePick} ${game.displayPickLabel || ""} ${game.pickLabel || ""}`);
  const homeName = normalizeBetText(game.homeTeam);
  const awayName = normalizeBetText(game.awayTeam);
  const code = String(game.pickCode || "").toUpperCase();
  const supportsHome = Boolean(
    (homeName && text.includes(homeName)) ||
      text.includes("mandante") ||
      text.includes("casa") ||
      code === "1" ||
      code === "1X"
  );
  const supportsAway = Boolean(
    (awayName && text.includes(awayName)) ||
      text.includes("visitante") ||
      text.includes("fora") ||
      code === "2" ||
      code === "X2"
  );

  if (supportsHome && !supportsAway) {
    return "home";
  }

  if (supportsAway && !supportsHome) {
    return "away";
  }

  return null;
};

const getFormGuardrail = (game, details) => {
  if (!game || !details?.teams) {
    return null;
  }

  const supportedSide = getPredictionSupportSide(game);

  if (!supportedSide) {
    return null;
  }

  const opponentSide = supportedSide === "home" ? "away" : "home";
  const supportedTeam = details.teams[supportedSide];
  const opponentTeam = details.teams[opponentSide];
  const supported = getRecentFormProfile(supportedTeam);
  const opponent = getRecentFormProfile(opponentTeam);

  if (opponent.isStrong) {
    return {
      tone: "warning",
      title: "Cuidado: nao apostar contra time em boa fase",
      text: `${opponentTeam?.name || "O adversario"} vem bem nos ultimos 10 jogos (${formatRecentFormRecord(
        opponent
      )}). Esse palpite vai contra esse momento; reduza a forca da entrada ou procure outro mercado.`,
    };
  }

  if (supported.isStrong) {
    return {
      tone: "positive",
      title: "Forma recente ajuda o palpite",
      text: `${supportedTeam?.name || "O time indicado"} vem forte nos ultimos 10 jogos (${formatRecentFormRecord(
        supported
      )}). Isso reforca a leitura, mas ainda nao garante resultado.`,
    };
  }

  if (supported.played || opponent.played) {
    return {
      tone: "neutral",
      title: "Forma recente equilibrada",
      text: "Nos ultimos 10 jogos, nenhum dos lados mostra vantagem forte o bastante para bloquear o palpite.",
    };
  }

  return null;
};

const getBeforeColon = (value, fallback = "--") => {
  const text = String(value || "").trim();

  if (!text) {
    return fallback;
  }

  return text.split(":")[0] || fallback;
};

const getBubbleMainLabel = (game) => {
  const pick = String(game?.displayPickLabel || game?.pickLabel || "").toLowerCase();
  const home = String(game?.homeTeam || "");
  const away = String(game?.awayTeam || "");

  if (home && pick.includes(home.toLowerCase())) {
    return home;
  }

  if (away && pick.includes(away.toLowerCase())) {
    return away;
  }

  if (pick.includes("empate") || pick.includes("draw")) {
    return "Empate";
  }

  return home || game?.game || "Jogo";
};

const parseScore = (game) => {
  const match = String(game?.scoreLine || "").match(/(\d+)\s*x\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  };
};

const getLineValue = (text) => {
  const match = String(text || "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const getAiHitState = (game) => {
  const score = parseScore(game);

  if (!game?.isFinished || !score) {
    return {
      state: "pending",
      label: "Em validacao",
      note: "O jogo ainda nao terminou para confirmar o palpite.",
    };
  }

  const homeWon = score.home > score.away;
  const awayWon = score.away > score.home;
  const draw = score.home === score.away;
  const totalGoals = score.home + score.away;
  const pickCode = String(game?.pickCode || "").toUpperCase();
  const pickText = `${game?.displayPickLabel || ""} ${game?.pickLabel || ""}`.toLowerCase();
  const homeText = String(game?.homeTeam || "").toLowerCase();
  const awayText = String(game?.awayTeam || "").toLowerCase();
  const hasHome = Boolean(homeText && pickText.includes(homeText));
  const hasAway = Boolean(awayText && pickText.includes(awayText));
  const hasDraw = pickText.includes("empate") || pickText.includes("draw");
  const isHomeOrDraw =
    pickCode === "1X" ||
    pickText.includes("1x") ||
    pickText.includes("mandante ou empate") ||
    pickText.includes("casa ou empate") ||
    (hasHome && hasDraw);
  const isAwayOrDraw =
    pickCode === "X2" ||
    pickText.includes("x2") ||
    pickText.includes("visitante ou empate") ||
    pickText.includes("fora ou empate") ||
    (hasAway && hasDraw);
  const isNoDraw =
    pickCode === "12" ||
    pickText.includes("12") ||
    pickText.includes("sem empate") ||
    pickText.includes("sem draw");
  let hit = null;

  if (isHomeOrDraw) {
    hit = homeWon || draw;
  } else if (isAwayOrDraw) {
    hit = awayWon || draw;
  } else if (isNoDraw) {
    hit = !draw;
  } else if (pickText.includes("ambas") || pickText.includes("both teams")) {
    hit = pickText.includes("nao") || pickText.includes("no")
      ? !(score.home > 0 && score.away > 0)
      : score.home > 0 && score.away > 0;
  } else if (pickText.includes("mais de") || pickText.includes("over")) {
    const line = getLineValue(pickText);
    hit = line === null ? null : totalGoals > line;
  } else if (pickText.includes("menos de") || pickText.includes("under")) {
    const line = getLineValue(pickText);
    hit = line === null ? null : totalGoals < line;
  } else if (pickCode === "1" || hasHome) {
    hit = homeWon;
  } else if (pickCode === "2" || hasAway) {
    hit = awayWon;
  } else if (pickCode === "X" || hasDraw) {
    hit = draw;
  }

  if (hit === null) {
    return {
      state: "pending",
      label: "Sem conferencia",
      note: "Este mercado precisa de dados extras para confirmar o acerto.",
    };
  }

  return hit
    ? {
        state: "hit",
        label: "IA acertou",
        note: "O resultado final bateu com a leitura principal.",
      }
    : {
        state: "miss",
        label: "IA errou!",
        note: "O resultado final nao confirmou o palpite principal.",
      };
};

const getTier = (probability) => {
  if (probability >= 0.45) {
    return "high";
  }

  return "low";
};

const EDGE_PADDING = 10;
const COLLISION_GAP = 12;
const COLLISION_PASSES = 14;
const COLLISION_PUSH = 0.72;
const DRIFT_INTERVAL_MS = 180;
const FRAME_STEP_LIMIT = 0.12;
const VELOCITY_LIMIT = 0.0022;
const BOUNCE_DAMPING = 0.74;
const COLLISION_DAMPING = 0.28;
const DEFAULT_BUBBLE_SCALE = "small";
const MOBILE_BOARD_WIDTH = 520;
const MOBILE_VELOCITY_LIMIT = 0.012;

const isMobileBounds = (bounds = {}) => (bounds.width || 0) > 0 && bounds.width <= MOBILE_BOARD_WIDTH;

const getCrowdFactor = (total = 0) => {
  if (total >= 110) {
    return 0.54;
  }

  if (total >= 80) {
    return 0.62;
  }

  if (total >= 55) {
    return 0.72;
  }

  if (total >= 32) {
    return 0.78;
  }

  if (total >= 24) {
    return 0.84;
  }

  return 1;
};

const limitVelocity = (value) => clamp(value, -VELOCITY_LIMIT, VELOCITY_LIMIT);
const limitMobileVelocity = (value) => clamp(value, -MOBILE_VELOCITY_LIMIT, MOBILE_VELOCITY_LIMIT);

const getInitialVelocity = (index, axis) => {
  const direction = axis === "x" ? (index % 2 ? 1 : -1) : (index % 3 ? 1 : -1);
  const base = axis === "x" ? 0.001 : 0.0008;
  const spread = axis === "x" ? (index % 7) * 0.00016 : (index % 5) * 0.00014;

  return limitVelocity(direction * (base + spread));
};

const getMobileVelocity = (index, axis) => {
  const direction = axis === "x" ? (index % 2 ? 1 : -1) : (index % 3 ? 1 : -1);
  const base = axis === "x" ? 0.0045 : 0.0035;
  const spread = axis === "x" ? (index % 5) * 0.0007 : (index % 4) * 0.00055;

  return limitMobileVelocity(direction * (base + spread));
};

const getGridMetrics = (total = 0, bounds = {}) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const mobile = isMobileBounds(bounds);

  if (!mobile && total < 24) {
    return null;
  }

  const columns = mobile ? (width <= 380 ? 3 : 4) : width >= 1500 ? 7 : width >= 1200 ? 6 : width >= 920 ? 5 : 4;
  const rows = Math.max(1, Math.ceil(total / columns));
  const topOffset = mobile ? 108 : 92;
  const minSlotHeight = mobile ? 88 : 112;
  const layoutHeight = Math.max(height, topOffset + rows * minSlotHeight + EDGE_PADDING * 2);
  const slotWidth = (width - EDGE_PADDING * 2) / columns;
  const usableHeight = Math.max(rows * minSlotHeight, layoutHeight - topOffset - EDGE_PADDING * 2);
  const slotHeight = usableHeight / rows;
  const maxSize = Math.max(mobile ? 42 : 56, Math.min(slotWidth, slotHeight) - (mobile ? 20 : 28));

  return {
    columns,
    layoutHeight,
    maxSize,
    mobile,
    rows,
    slotHeight,
    slotWidth,
    topOffset,
    width,
  };
};

const getDisplaySize = (probability, scale, total = 0, bounds = {}) => {
  const sizingTotal = clamp(total || RADAR_INITIAL_LIMIT, 1, RADAR_INITIAL_LIMIT);
  const crowdFactor = getCrowdFactor(sizingTotal);
  const boardWidth = bounds.width || 1280;
  const boardFactor = boardWidth <= 420 ? 0.62 : boardWidth <= 760 ? 0.72 : boardWidth <= 1024 ? 0.86 : 1;
  const base = (48 + clamp(probability || 0.33, 0.05, 0.9) * 170) * crowdFactor * boardFactor;
  const metrics = getGridMetrics(total, bounds);
  const gridMaxSize = metrics?.maxSize || Number.POSITIVE_INFINITY;

  if (scale === "large") {
    return clamp(
      base * 1.1,
      boardWidth <= MOBILE_BOARD_WIDTH ? 46 : 58,
      Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 74 : 238, gridMaxSize)
    );
  }

  if (scale === "small") {
    return clamp(
      base * 0.78,
      boardWidth <= MOBILE_BOARD_WIDTH ? 38 : 42,
      Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 68 : 150, gridMaxSize)
    );
  }

  return clamp(
    base * 0.92,
    boardWidth <= MOBILE_BOARD_WIDTH ? 42 : 50,
    Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 72 : 198, gridMaxSize)
  );
};

const getInitialPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const metrics = getGridMetrics(total, bounds);

  if (metrics) {
    const column = index % metrics.columns;
    const row = Math.floor(index / metrics.columns);
    const jitterX = metrics.mobile ? 0 : ((index % 3) - 1) * Math.min(10, metrics.slotWidth * 0.04);
    const jitterY = metrics.mobile ? 0 : (((index + 1) % 3) - 1) * Math.min(8, metrics.slotHeight * 0.05);
    const x = EDGE_PADDING + column * metrics.slotWidth + Math.max(0, (metrics.slotWidth - size) / 2) + jitterX;
    const y = metrics.topOffset + row * metrics.slotHeight + Math.max(0, (metrics.slotHeight - size) / 2) + jitterY;

    return {
      x: clamp(x, EDGE_PADDING, width - size - EDGE_PADDING),
      y: clamp(y, EDGE_PADDING, metrics.layoutHeight - size - EDGE_PADDING),
    };
  }

  const angle = index * 2.399963229728653;
  const orbit = Math.sqrt(index + 1) * (width > 900 ? 68 : width > 520 ? 44 : 30);
  const centerX = width / 2;
  const centerY = height / 2;
  const x = centerX + Math.cos(angle) * orbit * (width > 520 ? 1.68 : 1.08) - size / 2;
  const y = centerY + Math.sin(angle) * orbit * (width > 520 ? 1.08 : 1.28) - size / 2;

  return {
    x: clamp(x, 18, width - size - 18),
    y: clamp(y, 18, height - size - 18),
  };
};

const createBubble = (game, existing, bounds, index, total, scale) => {
  const size = getDisplaySize(game.bubbleValue ?? game.probability, scale, total, bounds);
  const mobile = isMobileBounds(bounds);
  const anchoredLayout = Boolean(getGridMetrics(total, bounds));
  const initialPosition = getInitialPosition(index, total, bounds, size);
  const position = anchoredLayout || mobile ? initialPosition : existing ?? initialPosition;

  return {
    ...game,
    anchorX: initialPosition.x,
    anchorY: initialPosition.y,
    anchoredLayout,
    size,
    radius: size / 2,
    tier: getTier(game.bubbleValue ?? game.probability),
    x: position.x,
    y: position.y,
    vx: mobile
      ? existing?.vx
        ? limitMobileVelocity(existing.vx)
        : getMobileVelocity(index, "x")
      : existing?.vx
        ? limitVelocity(existing.vx)
        : getInitialVelocity(index, "x"),
    vy: mobile
      ? existing?.vy
        ? limitMobileVelocity(existing.vy)
        : getMobileVelocity(index, "y")
      : existing?.vy
        ? limitVelocity(existing.vy)
        : getInitialVelocity(index, "y"),
  };
};

const resolveBubbleCollisions = (items, bounds, mobile = false) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const next = items.map((item) => ({ ...item }));
  const limitCurrentVelocity = mobile ? limitMobileVelocity : limitVelocity;
  const impulse = mobile ? 0 : 0.00005;

  for (let pass = 0; pass < COLLISION_PASSES; pass += 1) {
    for (let index = 0; index < next.length; index += 1) {
      for (let compare = index + 1; compare < next.length; compare += 1) {
        const first = next[index];
        const second = next[compare];
        const dx = first.x + first.radius - (second.x + second.radius);
        const dy = first.y + first.radius - (second.y + second.radius);
        const distance = Math.hypot(dx, dy) || 1;
        const minDistance = first.radius + second.radius + COLLISION_GAP;

        if (distance >= minDistance) {
          continue;
        }

        const overlap = (minDistance - distance) * COLLISION_PUSH;
        const normalX = dx / distance;
        const normalY = dy / distance;
        const radiusTotal = first.radius + second.radius || 1;
        const firstPush = second.radius / radiusTotal;
        const secondPush = first.radius / radiusTotal;

        first.x = clamp(
          first.x + normalX * overlap * firstPush,
          EDGE_PADDING,
          width - first.size - EDGE_PADDING
        );
        first.y = clamp(
          first.y + normalY * overlap * firstPush,
          EDGE_PADDING,
          height - first.size - EDGE_PADDING
        );
        second.x = clamp(
          second.x - normalX * overlap * secondPush,
          EDGE_PADDING,
          width - second.size - EDGE_PADDING
        );
        second.y = clamp(
          second.y - normalY * overlap * secondPush,
          EDGE_PADDING,
          height - second.size - EDGE_PADDING
        );

        first.vx = limitCurrentVelocity((first.vx + normalX * impulse) * COLLISION_DAMPING);
        first.vy = limitCurrentVelocity((first.vy + normalY * impulse) * COLLISION_DAMPING);
        second.vx = limitCurrentVelocity((second.vx - normalX * impulse) * COLLISION_DAMPING);
        second.vy = limitCurrentVelocity((second.vy - normalY * impulse) * COLLISION_DAMPING);
      }
    }
  }

  return next;
};

const constrainBubbleToAnchor = (bubble, bounds, mobile = false) => {
  if (!bubble.anchoredLayout || !Number.isFinite(bubble.anchorX) || !Number.isFinite(bubble.anchorY)) {
    return bubble;
  }

  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, bubble.anchorY + bubble.size + EDGE_PADDING);
  const drift = mobile ? 4 : Math.max(6, Math.min(12, bubble.size * 0.08));
  const minX = clamp(bubble.anchorX - drift, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
  const maxX = clamp(bubble.anchorX + drift, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
  const minY = clamp(bubble.anchorY - drift, EDGE_PADDING, height - bubble.size - EDGE_PADDING);
  const maxY = clamp(bubble.anchorY + drift, EDGE_PADDING, height - bubble.size - EDGE_PADDING);

  if (bubble.x <= minX || bubble.x >= maxX) {
    bubble.vx = (mobile ? limitMobileVelocity : limitVelocity)(bubble.vx * -0.6);
    bubble.x = clamp(bubble.x, Math.min(minX, maxX), Math.max(minX, maxX));
  }

  if (bubble.y <= minY || bubble.y >= maxY) {
    bubble.vy = (mobile ? limitMobileVelocity : limitVelocity)(bubble.vy * -0.6);
    bubble.y = clamp(bubble.y, Math.min(minY, maxY), Math.max(minY, maxY));
  }

  return bubble;
};

const moveBubbles = (items, bounds, step = 1) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);

  if (isMobileBounds(bounds)) {
    const safeStep = clamp(step, 0, 0.08);

    const next = items.map((item) => {
      const next = {
        ...item,
        x: item.x + limitMobileVelocity(item.vx) * safeStep,
        y: item.y + limitMobileVelocity(item.vy) * safeStep,
        vx: limitMobileVelocity(item.vx),
        vy: limitMobileVelocity(item.vy),
      };

      if (next.x <= EDGE_PADDING || next.x >= width - next.size - EDGE_PADDING) {
        next.vx = limitMobileVelocity(next.vx * -0.72);
        next.x = clamp(next.x, EDGE_PADDING, width - next.size - EDGE_PADDING);
      }

      if (next.y <= EDGE_PADDING || next.y >= height - next.size - EDGE_PADDING) {
        next.vy = limitMobileVelocity(next.vy * -0.72);
        next.y = clamp(next.y, EDGE_PADDING, height - next.size - EDGE_PADDING);
      }

      return constrainBubbleToAnchor(next, bounds, true);
    });

    return next.some((item) => item.anchoredLayout) ? next : resolveBubbleCollisions(next, bounds, true);
  }

  const safeStep = clamp(step, 0, FRAME_STEP_LIMIT);
  const next = items.map((item) => {
    const bubble = {
      ...item,
      x: item.x + item.vx * safeStep,
      y: item.y + item.vy * safeStep,
    };

    if (bubble.x <= EDGE_PADDING || bubble.x >= width - bubble.size - EDGE_PADDING) {
      bubble.vx = limitVelocity(bubble.vx * -BOUNCE_DAMPING);
      bubble.x = clamp(bubble.x, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
    }

    if (bubble.y <= EDGE_PADDING || bubble.y >= height - bubble.size - EDGE_PADDING) {
      bubble.vy = limitVelocity(bubble.vy * -BOUNCE_DAMPING);
      bubble.y = clamp(bubble.y, EDGE_PADDING, height - bubble.size - EDGE_PADDING);
    }

    return constrainBubbleToAnchor(bubble, bounds);
  });

  return next.some((item) => item.anchoredLayout) ? next : resolveBubbleCollisions(next, bounds);
};

const getAiSummary = (game) => {
  if (game?.aiInsights?.headline) {
    return game.aiInsights.headline;
  }

  const leader = game?.marketOptions?.[0];
  const second = game?.marketOptions?.[1];
  const gap = Math.max(0, (leader?.probability || 0) - (second?.probability || 0));

  if (!leader) {
    return "Sem leitura completa ainda";
  }

  if (game?.confidence === "estimate") {
    return `Modelo visual favorece ${leader.label}`;
  }

  if (gap >= 0.16) {
    return `Mercado forte para ${leader.label}`;
  }

  return `Jogo competitivo, leve vantagem para ${leader.label}`;
};

const getAiScoreNumber = (game) => Number(game?.aiInsights?.score || 0);

const findMarketByCategory = (game, category) =>
  (game?.betMarkets || []).find((market) => market?.category === category && market?.leader);

const findBttsMarket = (game) =>
  (game?.betMarkets || []).find((market) => {
    const name = `${market?.name || ""} ${market?.leader?.label || ""}`.toLowerCase();
    return market?.leader && (name.includes("ambas") || name.includes("both teams"));
  });

const getMarketText = (market) =>
  normalizeBetText(
    `${market?.category || ""} ${market?.name || ""} ${market?.leader?.label || ""} ${translateBetText(
      market?.name || ""
    )} ${translateBetText(market?.leader?.label || "")}`
  );

const hasNegativeSignal = (text) => /\b(nao|no|evitar)\b/.test(text);

const isBttsNoMarket = (market) => {
  const text = getMarketText(market);

  return (
    (text.includes("ambas") ||
      text.includes("both teams") ||
      text.includes("btts") ||
      text.includes("dois times")) &&
    hasNegativeSignal(text)
  );
};

const isNegativeOpenMarket = (market) => {
  const text = getMarketText(market);

  return (
    (text.includes("ambas") ||
      text.includes("both teams") ||
      text.includes("btts") ||
      text.includes("dois times")) &&
    (text.includes("2.5") || text.includes("2,5") || text.includes("mais de 2")) &&
    hasNegativeSignal(text)
  );
};

const isLowLineUnderMarket = (market) => {
  const text = getMarketText(market);

  return (
    market?.category === "Gols" &&
    (text.includes("menos de") || text.includes("under")) &&
    /(?:menos de|under)\s*0[,.]?5/.test(text)
  );
};

const isRiskyUnderMarket = (market) => {
  const text = getMarketText(market);

  return (
    market?.category === "Gols" &&
    (text.includes("menos de") || text.includes("under")) &&
    /(?:menos de|under)\s*1[,.]?5/.test(text)
  );
};

const getMarketFamily = (market) => {
  const text = getMarketText(market);

  if (text.includes("corner") || text.includes("escanteio")) {
    return "Escanteios";
  }

  if (text.includes("draw no bet") || text.includes("empate anula")) {
    return "Empate anula";
  }

  if (text.includes("dupla chance") || text.includes("double chance") || text.includes(" ou empate")) {
    return "Dupla chance";
  }

  if (text.includes("ambas") || text.includes("both teams") || text.includes("btts") || text.includes("dois times")) {
    return "Ambas marcam";
  }

  if ((text.includes("mais de") || text.includes("over")) && (text.includes("gol") || text.includes("goal"))) {
    return "Over gols";
  }

  if ((text.includes("menos de") || text.includes("under")) && (text.includes("gol") || text.includes("goal"))) {
    return "Under gols";
  }

  if (market?.category === "Resultado + Gols") {
    return "Combinada";
  }

  if (market?.category === "Resultado") {
    return "Vitoria simples";
  }

  return market?.category || "Outros";
};

const PRIMARY_MARKET_FAMILIES = new Set([
  "Vitoria simples",
  "Dupla chance",
  "Empate anula",
  "Over gols",
  "Under gols",
  "Ambas marcam",
]);

const isUnsupportedPrimaryMarket = (market) => {
  const text = getMarketText(market);

  return (
    text.includes("1st half") ||
    text.includes("2nd half") ||
    text.includes("first half") ||
    text.includes("second half") ||
    text.includes("primeiro tempo") ||
    text.includes("segundo tempo") ||
    text.includes("half time") ||
    text.includes("halftime") ||
    text.includes("period") ||
    text.includes("quarter") ||
    text.includes("score a goal") ||
    text.includes("time marca gol") ||
    text.includes("gol contra") ||
    text.includes("own goal") ||
    text.includes("clean sheet") ||
    text.includes("sem sofrer gol") ||
    text.includes("cartao") ||
    text.includes("corner") ||
    text.includes("escanteio") ||
    text.includes("combinada") ||
    text.includes("resultado + gols") ||
    text.includes("mandante/visitante") ||
    text.includes("home/away")
  );
};

const isPrimaryPredictionMarket = (market) => {
  if (!market?.leader || isLowLineUnderMarket(market) || isUnsupportedPrimaryMarket(market)) {
    return false;
  }

  const family = getMarketFamily(market);

  if (!PRIMARY_MARKET_FAMILIES.has(family)) {
    return false;
  }

  const probability = market?.leader?.probability || 0;

  if (probability < AI_STATS_MIN_CONFIDENCE) {
    return false;
  }

  if (isBttsNoMarket(market) && probability < 0.72) {
    return false;
  }

  return true;
};

const getRecentFamilyPenalty = (family, recentFamilies = []) => {
  const lastThree = recentFamilies.slice(-3);
  const repeatedThree = lastThree.length === 3 && lastThree.every((item) => item === family);
  const repeatedTwo = lastThree.slice(-2).length === 2 && lastThree.slice(-2).every((item) => item === family);

  if (repeatedThree) {
    return 0.52;
  }

  if (repeatedTwo) {
    return 0.3;
  }

  return lastThree.includes(family) ? 0.12 : 0;
};

const getPreferredMarketScore = (market, recentFamilies = []) => {
  const text = getMarketText(market);
  const family = getMarketFamily(market);
  const probability = market?.leader?.probability || 0;
  const confidence = market?.confidence || 0;
  let score = probability + confidence * 0.22;

  if (!isPrimaryPredictionMarket(market)) score -= 2;
  if (family === "Vitoria simples") score += 0.12;
  if (family === "Dupla chance") score += 0.16;
  if (family === "Empate anula") score += 0.14;
  if (family === "Over gols") score += 0.13;
  if (family === "Ambas marcam") score += 0.09;
  if (family === "Under gols") score -= 0.18;
  if (isBttsNoMarket(market)) score -= 0.32;
  if (isNegativeOpenMarket(market)) score -= 0.5;
  if (isLowLineUnderMarket(market)) score -= 1;
  if (isRiskyUnderMarket(market)) score -= 0.18;
  if (text.includes("gol contra") || text.includes("own goal")) score -= 0.35;
  if (text.includes("cartao")) score -= 0.35;
  if (probability < AI_STATS_MIN_CONFIDENCE) score -= 0.24;
  score -= getRecentFamilyPenalty(family, recentFamilies);

  return score;
};

const sortMarketsByPreference = (markets, recentFamilies = []) =>
  [...markets].sort(
    (left, right) =>
      getPreferredMarketScore(right, recentFamilies) - getPreferredMarketScore(left, recentFamilies) ||
      (right.leader?.probability || 0) - (left.leader?.probability || 0) ||
      (right.confidence || 0) - (left.confidence || 0)
  );

const getBestMarket = (game, recentFamilies = []) =>
  sortMarketsByPreference(
    (game?.betMarkets || []).filter(isPrimaryPredictionMarket),
    recentFamilies
  )[0] ||
  sortMarketsByPreference(
    (game?.betMarkets || []).filter((market) => market?.leader && !isLowLineUnderMarket(market)),
    recentFamilies
  )[0];

const getGoalsMarket = (game, recentFamilies = []) =>
  sortMarketsByPreference(
    (game?.betMarkets || []).filter(
      (market) => market?.category === "Gols" && isPrimaryPredictionMarket(market)
    ),
    recentFamilies
  )[0] ||
  findMarketByCategory(game, "Gols");

const getDisplayMarket = (game, activeFilter, recentFamilies = []) => {
  if (activeFilter === "goals") {
    const market = getGoalsMarket(game, recentFamilies);
    return market?.leader
      ? {
          category: "Gols",
          name: market.name,
          label: market.leader.label,
          probability: market.leader.probability,
          odd: market.leader.odd,
        }
      : null;
  }

  if (activeFilter === "btts") {
    const market = findBttsMarket(game);
    return market?.leader
      ? {
          category: "Ambas marcam",
          name: market.name,
          label: market.leader.label,
          probability: market.leader.probability,
          odd: market.leader.odd,
        }
      : null;
  }

  if (activeFilter === "best") {
    const market = getBestMarket(game, recentFamilies);

    if (market?.leader) {
      return {
        category: market.category || "Principal",
        name: market.name || "Melhor palpite",
        label: market.leader.label,
        probability: market.leader.probability,
        odd: market.leader.odd,
      };
    }
  }

  return {
    category: game?.displayMarketCategory || game?.marketCategory || "Principal",
    name: game?.displayMarketName || game?.marketName || "Melhor palpite",
    label: game?.displayPickLabel || game?.pickLabel || "Palpite principal",
    probability: game?.displayProbability || game?.probability || 0,
    odd: game?.displayOdd || game?.oddHome || 0,
  };
};

const withDisplayMarket = (game, activeFilter, recentFamilies = []) => {
  const market = getDisplayMarket(game, activeFilter, recentFamilies);

  if (!market) {
    return null;
  }

  return {
    ...game,
    displayMarketCategory: market.category,
    displayMarketName: market.name,
    displayPickLabel: market.label,
    displayProbability: market.probability,
    displayOdd: market.odd,
    displayMarketFamily: getMarketFamily({
      category: market.category,
      name: market.name,
      leader: { label: market.label, probability: market.probability, odd: market.odd },
    }),
  };
};

const getDisplayMarketShape = (game) => ({
  category: game?.displayMarketCategory || game?.marketCategory || "Principal",
  name: game?.displayMarketName || game?.marketName || "Melhor palpite",
  leader: {
    label: game?.displayPickLabel || game?.pickLabel || "",
    probability: game?.displayProbability || game?.probability || 0,
    odd: game?.displayOdd || game?.oddHome || 0,
  },
});

const shouldCountAiStat = (game) => {
  const market = getDisplayMarketShape(game);

  return isPrimaryPredictionMarket(market);
};

const getFilterTitle = (activeFilter, mode) => {
  if (activeFilter === "live") {
    return "Jogos ao vivo";
  }

  if (activeFilter === "goals") {
    return "Palpites de gols";
  }

  if (activeFilter === "btts") {
    return "Ambas marcam";
  }

  if (mode === "worldcup") {
    return "Melhores da Copa 2026";
  }

  return "Melhores palpites de hoje";
};

const getFilterSubtitle = (activeFilter) => {
  if (activeFilter === "best") {
    return "Poucas bolhas, melhores oportunidades primeiro.";
  }

  if (activeFilter === "live") {
    return "Somente jogos em andamento agora.";
  }

  if (activeFilter === "goals") {
    return "Mercados de gols mais faceis de conferir.";
  }

  if (activeFilter === "btts") {
    return "Jogos em que ambas marcam merece atencao.";
  }

  return "Mapa completo do radar.";
};

const isWorldCupGroupRound = (round = "") =>
  /(?:group|grupo)\s+[a-l]/i.test(String(round || ""));

const getWorldCupGroupName = (round = "") => {
  const match = String(round || "").match(/(?:group|grupo)\s+([a-l])/i);
  return match ? `Grupo ${match[1].toUpperCase()}` : "Grupo a definir";
};

const getWorldCupRoundLabel = (round = "") => {
  const text = String(round || "").trim();

  if (!text) {
    return "Fase a definir";
  }

  const roundMap = [
    { match: /group\s+([a-l])/i, label: (found) => `Grupo ${found[1].toUpperCase()}` },
    { match: /round of 32/i, label: () => "16 avos de final" },
    { match: /round of 16/i, label: () => "Oitavas de final" },
    { match: /quarter/i, label: () => "Quartas de final" },
    { match: /semi/i, label: () => "Semifinal" },
    { match: /third/i, label: () => "Disputa de 3o lugar" },
    { match: /final/i, label: () => "Final" },
  ];

  for (const item of roundMap) {
    const found = text.match(item.match);

    if (found) {
      return item.label(found);
    }
  }

  return text;
};

const parseScorePair = (game) => {
  const match = String(game?.scoreLine || "").match(/(\d+)\s*x\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  };
};

const getWorldCupTeamKey = (id, name) =>
  id ? `id-${id}` : `name-${normalizeBetText(name || "time-a-definir")}`;

const getTeamFixtureLabel = (game) => {
  if (game?.isLive) {
    return `Ao vivo, ${formatClock(game)}`;
  }

  if (game?.isFinished) {
    return `Encerrado, ${formatScoreLine(game)}`;
  }

  return formatKickoff(game?.commenceTime);
};

const addWorldCupTeam = (map, team, game, side) => {
  if (!team?.name || team.name === "A definir") {
    return;
  }

  const key = getWorldCupTeamKey(team.id, team.name);
  const current =
    map.get(key) || {
      id: team.id || key,
      key,
      name: team.name,
      logo: team.logo || "",
      group: isWorldCupGroupRound(game?.round) ? getWorldCupGroupName(game.round) : "Grupo a definir",
      games: [],
      nextGame: null,
      liveGame: null,
      finished: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      chanceSamples: [],
    };

  current.games.push(game);

  if (isWorldCupGroupRound(game?.round)) {
    current.group = getWorldCupGroupName(game.round);
  }

  if (game?.isLive) {
    current.liveGame = game;
  } else if (!game?.isFinished) {
    const currentStamp = current.nextGame ? getKickoffStamp(current.nextGame) : Number.POSITIVE_INFINITY;
    const nextStamp = getKickoffStamp(game);

    if (nextStamp < currentStamp) {
      current.nextGame = game;
    }
  }

  const rowGame = withDisplayMarket(game, "best") || game;
  current.chanceSamples.push(rowGame.displayProbability || rowGame.probability || 0);

  const score = parseScorePair(game);

  if (score && game?.isFinished) {
    const goalsFor = side === "home" ? score.home : score.away;
    const goalsAgainst = side === "home" ? score.away : score.home;
    current.finished += 1;
    current.goalsFor += goalsFor;
    current.goalsAgainst += goalsAgainst;

    if (goalsFor > goalsAgainst) {
      current.wins += 1;
    } else if (goalsFor < goalsAgainst) {
      current.losses += 1;
    } else {
      current.draws += 1;
    }
  }

  map.set(key, current);
};

const buildWorldCupTeams = (games) => {
  const map = new Map();

  games.forEach((game) => {
    addWorldCupTeam(
      map,
      { id: game.homeTeamId, name: game.homeTeam, logo: game.homeLogo },
      game,
      "home"
    );
    addWorldCupTeam(
      map,
      { id: game.awayTeamId, name: game.awayTeam, logo: game.awayLogo },
      game,
      "away"
    );
  });

  return Array.from(map.values())
    .map((team) => {
      const averageChance =
        team.chanceSamples.length
          ? team.chanceSamples.reduce((sum, value) => sum + value, 0) / team.chanceSamples.length
          : 0;

      return {
        ...team,
        strength: averageChance,
        points: team.wins * 3 + team.draws,
        goalDifference: team.goalsFor - team.goalsAgainst,
      };
    })
    .sort(
      (left, right) =>
        right.strength - left.strength ||
        left.group.localeCompare(right.group) ||
        left.name.localeCompare(right.name)
    )
    .slice(0, 48);
};

const createWorldCupGroupRow = (team) => ({
  key: getWorldCupTeamKey(team.id, team.name),
  id: team.id || team.name,
  name: team.name,
  logo: team.logo || "",
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
});

const addWorldCupGroupTeam = (group, team) => {
  const key = getWorldCupTeamKey(team.id, team.name);

  if (!group.rows.has(key)) {
    group.rows.set(key, createWorldCupGroupRow(team));
  }

  return group.rows.get(key);
};

const buildWorldCupGroups = (games) => {
  const groups = new Map();

  games
    .filter((game) => isWorldCupGroupRound(game.round))
    .forEach((game) => {
      const groupName = getWorldCupGroupName(game.round);
      const group =
        groups.get(groupName) || {
          name: groupName,
          rows: new Map(),
          fixtures: [],
        };
      const home = addWorldCupGroupTeam(group, {
        id: game.homeTeamId,
        name: game.homeTeam,
        logo: game.homeLogo,
      });
      const away = addWorldCupGroupTeam(group, {
        id: game.awayTeamId,
        name: game.awayTeam,
        logo: game.awayLogo,
      });
      const score = parseScorePair(game);

      group.fixtures.push(game);

      if (score && game.isFinished) {
        home.played += 1;
        away.played += 1;
        home.goalsFor += score.home;
        home.goalsAgainst += score.away;
        away.goalsFor += score.away;
        away.goalsAgainst += score.home;

        if (score.home > score.away) {
          home.wins += 1;
          away.losses += 1;
          home.points += 3;
        } else if (score.home < score.away) {
          away.wins += 1;
          home.losses += 1;
          away.points += 3;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }
      }

      groups.set(groupName, group);
    });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      fixtures: group.fixtures.sort((left, right) => getKickoffStamp(left) - getKickoffStamp(right)),
      rows: Array.from(group.rows.values()).sort((left, right) => {
        const leftGoalDifference = left.goalsFor - left.goalsAgainst;
        const rightGoalDifference = right.goalsFor - right.goalsAgainst;

        return (
          right.points - left.points ||
          rightGoalDifference - leftGoalDifference ||
          right.goalsFor - left.goalsFor ||
          left.name.localeCompare(right.name)
        );
      }),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

const buildWorldCupStages = (games) => {
  const groups = new Map();
  const fallbackStages = ["16 avos de final", "Oitavas de final", "Quartas de final", "Semifinal", "Final"];

  games
    .filter((game) => !isWorldCupGroupRound(game.round))
    .forEach((game) => {
      const label = getWorldCupRoundLabel(game.round);
      const list = groups.get(label) || [];
      list.push(game);
      groups.set(label, list);
    });

  if (!groups.size) {
    return fallbackStages.map((name) => ({ name, games: [] }));
  }

  return Array.from(groups.entries()).map(([name, list]) => ({
    name,
    games: list.sort((left, right) => getKickoffStamp(left) - getKickoffStamp(right)),
  }));
};

function WorldCupHub({
  games,
  groups,
  loading,
  onOpenGame,
  onSelectTeam,
  onViewChange,
  selectedTeamId,
  stages,
  teams,
  view,
}) {
  return (
    <section className="worldcup-hub" aria-label="Central da Copa 2026">
      <div className="worldcup-head">
        <div>
          <span>Central Copa 2026</span>
          <strong>Calendario, selecoes, tabela e mata-mata</strong>
          <small>Horarios sempre no {BRASILIA_TIMEZONE_LABEL}.</small>
        </div>

        <nav className="worldcup-tabs" aria-label="Abas da Copa 2026">
          {WORLD_CUP_VIEW_TABS.map((item) => (
            <button
              className={view === item.id ? "chip-button is-active" : "chip-button"}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {view === "games" ? (
        <WorldCupCalendarPanel games={games} loading={loading} onOpenGame={onOpenGame} />
      ) : null}
      {view === "teams" ? (
        <WorldCupTeamsPanel
          onOpenGame={onOpenGame}
          onSelectTeam={onSelectTeam}
          selectedTeamId={selectedTeamId}
          teams={teams}
        />
      ) : null}
      {view === "table" ? <WorldCupTablePanel groups={groups} /> : null}
      {view === "bracket" ? <WorldCupBracketPanel onOpenGame={onOpenGame} stages={stages} /> : null}
    </section>
  );
}

function WorldCupCalendarPanel({ games, loading, onOpenGame }) {
  const orderedGames = [...games].sort((left, right) => getKickoffStamp(left) - getKickoffStamp(right));

  return (
    <div className="worldcup-panel">
      <div className="worldcup-panel-header">
        <div>
          <span>Jogos da Copa</span>
          <strong>{orderedGames.length} partidas no calendario</strong>
        </div>
        <small>Inclui data, horario, fase, estadio e palpite principal quando disponivel.</small>
      </div>

      <div className="worldcup-calendar-list">
        {orderedGames.map((game) => (
          <button
            className="worldcup-calendar-row"
            key={game.id}
            onClick={() => onOpenGame(game.id)}
            type="button"
          >
            <span>
              <strong>{formatKickoff(game.commenceTime)}</strong>
              <small>{getWorldCupRoundLabel(game.round)}</small>
            </span>
            <span>
              <strong>{game.game}</strong>
              <small>{[game.venue, game.city].filter(Boolean).join(" - ") || "Local a definir"}</small>
            </span>
            <span>
              <strong>{getPrimaryBetText(game.displayPickLabel || game.pickLabel, game)}</strong>
              <small>{formatChance(game.displayProbability || game.probability)} chance</small>
            </span>
            <span>
              <strong>{formatScoreLine(game)}</strong>
              <small>{getGameStatusLabel(game)}</small>
            </span>
          </button>
        ))}
      </div>

      {!loading && !orderedGames.length ? (
        <div className="worldcup-empty">Ainda nao recebemos jogos da Copa pela API.</div>
      ) : null}
    </div>
  );
}

function WorldCupTeamsPanel({ teams, selectedTeamId, onSelectTeam, onOpenGame }) {
  const selectedTeam =
    teams.find((team) => String(team.id) === String(selectedTeamId)) || teams[0] || null;

  return (
    <div className="worldcup-panel">
      <div className="worldcup-panel-header">
        <div>
          <span>Bolhas das selecoes</span>
          <strong>{teams.length} de 48 selecoes mapeadas</strong>
        </div>
        <small>A bolha maior indica maior leitura media da IA nos jogos ja carregados.</small>
      </div>

      <div className="worldcup-teams-layout">
        <div className="worldcup-teams-grid">
          {teams.map((team) => (
            <button
              className={
                selectedTeam?.key === team.key
                  ? "worldcup-team-bubble is-active"
                  : "worldcup-team-bubble"
              }
              key={team.key}
              onClick={() => onSelectTeam(team.id)}
              style={{
                "--team-scale": `${0.88 + Math.min(0.34, (team.strength || 0) * 0.34)}`,
              }}
              type="button"
            >
              {team.logo ? <img alt="" src={team.logo} /> : null}
              <strong>{team.name}</strong>
              <span>{formatChance(team.strength)}</span>
              <small>{team.group}</small>
            </button>
          ))}
        </div>

        <aside className="worldcup-team-detail">
          {selectedTeam ? (
            <>
              <span>Selecao selecionada</span>
              <strong>{selectedTeam.name}</strong>
              <small>{selectedTeam.group}</small>

              <div className="worldcup-team-stats">
                <article>
                  <span>Jogos</span>
                  <strong>{selectedTeam.games.length}</strong>
                </article>
                <article>
                  <span>Gols</span>
                  <strong>
                    {selectedTeam.goalsFor} x {selectedTeam.goalsAgainst}
                  </strong>
                </article>
                <article>
                  <span>Forca IA</span>
                  <strong>{formatChance(selectedTeam.strength)}</strong>
                </article>
              </div>

              <div className="worldcup-team-fixtures">
                {selectedTeam.games
                  .slice()
                  .sort((left, right) => getKickoffStamp(left) - getKickoffStamp(right))
                  .map((game) => (
                    <button key={game.id} onClick={() => onOpenGame(game.id)} type="button">
                      <strong>{game.game}</strong>
                      <small>{getTeamFixtureLabel(game)}</small>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <p>As selecoes aparecem aqui quando a API devolver o calendario completo.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function WorldCupTablePanel({ groups }) {
  return (
    <div className="worldcup-panel">
      <div className="worldcup-panel-header">
        <div>
          <span>Tabela da Copa</span>
          <strong>Grupos e classificacao</strong>
        </div>
        <small>Quando os resultados chegarem, a tabela atualiza pontos, saldo e gols.</small>
      </div>

      <div className="worldcup-group-grid">
        {groups.map((group) => (
          <article className="worldcup-group-card" key={group.name}>
            <h3>{group.name}</h3>
            <div className="worldcup-standings-head">
              <span>Time</span>
              <span>J</span>
              <span>SG</span>
              <span>GP</span>
              <span>Pts</span>
            </div>
            {group.rows.map((row) => (
              <div className="worldcup-standings-row" key={row.key}>
                <span>
                  {row.logo ? <img alt="" src={row.logo} /> : null}
                  {row.name}
                </span>
                <strong>{row.played}</strong>
                <strong>{row.goalsFor - row.goalsAgainst}</strong>
                <strong>{row.goalsFor}</strong>
                <strong>{row.points}</strong>
              </div>
            ))}
          </article>
        ))}
      </div>

      {!groups.length ? <div className="worldcup-empty">Grupos ainda nao definidos pela API.</div> : null}
    </div>
  );
}

function WorldCupBracketPanel({ stages, onOpenGame }) {
  return (
    <div className="worldcup-panel">
      <div className="worldcup-panel-header">
        <div>
          <span>Mata-mata</span>
          <strong>Caminho ate a final</strong>
        </div>
        <small>As chaves aparecem automaticamente quando a API publicar as fases eliminatorias.</small>
      </div>

      <div className="worldcup-bracket-grid">
        {stages.map((stage) => (
          <article className="worldcup-stage-card" key={stage.name}>
            <h3>{stage.name}</h3>
            {stage.games.length ? (
              stage.games.map((game) => (
                <button key={game.id} onClick={() => onOpenGame(game.id)} type="button">
                  <strong>{game.game}</strong>
                  <small>{formatKickoff(game.commenceTime)}</small>
                </button>
              ))
            ) : (
              <p>Aguardando classificados.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function WidgetsPage() {
  const [sport, setSport] = useState("football");
  const [widgetsReady, setWidgetsReady] = useState(false);
  const widgetKey = import.meta.env.VITE_API_FOOTBALL_WIDGET_KEY || "";
  const canRenderWidgets = Boolean(widgetKey && widgetsReady);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        setWidgetsReady(true);
      }
    };

    if (typeof window === "undefined" || !window.customElements) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    if (window.customElements.get("api-sports-widget")) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    window.customElements.whenDefined("api-sports-widget").then(markReady).catch(markReady);

    const fallback = window.setTimeout(markReady, 2600);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="widgets-page">
      <header className="widgets-toolbar">
        <a className="widgets-brand" href="/">
          <BublesLogo />
        </a>

        <nav className="widgets-sports" aria-label="Esportes">
          {WIDGET_SPORTS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={sport === item.key ? "chip-button is-active" : "chip-button"}
              onClick={() => setSport(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a className="chip-link contact-chip" href={`mailto:${CONTACT_EMAIL}?subject=Contato%20Bubles%20Palpites`}>
          Contato
        </a>

        <a className="chip-link" href="/">
          Voltar ao radar
        </a>
      </header>

      {!widgetKey ? (
        <div className="widgets-warning">
          Configure <strong>VITE_API_FOOTBALL_WIDGET_KEY</strong> no Vercel para carregar os
          widgets oficiais.
        </div>
      ) : null}

      {widgetKey && !widgetsReady ? (
        <div className="widgets-warning">
          Carregando widgets oficiais da API-SPORTS...
        </div>
      ) : null}

      {canRenderWidgets ? (
        <api-sports-widget
          key={`config-${sport}`}
          data-type="config"
          data-sport={sport}
          data-key={widgetKey}
          data-lang="en"
          data-theme="grey"
          data-show-errors="true"
          data-show-logos="true"
          data-refresh="20"
          data-favorite="true"
          data-standings="true"
          data-tab="games"
          data-game-tab="statistics"
          data-target-league="#games-list"
          data-target-team="#team-content"
          data-target-game="#game-content"
          data-target-standings="#standings-content"
        />
      ) : null}

      <main className="widgets-grid">
        <section className="widgets-panel widgets-leagues">
          {canRenderWidgets ? (
            <api-sports-widget key={`leagues-${sport}`} data-type="leagues" data-sport={sport} />
          ) : (
            <div className="widgets-placeholder">Aguardando widgets...</div>
          )}
        </section>
        <section id="games-list" className="widgets-panel widgets-games">
          {canRenderWidgets ? (
            <api-sports-widget key={`games-${sport}`} data-type="games" data-sport={sport} />
          ) : (
            <div className="widgets-placeholder">Aguardando jogos...</div>
          )}
        </section>
        <aside className="widgets-side">
          <section id="standings-content" className="widgets-panel" />
          <section id="team-content" className="widgets-panel" />
          <section id="game-content" className="widgets-panel">
            {canRenderWidgets ? (
              <api-sports-widget key={`game-${sport}`} data-type="game" data-sport={sport} />
            ) : (
              <div className="widgets-placeholder">Selecione um jogo quando carregar.</div>
            )}
          </section>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}

function BubblesWorldCup() {
  const boardRef = useRef(null);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(0);
  const boundsRef = useRef({ width: 0, height: 0 });
  const [games, setGames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState("");
  const [mode, setMode] = useState(() => {
    const initialMode = getInitialRouteValue("mode", "today");
    return VALID_MODES.has(initialMode) ? initialMode : "today";
  });
  const [filter, setFilter] = useState(() => {
    const initialFilter = getInitialRouteValue("filter", "best");
    return VALID_FILTERS.has(initialFilter) ? initialFilter : "best";
  });
  const [radarLimit, setRadarLimit] = useState(RADAR_INITIAL_LIMIT);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTodayListOpen, setIsTodayListOpen] = useState(false);
  const [todayListQuery, setTodayListQuery] = useState("");
  const [todaySelectedIds, setTodaySelectedIds] = useState(() => new Set());
  const [showOnlyTodaySelected, setShowOnlyTodaySelected] = useState(false);
  const [gameDetails, setGameDetails] = useState(null);
  const [gameDetailsLoading, setGameDetailsLoading] = useState(false);
  const [gameDetailsError, setGameDetailsError] = useState("");
  const [worldCupView, setWorldCupView] = useState(() => {
    const initialView = getInitialSearchParam("cup", "games");
    return WORLD_CUP_VIEW_TABS.some((item) => item.id === initialView) ? initialView : "games";
  });
  const [selectedWorldCupTeamId, setSelectedWorldCupTeamId] = useState("");

  const openGameModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeGameModal = () => {
    setIsModalOpen(false);
  };

  const openTodayList = () => {
    if (mode !== "today") {
      setMode("today");
      setFilter("best");
    }

    setIsTodayListOpen(true);
  };

  const closeTodayList = () => {
    setIsTodayListOpen(false);
    setShowOnlyTodaySelected(false);
  };

  const toggleTodayGameSelection = (id) => {
    setTodaySelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const clearTodaySelection = () => {
    setTodaySelectedIds(new Set());
    setShowOnlyTodaySelected(false);
  };

  useEffect(() => {
    const syncBounds = () => {
      if (!boardRef.current) {
        return;
      }

      const rect = boardRef.current.getBoundingClientRect();
      boundsRef.current = {
        width: rect.width,
        height: rect.height,
      };
    };

    syncBounds();
    window.addEventListener("resize", syncBounds);

    return () => {
      window.removeEventListener("resize", syncBounds);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchGames = async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/games?mode=${mode}`, { cache: "no-store" });
        const payload = await response.json();
        const items = Array.isArray(payload?.games) ? payload.games : [];

        if (!mounted) {
          return;
        }

        setUpdatedAt(payload?.updatedAt || "");
        setMessage(payload?.message || "");
        setDebug(payload?.debug || "");
        setGames((current) => {
          const currentMap = new Map(current.map((item) => [item.id, item]));
          return moveBubbles(
            items.map((item, index) =>
              createBubble(
                item,
                currentMap.get(item.id),
                boundsRef.current,
                index,
                items.length,
                DEFAULT_BUBBLE_SCALE
              )
            ),
            boundsRef.current,
            0
          );
        });
        setSelectedId((current) =>
          items.some((item) => item.id === current) ? current : items[0]?.id ?? null
        );
      } catch (_error) {
        if (!mounted) {
          return;
        }

        setGames([]);
        setSelectedId(null);
        setMessage(mode === "today" ? "Falha ao carregar jogos de hoje" : "Falha ao carregar a Copa 2026");
        setDebug("Nao foi possivel consultar /api/games");
      } finally {
        if (!mounted) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchGames(false);
    const refreshMs = mode === "today" ? 60000 : 240000;
    const timer = window.setInterval(() => fetchGames(true), refreshMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [mode]);

  useEffect(() => {
    setSelectedId(null);
    setIsModalOpen(false);

    if (mode !== "worldcup") {
      setWorldCupView("games");
      setSelectedWorldCupTeamId("");
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    url.searchParams.set("filter", filter);
    url.searchParams.set("view", "radar");

    if (mode === "worldcup") {
      url.searchParams.set("cup", worldCupView);
    } else {
      url.searchParams.delete("cup");
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [filter, mode, worldCupView]);

  useEffect(() => {
    setRadarLimit(RADAR_INITIAL_LIMIT);
  }, [filter, mode, query]);

  useEffect(() => {
    if (!isModalOpen && !isTodayListOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setIsTodayListOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, isTodayListOpen]);

  useEffect(() => {
    if (!games.length) {
      return undefined;
    }

    const animate = (timestamp = 0) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameRef.current;

      if (elapsed >= DRIFT_INTERVAL_MS) {
        const frameStep = elapsed / 16.67;
        setGames((current) => moveBubbles(current, boundsRef.current, frameStep));
        lastFrameRef.current = timestamp;
      }

      animationRef.current = window.requestAnimationFrame(animate);
    };

    lastFrameRef.current = 0;
    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      lastFrameRef.current = 0;
    };
  }, [games.length]);

  const filteredGames = useMemo(() => {
    const text = query.trim().toLowerCase();
    let items = [...games];

    if (text) {
      items = items.filter((game) =>
        `${game.game} ${game.round} ${game.venue} ${game.city} ${game.homeTeam} ${game.awayTeam} ${game.league} ${game.country}`
          .toLowerCase()
          .includes(text)
      );
    }

    if (filter === "live") {
      items = items.filter((game) => game.isLive);
    }

    items.sort(
      (left, right) =>
        Number(right.isLive) - Number(left.isLive) ||
        getAiScoreNumber(right) - getAiScoreNumber(left) ||
        (right.probability || 0) - (left.probability || 0) ||
        new Date(left.commenceTime || 0).getTime() - new Date(right.commenceTime || 0).getTime()
    );

    const recentFamilies = [];
    items = items
      .map((game) => {
        const displayGame = withDisplayMarket(game, filter, recentFamilies);

        if (displayGame?.displayMarketFamily) {
          recentFamilies.push(displayGame.displayMarketFamily);
        }

        return displayGame;
      })
      .filter(Boolean);

    items.sort(
      (left, right) =>
        Number(right.isLive) - Number(left.isLive) ||
        getAiScoreNumber(right) - getAiScoreNumber(left) ||
        (right.displayProbability || right.probability || 0) -
          (left.displayProbability || left.probability || 0) ||
        new Date(left.commenceTime || 0).getTime() -
          new Date(right.commenceTime || 0).getTime()
    );

    return items;
  }, [filter, games, query]);

  const radarGames = useMemo(
    () => (filter === "live" ? filteredGames : filteredGames.slice(0, radarLimit)),
    [filter, filteredGames, radarLimit]
  );

  const searchSuggestions = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!isSearchFocused || text.length < 2) {
      return [];
    }

    return games
      .filter((game) =>
        `${game.game} ${game.homeTeam} ${game.awayTeam} ${game.league} ${game.country}`
          .toLowerCase()
          .includes(text)
      )
      .slice(0, 6)
      .map((game) => withDisplayMarket(game, "best") || game);
  }, [games, isSearchFocused, query]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ??
    games.find((game) => game.id === selectedId) ??
    filteredGames[0] ??
    games[0] ??
    null;

  useEffect(() => {
    if (!isModalOpen || !selectedGame?.homeTeamId || !selectedGame?.awayTeamId) {
      setGameDetails(null);
      setGameDetailsLoading(false);
      setGameDetailsError("");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    const params = new URLSearchParams({
      home: String(selectedGame.homeTeamId),
      away: String(selectedGame.awayTeamId),
    });

    if (selectedGame.leagueId) {
      params.set("league", String(selectedGame.leagueId));
    }

    if (selectedGame.season) {
      params.set("season", String(selectedGame.season));
    }

    setGameDetailsLoading(true);
    setGameDetailsError("");
    setGameDetails(null);

    fetch(`/api/game-details?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Falha ao carregar dados dos times");
        }

        return payload;
      })
      .then((payload) => {
        if (!active) {
          return;
        }

        setGameDetails(payload);
        setGameDetailsError(payload?.message?.includes("carregados") ? "" : payload?.message || "");
      })
      .catch((error) => {
        if (!active || error?.name === "AbortError") {
          return;
        }

        setGameDetailsError(error?.message || "Nao foi possivel carregar dados dos times");
      })
      .finally(() => {
        if (active) {
          setGameDetailsLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    isModalOpen,
    selectedGame?.awayTeamId,
    selectedGame?.homeTeamId,
    selectedGame?.id,
    selectedGame?.leagueId,
    selectedGame?.season,
  ]);

  const hoveredGame =
    radarGames.find((game) => game.id === hoveredId) ??
    filteredGames.find((game) => game.id === hoveredId) ??
    null;

  const todayListGames = useMemo(() => {
    if (mode !== "today") {
      return [];
    }

    return [...games].sort(
      (left, right) =>
        getKickoffStamp(left) - getKickoffStamp(right) ||
        Number(right.isLive) - Number(left.isLive) ||
      (right.probability || 0) - (left.probability || 0)
    );
  }, [games, mode]);
  const todaySelectedCount = todaySelectedIds.size;
  const todayVisibleGames = useMemo(() => {
    const searchText = normalizeBetText(todayListQuery);

    return todayListGames.filter((game) => {
      if (showOnlyTodaySelected && !todaySelectedIds.has(game.id)) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      const rowGame = withDisplayMarket(game, "best") || game;
      const searchable = normalizeBetText(
        [
          game.game,
          game.homeTeam,
          game.awayTeam,
          game.league,
          game.country,
          game.round,
          game.venue,
          game.city,
          getPrimaryBetText(rowGame.displayPickLabel || rowGame.pickLabel, rowGame),
        ].join(" ")
      );

      return searchable.includes(searchText);
    });
  }, [showOnlyTodaySelected, todayListGames, todayListQuery, todaySelectedIds]);

  const liveCount = games.filter((game) => game.isLive).length;
  const preCount = games.filter((game) => !game.isLive && !game.isFinished).length;
  const finishedCount = games.filter((game) => game.isFinished).length;
  const todayAiStats = useMemo(() => {
    const stats = todayListGames.reduce(
      (summary, game) => {
        const rowGame = withDisplayMarket(game, "best") || game;

        if (!shouldCountAiStat(rowGame)) {
          summary.skipped += 1;
          return summary;
        }

        const hitState = getAiHitState(rowGame);

        if (hitState.state === "hit") {
          summary.hits += 1;
          summary.checked += 1;
        } else if (hitState.state === "miss") {
          summary.misses += 1;
          summary.checked += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      { checked: 0, hits: 0, misses: 0, pending: 0, skipped: 0 }
    );

    return {
      ...stats,
      hitRate: stats.checked ? stats.hits / stats.checked : 0,
      missRate: stats.checked ? stats.misses / stats.checked : 0,
      isReliable: stats.checked >= AI_STATS_MIN_SAMPLE,
    };
  }, [todayListGames]);
  const worldCupTeams = useMemo(() => buildWorldCupTeams(games), [games]);
  const worldCupGroups = useMemo(() => buildWorldCupGroups(games), [games]);
  const worldCupStages = useMemo(() => buildWorldCupStages(games), [games]);
  const topGames = [...filteredGames]
    .sort(
      (left, right) =>
        getAiScoreNumber(right) - getAiScoreNumber(left) ||
        (right.displayProbability || right.probability || 0) -
          (left.displayProbability || left.probability || 0)
    )
    .slice(0, 5);
  const selectedOptions = selectedGame?.marketOptions ?? [];
  const selectedMarkets = selectedGame?.betMarkets ?? [];
  const aiInsights = selectedGame?.aiInsights ?? {};
  const aiWhy = Array.isArray(aiInsights.why) ? aiInsights.why : [];
  const aiChecklist = Array.isArray(aiInsights.checklist) ? aiInsights.checklist : [];
  const aiAvoidIf = Array.isArray(aiInsights.avoidIf) ? aiInsights.avoidIf : [];
  const aiBestMarkets = Array.isArray(aiInsights.bestMarkets) ? aiInsights.bestMarkets : [];
  const selectedHitState = selectedGame ? getAiHitState(selectedGame) : null;
  const formGuardrail = selectedGame ? getFormGuardrail(selectedGame, gameDetails) : null;
  const boardGamesCount = filteredGames.length;

  useEffect(() => {
    if (!radarGames.length) {
      return;
    }

    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      boundsRef.current = {
        width: rect.width,
        height: rect.height,
      };
    }

    const visibleIds = radarGames.map((game) => game.id);

    setGames((current) =>
      moveBubbles(
        current.map((game) => {
          const visibleIndex = visibleIds.indexOf(game.id);

          if (visibleIndex === -1) {
            return game;
          }

          const size = getDisplaySize(
            game.bubbleValue ?? game.probability,
            DEFAULT_BUBBLE_SCALE,
            visibleIds.length,
            boundsRef.current
          );
          const position = getInitialPosition(visibleIndex, visibleIds.length, boundsRef.current, size);

          return {
            ...game,
            anchorX: position.x,
            anchorY: position.y,
            anchoredLayout: true,
            size,
            radius: size / 2,
            x: position.x,
            y: position.y,
          };
        }),
        boundsRef.current,
        0
      )
    );
  }, [filter, query, radarGames.length, radarLimit, updatedAt, worldCupView]);

  return (
    <div className="cup-shell">
      <header className="cup-toolbar">
        <a className="cup-brand" href="/">
          <BublesLogo />
          <strong className="brand-context">PALPITES</strong>
        </a>

        <div className="search-shell">
          <input
            className="cup-search"
            value={query}
            onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar jogo, time ou campeonato"
            type="search"
          />

          {searchSuggestions.length ? (
            <div className="search-suggestions" role="listbox">
              {searchSuggestions.map((game) => (
                <button
                  className="search-suggestion"
                  key={game.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(game.game);
                    setIsSearchFocused(false);
                    openGameModal(game.id);
                  }}
                  type="button"
                >
                  <strong>{game.game}</strong>
                  <span>
                    {getGameStatusLabel(game)} | {getPrimaryBetText(game.displayPickLabel || game.pickLabel, game)} |{" "}
                    {formatChance(game.displayProbability || game.probability)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="cup-controls mode-controls" aria-label="Filtros simples">
          <button
            className={mode === "today" && filter === "best" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("today");
              setFilter("best");
            }}
            type="button"
          >
            Melhores
          </button>
          <button
            className={filter === "live" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("live")}
            type="button"
          >
            Ao vivo {liveCount}
          </button>
          <button className="chip-button" onClick={openTodayList} type="button">
            Todos jogos de hoje {mode === "today" ? games.length : ""}
          </button>
          <button
            className={mode === "worldcup" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("worldcup");
              setFilter("best");
              setWorldCupView("games");
            }}
            type="button"
          >
            Copa 2026
          </button>
        </nav>

        <nav className="cup-controls compact" aria-label="Atalhos">
          <a className="chip-link contact-chip" href={`mailto:${CONTACT_EMAIL}?subject=Contato%20Bubles%20Palpites`}>
            Contato
          </a>
        </nav>
      </header>

      <section className="simple-guide" aria-label="Resumo dos palpites">
        <article className="simple-guide-main">
          <div className="guide-kicker">
            <span>Top 5 palpites de hoje</span>
          </div>

          {topGames.length ? (
            <div className="top-picks-list">
              {topGames.map((game, index) => (
                <button
                  className="top-pick-item"
                  key={game.id}
                  onClick={() => openGameModal(game.id)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <strong>{game.game}</strong>
                  <small>{getPrimaryBetText(game.displayPickLabel || game.pickLabel, game)}</small>
                  <em>{formatChance(game.displayProbability || game.probability)}</em>
                </button>
              ))}
            </div>
          ) : (
            <>
              <h1>Radar de palpites</h1>
              <p>Assim que os jogos carregarem, os melhores palpites aparecem primeiro.</p>
            </>
          )}
        </article>

        <article className="simple-guide-card">
          <span>Como usar</span>
          <strong>Escolha uma bolha</strong>
          <small>Clique para ver vencedor, dupla chance, gols e ambas marcam.</small>
        </article>

        {mode === "today" ? (
          <>
            <article className="simple-guide-card home-ai-stat-card is-hit">
              <span>IA acertou</span>
              <strong>{todayAiStats.isReliable ? formatChance(todayAiStats.hitRate) : "Em teste"}</strong>
              <small>
                {todayAiStats.isReliable
                  ? `${todayAiStats.hits} de ${todayAiStats.checked} conferidos`
                  : `${todayAiStats.checked} de ${AI_STATS_MIN_SAMPLE} conferidos para liberar %`}
              </small>
            </article>

            <article className="simple-guide-card home-ai-stat-card is-miss">
              <span>IA errou</span>
              <strong>{todayAiStats.isReliable ? formatChance(todayAiStats.missRate) : "Em teste"}</strong>
              <small>
                {todayAiStats.misses} erros em {todayAiStats.checked} conferidos
              </small>
            </article>
          </>
        ) : null}

        <article className="simple-guide-card">
          <span>{mode === "worldcup" ? "Calendario da Copa" : "Todos jogos de hoje"}</span>
          <strong>{mode === "today" ? `${games.length} jogos` : `${games.length} jogos`}</strong>
          <button
            type="button"
            onClick={mode === "worldcup" ? () => setWorldCupView("games") : openTodayList}
          >
            {mode === "worldcup" ? "Ver calendario" : "Ver todos os jogos"}
          </button>
        </article>
      </section>

      {mode === "worldcup" ? (
        <WorldCupHub
          games={games}
          groups={worldCupGroups}
          loading={loading}
          onOpenGame={openGameModal}
          onSelectTeam={setSelectedWorldCupTeamId}
          onViewChange={setWorldCupView}
          selectedTeamId={selectedWorldCupTeamId}
          stages={worldCupStages}
          teams={worldCupTeams}
          view={worldCupView}
        />
      ) : null}

      {mode !== "worldcup" || worldCupView === "games" ? (
      <section className="radar-stage">
        <main className="bubble-board" ref={boardRef}>
          <div className="board-grid" />

          {loading ? (
            <div className="empty-state">
              <h2>{mode === "today" ? "Carregando jogos de hoje..." : "Carregando Copa 2026..."}</h2>
              <p>Buscando jogos, odds e estimativas.</p>
            </div>
          ) : null}

          {!loading && !boardGamesCount ? (
            <div className="empty-state">
              <h2>Sem jogos neste filtro</h2>
              <p>{debug || "Tente outro filtro no topo."}</p>
            </div>
          ) : null}

          {!loading &&
            radarGames.map((game) => {
              const hitState = getAiHitState(game);

              return (
                <button
                  aria-label={`Abrir previsoes de ${game.game}`}
                  className={
                    selectedGame?.id === game.id
                      ? `bubble is-${game.tier} is-selected`
                      : `bubble is-${game.tier}`
                  }
                  key={game.id}
                  onBlur={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(game.id)}
                  onClick={() => openGameModal(game.id)}
                  onMouseEnter={() => setHoveredId(game.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onTouchStart={() => setHoveredId(game.id)}
                  style={{
                    width: `${game.size}px`,
                    height: `${game.size}px`,
                    transform: `translate(${game.x}px, ${game.y}px)`,
                  }}
                  title={game.game}
                  type="button"
                >
                  {hitState.state === "hit" ? <AiHitLogo state="hit" compact /> : null}
                  <span className="bubble-primary">{getBubbleMainLabel(game)}</span>
                  <strong>{formatChance(game.displayProbability || game.probability)}</strong>
                  {mode === "worldcup" && !game.isLive ? (
                    <span className="bubble-schedule">{formatKickoffShort(game.commenceTime)}</span>
                  ) : null}
                  {hasScoreLine(game) || game.isLive ? (
                    <span className={hasLiveMinute(game) ? "bubble-score-stack is-live" : "bubble-score-stack"}>
                      <span className="bubble-score">{formatScoreLine(game)}</span>
                      {hasLiveMinute(game) ? (
                        <span className="bubble-minute">{formatLiveMinute(game)}</span>
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}

          {!loading && hoveredGame ? (
            <aside className="bubble-tooltip" aria-live="polite">
              <span>{getGameStatusLabel(hoveredGame)}</span>
              <strong>{hoveredGame.game}</strong>
              <p>{getPrimaryBetText(hoveredGame.displayPickLabel || hoveredGame.pickLabel, hoveredGame)}</p>
              <div>
                <small>{formatChance(hoveredGame.displayProbability || hoveredGame.probability)} chance</small>
                <small>Odd {formatOdd(hoveredGame.displayOdd || hoveredGame.oddHome)}</small>
                {mode === "worldcup" ? <small>{formatKickoff(hoveredGame.commenceTime)}</small> : null}
                <small>{formatScoreLine(hoveredGame)}</small>
              </div>
            </aside>
          ) : null}

          {!loading && filteredGames.length > radarGames.length ? (
            <div className="radar-actions">
              <button
                className="load-more-button"
                onClick={() => setRadarLimit((current) => current + RADAR_INITIAL_LIMIT)}
                type="button"
              >
                Carregar mais {Math.min(RADAR_INITIAL_LIMIT, filteredGames.length - radarGames.length)}
              </button>
            </div>
          ) : null}
        </main>
      </section>
      ) : null}

      {isModalOpen && selectedGame ? (
        <div className="prediction-modal-backdrop" onClick={closeGameModal} role="presentation">
          <section
            aria-label={`Previsoes de ${selectedGame.game}`}
            aria-modal="true"
            className="prediction-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="prediction-modal-header">
              <div>
                <div className="modal-title-kicker">
                  <span>{selectedGame.isLive ? "Ao vivo" : "Melhor leitura da IA"}</span>
                  <span className={`ai-hit-badge is-${selectedHitState?.state || "pending"}`}>
                    <AiHitLogo state={selectedHitState?.state || "pending"} compact />
                    {selectedHitState?.label || "Em validacao"}
                  </span>
                </div>
                <h2>{selectedGame.game}</h2>
                <p>
                  {getPrimaryBetText(selectedGame.displayPickLabel || selectedGame.pickLabel, selectedGame)} |{" "}
                  {formatChance(selectedGame.displayProbability || selectedGame.probability)} |{" "}
                  Odd {formatOdd(selectedGame.displayOdd || selectedGame.oddHome)} |{" "}
                  {formatScoreLine(selectedGame)} |{" "}
                  {mode === "worldcup" && !selectedGame.isLive
                    ? formatKickoff(selectedGame.commenceTime)
                    : formatClock(selectedGame)}
                </p>
              </div>

              <button className="modal-close-button" onClick={closeGameModal} type="button" aria-label="Fechar previsoes">
                x
              </button>
            </header>

            <div className="modal-summary-grid">
              <article>
                <span>{mode === "worldcup" && !selectedGame.isLive ? "Data e horario" : "Placar online"}</span>
                <strong>
                  {mode === "worldcup" && !selectedGame.isLive
                    ? formatKickoff(selectedGame.commenceTime)
                    : formatScoreLine(selectedGame)}
                </strong>
                <small>{formatScoreContext(selectedGame)}</small>
              </article>
              <article>
                <span>Palpite principal</span>
                <strong>{getPrimaryBetText(selectedGame.displayPickLabel || selectedGame.pickLabel, selectedGame)}</strong>
                <small>
                  {getBetHelpText(selectedGame.displayPickLabel || selectedGame.pickLabel, selectedGame) ||
                    aiInsights.headline ||
                    getAiSummary(selectedGame)}
                </small>
              </article>
              <article>
                <span>Chance IA</span>
                <strong>{formatChance(selectedGame.displayProbability || selectedGame.probability)}</strong>
                <small>{aiInsights.main || "Chance estimada: aguardando dados."}</small>
              </article>
              <article className={`hit-summary-card is-${selectedHitState?.state || "pending"}`}>
                <span>Acertos IA</span>
                <strong>
                  <AiHitLogo state={selectedHitState?.state || "pending"} compact />
                  {selectedHitState?.label || "Em validacao"}
                </strong>
                <small>{selectedHitState?.note || "Aguardando conferencia do resultado."}</small>
              </article>
              <article>
                <span>Risco</span>
                <strong>{getBeforeColon(aiInsights.risk, "Risco medio")}</strong>
                <small>{aiInsights.risk || aiInsights.confidence || "Aguardando leitura completa."}</small>
              </article>
              <article>
                <span>Odd atual</span>
                <strong>{formatOdd(selectedGame.displayOdd || selectedGame.oddHome)}</strong>
                <small>
                  {selectedGame.allowedBookmakers?.length
                    ? `Disponivel em ${selectedGame.allowedBookmakers.join(" / ")}`
                    : selectedGame.hasOdds
                      ? "Odds oficiais"
                      : "Estimativa visual"}
                </small>
              </article>
              <article className="bookmaker-summary-card">
                <span>Casas</span>
                <strong>Abrir jogo</strong>
                <BookmakerLinks game={selectedGame} />
              </article>
            </div>

            <section className="team-details-card">
              <div className="team-details-heading">
                <div>
                  <span>Dados dos times</span>
                  <strong>Classificacao, gols e ultimos 10 jogos</strong>
                </div>
                <small>
                  {gameDetailsLoading
                    ? "Carregando dados da API-Football..."
                    : gameDetailsError || "Use os dados recentes como apoio para conferir o palpite."}
                </small>
              </div>

              <div className="team-details-grid">
                <TeamDetailsPanel
                  fallbackName={selectedGame.homeTeam}
                  loading={gameDetailsLoading}
                  team={gameDetails?.teams?.home}
                />
                <TeamDetailsPanel
                  fallbackName={selectedGame.awayTeam}
                  loading={gameDetailsLoading}
                  team={gameDetails?.teams?.away}
                />
              </div>
            </section>

            {gameDetailsLoading || formGuardrail ? (
              <section className={`form-guardrail is-${formGuardrail?.tone || "loading"}`}>
                <span>Regra dos ultimos 10 jogos</span>
                <strong>
                  {gameDetailsLoading ? "Analisando a fase recente dos times..." : formGuardrail.title}
                </strong>
                <p>
                  {gameDetailsLoading
                    ? "A IA esta conferindo os ultimos 10 jogos antes de validar se vale apostar contra algum time."
                    : formGuardrail.text}
                </p>
              </section>
            ) : null}

            <PremiumAdvancedAnalysisPanel
              details={gameDetails}
              game={selectedGame}
              loading={gameDetailsLoading}
            />

            <section className="modal-ai-card primary-reading">
              <span>Leitura facil</span>
              <ul>
                <li>{aiInsights.result || "Resultado: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.goals || "Gols: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.btts || "Ambas marcam: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.combo || "Combinada: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.warning || "Use como apoio para analise. Nao existe aposta garantida."}</li>
              </ul>
            </section>

            <div className="modal-accordion-stack">
              <details className="modal-accordion">
                <summary>Checklist rapido</summary>
                <ul>
                  {(aiChecklist.length ? aiChecklist : ["Confira odd, placar e status antes de apostar."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Por que verificar</summary>
                <ul>
                  {(aiWhy.length ? aiWhy : ["A IA ainda esta montando a leitura desse jogo."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Evite se</summary>
                <ul>
                  {(aiAvoidIf.length ? aiAvoidIf : ["Evite se a leitura nao estiver clara."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Melhores mercados para conferir</summary>
                <div className="accordion-cards">
                  {(aiBestMarkets.length ? aiBestMarkets : selectedMarkets.slice(0, 4).map((market) => ({
                    category: market.category,
                    market: market.name,
                    pick: market.leader?.label,
                    probability: market.leader?.probability,
                    odd: market.leader?.odd,
                    note: "",
                  }))).map((market) => (
                    <article className="ai-market-mini" key={`${market.category}-${market.market}-${market.pick}`}>
                      <span>{market.category}</span>
                      <strong>{translateBetText(market.pick)}</strong>
                      <small>
                        {formatChance(market.probability)} | Odd {formatOdd(market.odd)}
                      </small>
                      <em>{market.note || translateBetText(market.market)}</em>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Opcoes principais</summary>
                <div className="accordion-cards">
                  {selectedOptions.map((option) => (
                    <article
                      className={option.code === selectedGame.pickCode ? "option-card is-leader" : "option-card"}
                      key={option.code}
                    >
                      <span>{option.code}</span>
                      <strong>{translateBetText(option.label)}</strong>
                      <small>{formatChance(option.probability)} | Odd {formatOdd(option.odd)}</small>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Todos os mercados</summary>
                <div className="markets-grid modal-markets-grid">
                  {selectedMarkets.map((market) => (
                    <article className="market-card" key={`${market.id}-${market.name}`}>
                      <div className="market-card-head">
                        <span>{market.category}</span>
                        <strong>{translateBetText(market.name)}</strong>
                      </div>
                      <div className="market-options">
                        {(market.options || []).map((option) => (
                          <div className="market-option" key={`${market.id}-${option.label}`}>
                            <span>{translateBetText(option.label)}</span>
                            <strong>{formatChance(option.probability)}</strong>
                            <small>Odd {formatOdd(option.odd)}</small>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Outros jogos fortes deste filtro</summary>
                <div className="accordion-cards">
                  {topGames.map((game, index) => (
                    <button
                      className={selectedGame.id === game.id ? "top-pill is-active" : "top-pill"}
                      key={game.id}
                      onClick={() => setSelectedId(game.id)}
                      type="button"
                    >
                      <span>{index + 1}</span>
                      <strong>{game.game}</strong>
                      <small>{formatChance(game.displayProbability || game.probability)}</small>
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </section>
        </div>
      ) : null}

      {isTodayListOpen ? (
        <div
          className="today-games-backdrop"
          onClick={closeTodayList}
          role="presentation"
        >
          <section
            aria-label="Todos jogos de hoje"
            aria-modal="true"
            className="today-games-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="today-games-header">
              <div>
                <span>Todos jogos de hoje</span>
                <h2>Todos jogos de hoje</h2>
                <p>
                  Horarios no {BRASILIA_TIMEZONE_LABEL}.
                  Clique em um jogo para abrir os palpites de IA.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeTodayList}
                type="button"
                aria-label="Fechar todos jogos de hoje"
              >
                x
              </button>
            </header>

            <div className="today-games-stats">
              <article>
                <span>Total</span>
                <strong>{todayListGames.length}</strong>
              </article>
              <article>
                <span>Ao vivo</span>
                <strong>{liveCount}</strong>
              </article>
              <article>
                <span>Pre-jogo</span>
                <strong>{preCount}</strong>
              </article>
              <article>
                <span>Encerrados</span>
                <strong>{finishedCount}</strong>
              </article>
              <article className="ai-stat-card is-hit">
              <span>IA acertou</span>
              <strong>{todayAiStats.isReliable ? formatChance(todayAiStats.hitRate) : "Em teste"}</strong>
                <small>
                  {todayAiStats.isReliable
                    ? `${todayAiStats.hits} de ${todayAiStats.checked} conferidos`
                    : `${todayAiStats.checked} de ${AI_STATS_MIN_SAMPLE} conferidos para liberar %`}
                </small>
              </article>
              <article className="ai-stat-card is-miss">
                <span>IA errou</span>
                <strong>{todayAiStats.isReliable ? formatChance(todayAiStats.missRate) : "Em teste"}</strong>
                <small>{todayAiStats.misses} erros em {todayAiStats.checked} conferidos</small>
              </article>
              <article className="ai-stat-card">
                <span>Em validacao</span>
                <strong>{todayAiStats.pending}</strong>
                <small>Ao vivo ou aguardando resultado</small>
              </article>
            </div>

            <div className="today-games-tools">
              <label className="today-games-search">
                <span>Buscar jogo, campeonato ou time</span>
                <input
                  onChange={(event) => setTodayListQuery(event.target.value)}
                  placeholder="Ex: Flamengo, Brasil, Premier League"
                  type="search"
                  value={todayListQuery}
                />
              </label>

              <div className="today-selection-actions">
                <span>{todaySelectedCount} selecionados</span>
                <button
                  className={showOnlyTodaySelected ? "is-active" : ""}
                  disabled={!todaySelectedCount}
                  onClick={() => setShowOnlyTodaySelected((value) => !value)}
                  type="button"
                >
                  {showOnlyTodaySelected ? "Mostrar todos" : "Ver selecionados"}
                </button>
                <button
                  disabled={!todaySelectedCount && !todayListQuery}
                  onClick={() => {
                    clearTodaySelection();
                    setTodayListQuery("");
                  }}
                  type="button"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="today-games-table-wrap">
              <table className="today-games-table">
                <thead>
                  <tr>
                    <th>Marcar</th>
                    <th>Hora BR</th>
                    <th>Campeonato</th>
                    <th>Mandante</th>
                    <th>Placar</th>
                    <th>Visitante</th>
                    <th>Palpite IA</th>
                    <th>Chance</th>
                    <th>Selo IA</th>
                    <th>Casas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayVisibleGames.map((game) => {
                    const rowGame = withDisplayMarket(game, "best") || game;
                    const hitState = getAiHitState(rowGame);
                    const isSelected = todaySelectedIds.has(game.id);

                    return (
                      <tr
                        className={[
                          game.isLive ? "is-live-row" : "",
                          isSelected ? "is-selected-row" : "",
                        ].filter(Boolean).join(" ")}
                        key={game.id}
                        onClick={() => {
                          openGameModal(game.id);
                          closeTodayList();
                        }}
                      >
                        <td className="select-cell">
                          <label className="game-select-check" onClick={(event) => event.stopPropagation()}>
                            <input
                              checked={isSelected}
                              onChange={() => toggleTodayGameSelection(game.id)}
                              type="checkbox"
                            />
                            <span>{isSelected ? "Selecionado" : "Marcar"}</span>
                          </label>
                        </td>
                        <td>
                          <strong>{game.isLive ? formatClock(game) : formatKickoffTime(game.commenceTime)}</strong>
                        </td>
                        <td>
                          <span>{game.league}</span>
                          <small>{game.country}</small>
                        </td>
                        <td>{game.homeTeam}</td>
                        <td className="score-cell">{formatScoreLine(game)}</td>
                        <td>{game.awayTeam}</td>
                        <td>
                          <strong>{getPrimaryBetText(rowGame.displayPickLabel || rowGame.pickLabel, rowGame)}</strong>
                          <small>{getBetHelpText(rowGame.displayPickLabel || rowGame.pickLabel, rowGame) || rowGame.aiInsights?.action || "Verificar"}</small>
                        </td>
                        <td
                          className={
                            (rowGame.displayProbability || rowGame.probability) >= 0.45
                              ? "chance-high"
                              : "chance-low"
                          }
                        >
                          {formatChance(rowGame.displayProbability || rowGame.probability)}
                        </td>
                        <td>
                          <span className={`table-ai-hit is-${hitState.state}`}>
                            <AiHitLogo state={hitState.state} compact />
                            {hitState.label}
                          </span>
                        </td>
                        <td>
                          <BookmakerLinks game={game} compact />
                        </td>
                        <td>{getGameStatusLabel(game)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!loading && !todayVisibleGames.length ? (
                <div className="today-games-empty">
                  <strong>Nenhum jogo encontrado.</strong>
                  <span>
                    {todayListQuery || showOnlyTodaySelected
                      ? "Tente limpar a busca ou mostrar todos os jogos."
                      : debug || message || "Tente atualizar novamente em alguns minutos."}
                  </span>
                </div>
              ) : null}

              {loading ? (
                <div className="today-games-empty">
                  <strong>Carregando todos os jogos de hoje...</strong>
                  <span>Buscando horarios, placares e leitura IA.</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <section className="sponsor-strip sponsor-strip-bottom" aria-label="Espacos comerciais">
        {SPONSORS.map((sponsor) => (
          <article className="sponsor-slot" key={sponsor.label}>
            <span>{sponsor.label}</span>
            <strong>{sponsor.title}</strong>
            <small>{sponsor.note}</small>
          </article>
        ))}
        <article className="sponsor-slot contact-slot">
          <span>Contato</span>
          <strong>Fale com a equipe</strong>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Contato%20Bubles%20Palpites`}>
            {CONTACT_EMAIL}
          </a>
        </article>
      </section>

      <SiteFooter />
    </div>
  );
}

function AgeGate() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setShouldShow(window.localStorage.getItem(AGE_GATE_STORAGE_KEY) !== "accepted");
  }, []);

  const acceptAge = () => {
    window.localStorage.setItem(AGE_GATE_STORAGE_KEY, "accepted");
    setShouldShow(false);
  };

  const leaveSite = () => {
    window.location.href = "https://www.google.com";
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="age-gate-backdrop" role="presentation">
      <section
        className="age-gate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
      >
        <span className="age-gate-pill">18+</span>
        <h2 id="age-gate-title">Somente para maiores de 18 anos</h2>
        <p>
          Este site contem palpites e informacoes sobre apostas esportivas. Para continuar,
          confirme que voce tem 18 anos ou mais.
        </p>
        <div className="age-gate-actions">
          <button className="age-gate-primary" type="button" onClick={acceptAge}>
            Tenho 18 anos ou mais
          </button>
          <button className="age-gate-secondary" type="button" onClick={leaveSite}>
            Sair
          </button>
        </div>
        <small>Jogue com responsabilidade. Palpites nao garantem resultado.</small>
      </section>
    </div>
  );
}

export default function App() {
  const pathname =
    typeof window !== "undefined"
      ? window.location.pathname.replace(/\/$/, "") || "/"
      : "/";
  const isWidgetsPage = pathname.startsWith("/widgets");
  const legalType = LEGAL_ROUTES[pathname];

  return (
    <>
      {legalType ? <LegalPage type={legalType} /> : isWidgetsPage ? <WidgetsPage /> : <BubblesWorldCup />}
      {!legalType ? <AgeGate /> : null}
      <CookieConsent />
    </>
  );
}
