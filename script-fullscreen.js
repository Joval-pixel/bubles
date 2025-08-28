/*************************************************
 * BUBLES FULLSCREEN - ENGINE DE BOLHAS ESTILO CRYPTOBUBBLES
 * 
 * Funcionalidades:
 * - Bolhas com cores vibrantes como CryptoBubbles
 * - Escudos dos times nas bolhas
 * - Horários e informações dos jogos
 * - Física realística com colisões
 * - Tela cheia de bolhas
 * - Jogos mais importantes = bolhas maiores
 *************************************************/

// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    // Bolhas
    MIN_BUBBLE_SIZE: 30,
    MAX_BUBBLE_SIZE: 120,
    BUBBLE_COUNT: 40,
    
    // Física
    GRAVITY: 0.1,
    FRICTION: 0.99,
    BOUNCE_DAMPING: 0.8,
    COLLISION_FORCE: 0.5,
    
    // Animação
    FPS: 60,
    ANIMATION_SPEED: 1,
    
    // Cores estilo CryptoBubbles
    COLORS: {
        GREEN_POSITIVE: {
            light: '#00ff88',
            dark: '#00cc66',
            glow: 'rgba(0, 255, 136, 0.6)'
        },
        RED_NEGATIVE: {
            light: '#ff4757',
            dark: '#ff3742',
            glow: 'rgba(255, 71, 87, 0.6)'
        },
        BLUE_NEUTRAL: {
            light: '#3742fa',
            dark: '#2f3542',
            glow: 'rgba(55, 66, 250, 0.6)'
        },
        GOLD_IMPORTANT: {
            light: '#ffa502',
            dark: '#ff6348',
            glow: 'rgba(255, 165, 2, 0.6)'
        },
        PURPLE_SPECIAL: {
            light: '#a55eea',
            dark: '#8854d0',
            glow: 'rgba(165, 94, 234, 0.6)'
        }
    }
};

// ===== UTILITÁRIOS =====
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const log = (...args) => console.log('[BUBLES]', ...args);

// Formatação
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const formatProbability = (prob) => `${Math.round(prob * 100)}%`;

// ===== GERADOR DE DADOS DOS JOGOS =====
class MatchDataGenerator {
    static leagues = {
        brasileirao: {
            name: 'Brasileirão',
            importance: 0.8,
            teams: [
                { name: 'Flamengo', shield: '🔴⚫' },
                { name: 'Palmeiras', shield: '🟢⚪' },
                { name: 'Corinthians', shield: '⚫⚪' },
                { name: 'São Paulo', shield: '🔴⚫⚪' },
                { name: 'Santos', shield: '⚪⚫' },
                { name: 'Vasco', shield: '⚫⚪' },
                { name: 'Botafogo', shield: '⚫⚪' },
                { name: 'Fluminense', shield: '🟢🔴⚪' },
                { name: 'Internacional', shield: '🔴⚪' },
                { name: 'Grêmio', shield: '🔵⚫⚪' }
            ]
        },
        premier: {
            name: 'Premier League',
            importance: 0.95,
            teams: [
                { name: 'Manchester City', shield: '🔵⚪' },
                { name: 'Liverpool', shield: '🔴⚪' },
                { name: 'Arsenal', shield: '🔴⚪' },
                { name: 'Chelsea', shield: '🔵⚪' },
                { name: 'Manchester United', shield: '🔴⚪' },
                { name: 'Tottenham', shield: '⚪🔵' },
                { name: 'Newcastle', shield: '⚫⚪' },
                { name: 'Brighton', shield: '🔵⚪' }
            ]
        },
        laliga: {
            name: 'La Liga',
            importance: 0.9,
            teams: [
                { name: 'Real Madrid', shield: '⚪💜' },
                { name: 'Barcelona', shield: '🔵🔴' },
                { name: 'Atletico Madrid', shield: '🔴⚪' },
                { name: 'Sevilla', shield: '🔴⚪' },
                { name: 'Valencia', shield: '🟠⚫' },
                { name: 'Real Betis', shield: '🟢⚪' }
            ]
        },
        champions: {
            name: 'Champions League',
            importance: 1.0,
            teams: [
                { name: 'Real Madrid', shield: '⚪💜' },
                { name: 'Manchester City', shield: '🔵⚪' },
                { name: 'Bayern Munich', shield: '🔴⚪' },
                { name: 'PSG', shield: '🔵🔴' }
            ]
        }
    };

