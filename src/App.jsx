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