    static generateTodaysMatches() {
        const matches = [];
        const now = new Date();
        
        Object.entries(this.leagues).forEach(([leagueKey, league]) => {
            const matchCount = leagueKey === 'champions' ? 2 : Math.floor(Math.random() * 4) + 2;
            
            for (let i = 0; i < matchCount; i++) {
                const homeTeam = league.teams[Math.floor(Math.random() * league.teams.length)];
                let awayTeam;
                do {
                    awayTeam = league.teams[Math.floor(Math.random() * league.teams.length)];
                } while (awayTeam.name === homeTeam.name);
                
                const gameTime = new Date(now);
                gameTime.setHours(14 + Math.floor(Math.random() * 8));
                gameTime.setMinutes(Math.floor(Math.random() * 60));
                
                const match = this.generateMatchData(homeTeam, awayTeam, league, gameTime);
                matches.push(match);
            }
        });
        
        // Ordenar por importância (bolhas maiores primeiro)
        return matches.sort((a, b) => b.importance - a.importance);
    }
    
    static generateMatchData(homeTeam, awayTeam, league, gameTime) {
        // Gerar odds realísticas
        const homeOdd = 1.5 + Math.random() * 3;
        const drawOdd = 2.8 + Math.random() * 2;
        const awayOdd = 1.5 + Math.random() * 3;
        const overOdd = 1.4 + Math.random() * 1.8;
        const underOdd = 1.4 + Math.random() * 1.8;
        
        // Calcular probabilidade baseada nas odds
        const homeProbImplied = 1 / homeOdd;
        const awayProbImplied = 1 / awayOdd;
        const overProbImplied = 1 / overOdd;
        
        // Probabilidade de acerto (simulada)
        const winProbability = 0.3 + Math.random() * 0.6; // 30% a 90%
        
        // Importância baseada na liga e times
        const teamImportance = (homeTeam.name.includes('Real Madrid') || 
                               homeTeam.name.includes('Barcelona') ||
                               homeTeam.name.includes('Manchester') ||
                               homeTeam.name.includes('Flamengo') ||
                               homeTeam.name.includes('Palmeiras')) ? 0.2 : 0;
        
        const importance = league.importance + teamImportance + (winProbability * 0.3);
        
        // Status do jogo
        const status = Math.random() > 0.8 ? 'LIVE' : 'SCHEDULED';
        const score = status === 'LIVE' ? {
            home: Math.floor(Math.random() * 4),
            away: Math.floor(Math.random() * 4)
        } : null;
        
        return {
            id: `match_${Date.now()}_${Math.random()}`,
            homeTeam,
            awayTeam,
            league: league.name,
            gameTime: gameTime.toISOString(),
            status,
            score,
            odds: {
                home: homeOdd,
                draw: drawOdd,
                away: awayOdd,
                over25: overOdd,
                under25: underOdd
            },
            winProbability,
            importance: Math.min(importance, 1),
            confidence: 0.4 + Math.random() * 0.6,
            market: 'over_under', // Mercado principal
            bias: (overProbImplied - (1 - overProbImplied)) * 2, // -2 a +2
            bookmakerCount: 5 + Math.floor(Math.random() * 15)
        };
    }
}

// ===== CLASSE DA BOLHA ESTILO CRYPTOBUBBLES =====
class CryptoBubble {
    constructor(matchData, canvasWidth, canvasHeight) {
        this.matchData = matchData;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Tamanho baseado na importância
        this.baseRadius = CONFIG.MIN_BUBBLE_SIZE + 
            (matchData.importance * (CONFIG.MAX_BUBBLE_SIZE - CONFIG.MIN_BUBBLE_SIZE));
        this.radius = this.baseRadius;
        
        // Posição inicial aleatória
        this.x = this.radius + Math.random() * (canvasWidth - 2 * this.radius);
        this.y = this.radius + Math.random() * (canvasHeight - 2 * this.radius);
        
        // Velocidade inicial
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        // Propriedades visuais
        this.color = this.getColorScheme();
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.glowIntensity = matchData.confidence;
        
        // Animação
        this.hoverScale = 1;
        this.targetHoverScale = 1;
        
        // Estado
        this.isHovered = false;
        this.isSelected = false;
    }
    
    getColorScheme() {
        const { bias, importance, status } = this.matchData;
        
        // Jogos ao vivo = dourado
        if (status === 'LIVE') {
            return CONFIG.COLORS.GOLD_IMPORTANT;
        }
        
        // Jogos muito importantes = roxo
        if (importance > 0.9) {
            return CONFIG.COLORS.PURPLE_SPECIAL;
        }
        
        // Baseado no bias (Over/Under)
        if (bias > 0.3) {
            return CONFIG.COLORS.GREEN_POSITIVE; // Over
        } else if (bias < -0.3) {
            return CONFIG.COLORS.RED_NEGATIVE; // Under
        } else {
            return CONFIG.COLORS.BLUE_NEUTRAL; // Neutro
        }
    }
    
    update(deltaTime) {
        // Atualizar física
        this.vy += CONFIG.GRAVITY * deltaTime;
        this.x += this.vx * deltaTime * CONFIG.ANIMATION_SPEED;
        this.y += this.vy * deltaTime * CONFIG.ANIMATION_SPEED;
        
        // Aplicar atrito
        this.vx *= CONFIG.FRICTION;
        this.vy *= CONFIG.FRICTION;
        
        // Colisão com bordas
        if (this.x <= this.radius || this.x >= this.canvasWidth - this.radius) {
            this.vx *= -CONFIG.BOUNCE_DAMPING;
            this.x = Math.max(this.radius, Math.min(this.canvasWidth - this.radius, this.x));
        }
        
        if (this.y <= this.radius || this.y >= this.canvasHeight - this.radius) {
            this.vy *= -CONFIG.BOUNCE_DAMPING;
            this.y = Math.max(this.radius, Math.min(this.canvasHeight - this.radius, this.y));
        }
        
        // Atualizar animações
        this.pulsePhase += deltaTime * 0.03;
        
        // Hover effect
        this.hoverScale += (this.targetHoverScale - this.hoverScale) * 0.1;
        this.radius = this.baseRadius * this.hoverScale;
    }
    
    draw(ctx) {
        const pulseEffect = 1 + Math.sin(this.pulsePhase) * 0.05 * this.glowIntensity;
        const currentRadius = this.radius * pulseEffect;
        
        // Sombra/Glow
        if (this.glowIntensity > 0.6 || this.matchData.status === 'LIVE') {
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.color.glow;
        }
        
        // Gradiente da bolha
        const gradient = ctx.createRadialGradient(
            this.x - currentRadius * 0.3,
            this.y - currentRadius * 0.3,
            0,
            this.x,
            this.y,
            currentRadius
        );
        
        gradient.addColorStop(0, this.color.light);
        gradient.addColorStop(0.7, this.color.dark);
        gradient.addColorStop(1, this.color.dark + '80');
        
        // Desenhar bolha principal
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borda brilhante
        ctx.strokeStyle = this.color.light + '60';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Reflexo (highlight)
        const highlightGradient = ctx.createRadialGradient(
            this.x - currentRadius * 0.4,
            this.y - currentRadius * 0.4,
            0,
            this.x - currentRadius * 0.4,
            this.y - currentRadius * 0.4,
            currentRadius * 0.5
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = highlightGradient;
        ctx.fill();
        
        // Desenhar conteúdo da bolha
        this.drawContent(ctx, currentRadius);
        
        // Indicador de probabilidade (anel)
        this.drawProbabilityRing(ctx, currentRadius);
    }
    
    drawContent(ctx, radius) {
        const { homeTeam, awayTeam, gameTime, status, score, winProbability } = this.matchData;
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Escudos dos times (emojis por enquanto)
        const shieldSize = Math.max(12, radius * 0.15);
        ctx.font = `${shieldSize}px Arial`;
        
        // Escudo casa (esquerda)
        ctx.fillText(homeTeam.shield, this.x - radius * 0.3, this.y - radius * 0.2);
        
        // VS
        ctx.font = `bold ${Math.max(8, radius * 0.1)}px Inter`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('VS', this.x, this.y - radius * 0.2);
        
        // Escudo visitante (direita)
        ctx.font = `${shieldSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText(awayTeam.shield, this.x + radius * 0.3, this.y - radius * 0.2);
        
        // Nomes dos times
        const teamFontSize = Math.max(8, radius * 0.08);
        ctx.font = `${teamFontSize}px Inter`;
        ctx.fillStyle = 'white';
        
        // Nome casa (abreviado)
        const homeShort = homeTeam.name.split(' ')[0].substring(0, 6);
        ctx.fillText(homeShort, this.x - radius * 0.3, this.y);
        
        // Nome visitante (abreviado)
        const awayShort = awayTeam.name.split(' ')[0].substring(0, 6);
        ctx.fillText(awayShort, this.x + radius * 0.3, this.y);
        
        // Horário ou placar
        ctx.font = `bold ${Math.max(10, radius * 0.12)}px Inter`;
        if (status === 'LIVE' && score) {
            ctx.fillStyle = this.color.light;
            ctx.fillText(`${score.home} - ${score.away}`, this.x, this.y + radius * 0.2);
            
            // Indicador LIVE
            ctx.font = `bold ${Math.max(6, radius * 0.06)}px Inter`;
            ctx.fillStyle = '#ff4757';
            ctx.fillText('● AO VIVO', this.x, this.y + radius * 0.35);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const time = formatTime(new Date(gameTime));
            ctx.fillText(time, this.x, this.y + radius * 0.2);
        }
        
        // Probabilidade
        ctx.font = `bold ${Math.max(8, radius * 0.09)}px Inter`;
        ctx.fillStyle = this.color.light;
        ctx.fillText(formatProbability(winProbability), this.x, this.y + radius * 0.4);
    }
    
    drawProbabilityRing(ctx, radius) {
        const ringRadius = radius + 4;
        const probability = this.matchData.winProbability;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (probability * 2 * Math.PI);
        
        // Anel de fundo
        ctx.beginPath();
        ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Anel de probabilidade
        ctx.beginPath();
        ctx.arc(this.x, this.y, ringRadius, startAngle, endAngle);
        ctx.strokeStyle = this.color.light;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius + 2;
        
        if (distance < minDistance) {
            // Calcular sobreposição
            const overlap = minDistance - distance;
            
            // Normalizar vetor de colisão
            const nx = dx / (distance || 1);
            const ny = dy / (distance || 1);
            
            // Separar bolhas
            const separation = overlap * 0.5;
            this.x -= nx * separation;
            this.y -= ny * separation;
            other.x += nx * separation;
            other.y += ny * separation;
            
            // Trocar velocidades
            const relativeVelocityX = other.vx - this.vx;
            const relativeVelocityY = other.vy - this.vy;
            const speed = relativeVelocityX * nx + relativeVelocityY * ny;
            
            if (speed < 0) return; // Objetos se separando
            
            const impulse = 2 * speed / 2; // Massa igual para ambos
            this.vx += impulse * nx * CONFIG.COLLISION_FORCE;
            this.vy += impulse * ny * CONFIG.COLLISION_FORCE;
            other.vx -= impulse * nx * CONFIG.COLLISION_FORCE;
            other.vy -= impulse * ny * CONFIG.COLLISION_FORCE;
        }
    }
    
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
    
    setHover(isHovered) {
        this.isHovered = isHovered;
        this.targetHoverScale = isHovered ? 1.1 : 1;
    }
}

// ===== ENGINE PRINCIPAL =====
class BubbleEngine {
    constructor(canvasId) {
        this.canvas = $(canvasId);
        if (!this.canvas) {
            console.error('Canvas não encontrado:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.animationId = null;
        this.lastTime = 0;
        
        // Estado
        this.isRunning = false;
        this.hoveredBubble = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.loadMatches();
    }
    
    setupCanvas() {
        const updateCanvasSize = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * 2; // Retina display
            this.canvas.height = rect.height * 2;
            this.ctx.scale(2, 2);
            
            this.canvasWidth = rect.width;
            this.canvasHeight = rect.height;
            
            // Atualizar bounds das bolhas
            this.bubbles.forEach(bubble => {
                bubble.canvasWidth = this.canvasWidth;
                bubble.canvasHeight = this.canvasHeight;
            });
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Verificar hover
            let foundHover = false;
            this.bubbles.forEach(bubble => {
                const isHovered = bubble.isPointInside(x, y);
                bubble.setHover(isHovered);
                if (isHovered) {
                    foundHover = true;
                    this.hoveredBubble = bubble;
                    this.canvas.style.cursor = 'pointer';
                }
            });
            
            if (!foundHover) {
                this.hoveredBubble = null;
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Click events
        this.canvas.addEventListener('click', (e) => {
            if (this.hoveredBubble) {
                this.showMatchModal(this.hoveredBubble.matchData);
            }
        });
    }
    
    async loadMatches() {
        try {
            // Mostrar loading
            const loadingOverlay = $('#loading-overlay');
            if (loadingOverlay) loadingOverlay.classList.remove('hidden');
            
            // Simular delay de carregamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Gerar dados dos jogos
            const matches = MatchDataGenerator.generateTodaysMatches();
            
            // Criar bolhas
            this.bubbles = matches.slice(0, CONFIG.BUBBLE_COUNT).map(match => 
                new CryptoBubble(match, this.canvasWidth, this.canvasHeight)
            );
            
            // Atualizar estatísticas
            this.updateStats(matches);
            
            // Esconder loading
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            
            // Iniciar animação
            this.start();
            
            log(`${this.bubbles.length} bolhas carregadas com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
        }
    }
    
    updateStats(matches) {
        const totalMatches = matches.length;
        const highConfidence = matches.filter(m => m.winProbability > 0.7).length;
        const liveMatches = matches.filter(m => m.status === 'LIVE').length;
        
        const totalElement = $('#total-matches');
        const highElement = $('#high-confidence');
        const liveElement = $('#live-matches');
        const updateElement = $('#last-update');
        
        if (totalElement) totalElement.textContent = totalMatches;
        if (highElement) highElement.textContent = highConfidence;
        if (liveElement) liveElement.textContent = liveMatches;
        if (updateElement) updateElement.textContent = formatTime(new Date());
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            const deltaTime = Math.min(16, currentTime - this.lastTime) / 16;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    update(deltaTime) {
        // Atualizar bolhas
        this.bubbles.forEach(bubble => {
            bubble.update(deltaTime);
        });
        
        // Verificar colisões
        for (let i = 0; i < this.bubbles.length; i++) {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                this.bubbles[i].checkCollision(this.bubbles[j]);
            }
        }
    }
    
    render() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Desenhar bolhas (maiores primeiro para depth)
        const sortedBubbles = [...this.bubbles].sort((a, b) => b.radius - a.radius);
        sortedBubbles.forEach(bubble => {
            bubble.draw(this.ctx);
        });
    }
    
    showMatchModal(matchData) {
        const modal = $('#match-modal');
        if (!modal) return;
        
        // Preencher dados do modal
        $('#modal-title').textContent = `${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`;
        $('#home-team').textContent = matchData.homeTeam.name;
        $('#away-team').textContent = matchData.awayTeam.name;
        $('#match-time').textContent = formatTime(new Date(matchData.gameTime));
        $('#match-league').textContent = matchData.league;
        $('#match-probability').textContent = formatProbability(matchData.winProbability);
        $('#match-confidence').textContent = formatProbability(matchData.confidence);
        
        // Preencher odds
        const oddsGrid = $('#odds-grid');
        if (oddsGrid) {
            oddsGrid.innerHTML = `
                <div class="odd-item">
                    <div class="odd-label">Casa</div>
                    <div class="odd-value">${matchData.odds.home.toFixed(2)}</div>
                </div>
                <div class="odd-item">
                    <div class="odd-label">Empate</div>
                    <div class="odd-value">${matchData.odds.draw.toFixed(2)}</div>
                </div>
                <div class="odd-item">
                    <div class="odd-label">Visitante</div>
                    <div class="odd-value">${matchData.odds.away.toFixed(2)}</div>
                </div>
                <div class="odd-item">
                    <div class="odd-label">Over 2.5</div>
                    <div class="odd-value">${matchData.odds.over25.toFixed(2)}</div>
                </div>
                <div class="odd-item">
                    <div class="odd-label">Under 2.5</div>
                    <div class="odd-value">${matchData.odds.under25.toFixed(2)}</div>
                </div>
            `;
        }
        
        // Análise rápida
        const analysisContent = $('#analysis-content');
        if (analysisContent) {
            const analysis = this.generateAnalysis(matchData);
            analysisContent.innerHTML = `<p>${analysis}</p>`;
        }
        
        // Mostrar modal
        modal.classList.remove('hidden');
        modal.classList.add('visible');
    }
    
    generateAnalysis(matchData) {
        const { winProbability, importance, bias, homeTeam, awayTeam } = matchData;
        
        let analysis = `Confronto entre ${homeTeam.name} e ${awayTeam.name}. `;
        
        if (winProbability > 0.8) {
            analysis += "Palpite de alta confiança com excelente probabilidade de acerto. ";
        } else if (winProbability > 0.6) {
            analysis += "Palpite com boa probabilidade de acerto. ";
        } else {
            analysis += "Palpite de risco moderado. ";
        }
        
        if (bias > 0.5) {
            analysis += "Mercado indica tendência para Over 2.5 gols. ";
        } else if (bias < -0.5) {
            analysis += "Mercado indica tendência para Under 2.5 gols. ";
        } else {
            analysis += "Mercado equilibrado entre Over/Under. ";
        }
        
        if (importance > 0.9) {
            analysis += "Jogo de alta importância com grande movimentação no mercado.";
        }
        
        return analysis;
    }
}

// ===== CONTROLES DA INTERFACE =====
class UIController {
    constructor(engine) {
        this.engine = engine;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botão refresh
        const refreshBtn = $('#refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.engine.loadMatches();
            });
        }
        
        // Filtros
        const marketSelect = $('#market-select');
        const leagueFilter = $('#league-filter');
        
        if (marketSelect) {
            marketSelect.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (leagueFilter) {
            leagueFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Modal
        const closeModal = $('#close-modal');
        const modal = $('#match-modal');
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('visible');
                modal.classList.add('hidden');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('visible');
                    modal.classList.add('hidden');
                }
            });
        }
        
        // Painel de controle
        const panelToggle = $('#panel-toggle');
        const controlPanel = $('#control-panel');
        
        if (panelToggle && controlPanel) {
            panelToggle.addEventListener('click', () => {
                controlPanel.classList.toggle('open');
            });
        }
        
        // Controles avançados
        this.setupAdvancedControls();
    }
    
    setupAdvancedControls() {
        // Tamanho das bolhas
        const bubbleSizeSlider = $('#bubble-size');
        if (bubbleSizeSlider) {
            bubbleSizeSlider.addEventListener('input', (e) => {
                const scale = parseFloat(e.target.value);
                this.engine.bubbles.forEach(bubble => {
                    bubble.baseRadius = (CONFIG.MIN_BUBBLE_SIZE + 
                        (bubble.matchData.importance * (CONFIG.MAX_BUBBLE_SIZE - CONFIG.MIN_BUBBLE_SIZE))) * scale;
                });
            });
        }
        
        // Velocidade da animação
        const animationSpeedSlider = $('#animation-speed');
        if (animationSpeedSlider) {
            animationSpeedSlider.addEventListener('input', (e) => {
                CONFIG.ANIMATION_SPEED = parseFloat(e.target.value);
            });
        }
        
        // Filtro de probabilidade
        const probabilityFilter = $('#probability-filter');
        const probabilityValue = $('#probability-value');
        if (probabilityFilter && probabilityValue) {
            probabilityFilter.addEventListener('input', (e) => {
                const minProb = parseInt(e.target.value) / 100;
                probabilityValue.textContent = `${e.target.value}%+`;
                
                this.engine.bubbles.forEach(bubble => {
                    bubble.canvas.style.opacity = bubble.matchData.winProbability >= minProb ? '1' : '0.3';
                });
            });
        }
        
        // Reset
        const resetBtn = $('#reset-view');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.engine.loadMatches();
            });
        }
    }
    
    applyFilters() {
        // Implementar filtros por mercado e liga
        const market = $('#market-select')?.value || 'over_under';
        const league = $('#league-filter')?.value || '';
        
        // Recarregar com filtros
        this.engine.loadMatches();
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    log('Inicializando Bubles Fullscreen...');
    
    // Criar engine
    const engine = new BubbleEngine('#fullscreen-canvas');
    
    // Criar controlador de UI
    const uiController = new UIController(engine);
    
    // Exportar para debug
    window.BubbleEngine = engine;
    window.UIController = uiController;
    
    log('Bubles Fullscreen inicializado com sucesso!');
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (window.BubbleEngine) {
        window.BubbleEngine.stop();
    }
});

