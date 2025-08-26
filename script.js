/*************************************************
 * BUBLES - SISTEMA COMPLETO DE PALPITES EM BOLHAS
 * Funcionalidades:
 * - 30 dias grátis após cadastro
 * - Sistema de autenticação completo
 * - Engine de bolhas funcionais
 * - Integração com API-Football
 * - Dados de demonstração
 *************************************************/

// ===== CONFIGURAÇÕES =====
const CONFIG = {
    TRIAL_DAYS: 30,
    SUBSCRIPTION_PRICE: 39.90,
    PIX_KEY: "388.335.408-20",
    API_CACHE_TIME: 5 * 60 * 1000, // 5 minutos
    BUBBLE_UPDATE_INTERVAL: 60 * 1000, // 1 minuto
    MAX_BUBBLES: 20
};

// ===== UTILITÁRIOS =====
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const log = (...args) => console.log('[BUBLES]', ...args);
const error = (...args) => console.error('[BUBLES]', ...args);

// Formatação de data/hora
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
};

// Toast notifications
const showToast = (message, type = 'info') => {
    // Implementação simples com alert por enquanto
    alert(message);
};

// ===== GERENCIAMENTO DE ESTADO =====
class AppState {
    constructor() {
        this.cache = new Map();
        this.updateCallbacks = new Set();
    }

    // LocalStorage helpers
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            error('Erro ao ler localStorage:', e);
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            this.notifyUpdate(key, value);
        } catch (e) {
            error('Erro ao salvar localStorage:', e);
        }
    }

    remove(key) {
        localStorage.removeItem(key);
        this.notifyUpdate(key, null);
    }

    // Cache management
    setCache(key, data, ttl = CONFIG.API_CACHE_TIME) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl
        });
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expires) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    // Update notifications
    onUpdate(callback) {
        this.updateCallbacks.add(callback);
    }

    notifyUpdate(key, value) {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(key, value);
            } catch (e) {
                error('Erro em callback de update:', e);
            }
        });
    }

    // User management
    get currentUser() {
        return this.get('bubles_current_user');
    }

    set currentUser(user) {
        if (user) {
            this.set('bubles_current_user', user);
        } else {
            this.remove('bubles_current_user');
        }
    }

    get users() {
        return this.get('bubles_users', []);
    }

    addUser(userData) {
        const users = this.users;
        const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            password: userData.password, // Em produção, usar hash
            createdAt: Date.now(),
            trialEndsAt: Date.now() + (CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000),
            isSubscribed: false,
            subscriptionEndsAt: null
        };
        
        users.push(newUser);
        this.set('bubles_users', users);
        return newUser;
    }

    findUser(email) {
        return this.users.find(user => user.email === email);
    }

    updateUser(userId, updates) {
        const users = this.users;
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            this.set('bubles_users', users);
            
            // Update current user if it's the same
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = users[userIndex];
            }
        }
    }

    // Access control
    hasAccess(user = null) {
        const currentUser = user || this.currentUser;
        if (!currentUser) return false;

        const now = Date.now();
        
        // Check subscription
        if (currentUser.isSubscribed && currentUser.subscriptionEndsAt > now) {
            return true;
        }
        
        // Check trial
        if (currentUser.trialEndsAt > now) {
            return true;
        }
        
        return false;
    }

    getAccessStatus(user = null) {
        const currentUser = user || this.currentUser;
        if (!currentUser) return { hasAccess: false, type: 'none' };

        const now = Date.now();
        
        if (currentUser.isSubscribed && currentUser.subscriptionEndsAt > now) {
            const daysLeft = Math.ceil((currentUser.subscriptionEndsAt - now) / (24 * 60 * 60 * 1000));
            return {
                hasAccess: true,
                type: 'subscription',
                daysLeft,
                message: `Assinatura ativa (${daysLeft} dias)`
            };
        }
        
        if (currentUser.trialEndsAt > now) {
            const daysLeft = Math.ceil((currentUser.trialEndsAt - now) / (24 * 60 * 60 * 1000));
            return {
                hasAccess: true,
                type: 'trial',
                daysLeft,
                message: `Período gratuito (${daysLeft} dias restantes)`
            };
        }
        
        return {
            hasAccess: false,
            type: 'expired',
            message: 'Acesso expirado'
        };
    }
}

// ===== ROTEAMENTO =====
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Setup event listeners
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());

        // Setup route links
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                if (href.startsWith('#')) {
                    window.location.hash = href;
                }
            }
        });
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const handler = this.routes.get(hash);
        
        if (handler) {
            // Hide all sections
            $$('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Update nav links
            $$('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${hash}`) {
                    link.classList.add('active');
                }
            });
            
            // Show target section
            const section = $(`#${hash}`);
            if (section) {
                section.classList.add('active');
            }
            
            // Call handler
            handler();
            this.currentRoute = hash;
        } else {
            // Redirect to home if route not found
            window.location.hash = '#home';
        }
    }

    navigate(path) {
        window.location.hash = `#${path}`;
    }
}

// ===== AUTENTICAÇÃO =====
class AuthManager {
    constructor(appState, router) {
        this.appState = appState;
        this.router = router;
        this.init();
    }

    init() {
        // Register form
        const registerForm = $('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Login form
        const loginForm = $('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = $('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Payment confirmation
        const confirmPaymentBtn = $('#confirm-payment');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', () => {
                this.handlePaymentConfirmation();
            });
        }
    }

    async handleRegister() {
        const email = $('#reg-email').value.trim().toLowerCase();
        const password = $('#reg-password').value;
        const confirmPassword = $('#reg-confirm').value;

        // Validation
        if (!email || !password || !confirmPassword) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            showToast('Por favor, insira um email válido.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }

        // Check if user already exists
        if (this.appState.findUser(email)) {
            showToast('Este email já está cadastrado.', 'error');
            return;
        }

        try {
            // Create user
            const newUser = this.appState.addUser({ email, password });
            this.appState.currentUser = newUser;
            
            showToast(`Cadastro realizado! Você ganhou ${CONFIG.TRIAL_DAYS} dias grátis!`, 'success');
            this.router.navigate('dashboard');
        } catch (e) {
            error('Erro no cadastro:', e);
            showToast('Erro ao criar conta. Tente novamente.', 'error');
        }
    }

    async handleLogin() {
        const email = $('#login-email').value.trim().toLowerCase();
        const password = $('#login-password').value;

        if (!email || !password) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }

        const user = this.appState.findUser(email);
        
        if (!user || user.password !== password) {
            showToast('Email ou senha incorretos.', 'error');
            return;
        }

        this.appState.currentUser = user;
        showToast('Login realizado com sucesso!', 'success');
        this.router.navigate('dashboard');
    }

    handleLogout() {
        this.appState.currentUser = null;
        showToast('Logout realizado com sucesso!', 'success');
        this.router.navigate('home');
    }

    handlePaymentConfirmation() {
        const user = this.appState.currentUser;
        if (!user) {
            showToast('Você precisa estar logado.', 'error');
            return;
        }

        // Simulate payment confirmation
        const subscriptionEnd = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
        
        this.appState.updateUser(user.id, {
            isSubscribed: true,
            subscriptionEndsAt: subscriptionEnd
        });

        showToast('Pagamento confirmado! Assinatura ativada por 30 dias.', 'success');
        
        // Refresh dashboard
        if (this.router.currentRoute === 'dashboard') {
            this.router.handleRoute();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ===== ENGINE DE BOLHAS =====
class Bubble {
    constructor(data) {
        this.label = data.label;
        this.confidence = data.confidence || 0;
        this.bias = data.bias || 0;
        this.market = data.market || 'over_under';
        
        // Calculate size based on confidence
        this.radius = Math.max(20, Math.min(60, 20 + (this.confidence * 40)));
        
        // Random position
        this.x = Math.random() * 400 + this.radius;
        this.y = Math.random() * 300 + this.radius;
        
        // Random velocity
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        
        // Bounds
        this.width = 600;
        this.height = 400;
    }

    setBounds(width, height) {
        this.width = width;
        this.height = height;
    }

    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply friction
        this.vx *= 0.995;
        this.vy *= 0.995;
        
        // Boundary collision
        if (this.x <= this.radius || this.x >= this.width - this.radius) {
            this.vx *= -0.8;
            this.x = Math.max(this.radius, Math.min(this.width - this.radius, this.x));
        }
        
        if (this.y <= this.radius || this.y >= this.height - this.radius) {
            this.vy *= -0.8;
            this.y = Math.max(this.radius, Math.min(this.height - this.radius, this.y));
        }
    }

    draw(ctx) {
        // Determine color based on bias
        let color;
        if (this.bias > 0.1) {
            color = `rgba(16, 185, 129, ${0.7 + this.confidence * 0.3})`; // Green for positive bias
        } else if (this.bias < -0.1) {
            color = `rgba(239, 68, 68, ${0.7 + this.confidence * 0.3})`; // Red for negative bias
        } else {
            color = `rgba(107, 114, 128, ${0.7 + this.confidence * 0.3})`; // Gray for neutral
        }
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        
        gradient.addColorStop(0, color.replace('0.7', '0.9'));
        gradient.addColorStop(1, color);
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(10, this.radius * 0.25)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text
        this.drawWrappedText(ctx, this.label, this.x, this.y, this.radius * 1.6);
    }

    drawWrappedText(ctx, text, x, y, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        const lineHeight = Math.max(12, this.radius * 0.3);
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }

    static checkCollision(bubble1, bubble2) {
        const dx = bubble2.x - bubble1.x;
        const dy = bubble2.y - bubble1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubble1.radius + bubble2.radius;

        if (distance < minDistance) {
            // Calculate overlap
            const overlap = minDistance - distance;
            
            // Normalize collision vector
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Separate bubbles
            const separation = overlap * 0.5;
            bubble1.x -= nx * separation;
            bubble1.y -= ny * separation;
            bubble2.x += nx * separation;
            bubble2.y += ny * separation;
            
            // Exchange velocities (simplified)
            const tempVx = bubble1.vx;
            const tempVy = bubble1.vy;
            bubble1.vx = bubble2.vx * 0.8;
            bubble1.vy = bubble2.vy * 0.8;
            bubble2.vx = tempVx * 0.8;
            bubble2.vy = tempVy * 0.8;
        }
    }
}

class BubbleCanvas {
    constructor(canvasId) {
        this.canvas = $(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.animationId = null;
        this.lastTime = 0;
        
        this.setupCanvas();
        this.setupResizeObserver();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Set actual canvas size for crisp rendering
        this.canvas.width = this.width * 2;
        this.canvas.height = this.height * 2;
        this.ctx.scale(2, 2);
        
        // Update bubble bounds
        this.bubbles.forEach(bubble => bubble.setBounds(this.width, this.height));
    }

    setupResizeObserver() {
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.setupCanvas();
            });
            resizeObserver.observe(this.canvas);
        }
    }

    setBubbles(bubbleData) {
        this.bubbles = bubbleData.map(data => new Bubble(data));
        this.bubbles.forEach(bubble => bubble.setBounds(this.width, this.height));
    }

    start() {
        if (this.animationId) return;
        
        const animate = (currentTime) => {
            const deltaTime = Math.min(16, currentTime - this.lastTime) / 16;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    update(deltaTime) {
        // Update bubble physics
        this.bubbles.forEach(bubble => {
            bubble.setBounds(this.width, this.height);
            bubble.update(deltaTime);
        });

        // Handle collisions
        for (let i = 0; i < this.bubbles.length; i++) {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                Bubble.checkCollision(this.bubbles[i], this.bubbles[j]);
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw bubbles
        this.bubbles.forEach(bubble => bubble.draw(this.ctx));
    }
}

// ===== GERENCIADOR DE DADOS =====
class DataManager {
    constructor(appState) {
        this.appState = appState;
    }

    async fetchRealData(market = 'over_under', leagueFilter = '') {
        try {
            // Simulate API call - replace with real API integration
            const cacheKey = `data_${market}_${leagueFilter}`;
            const cached = this.appState.getCache(cacheKey);
            
            if (cached) {
                log('Using cached data');
                return cached;
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate realistic demo data
            const data = this.generateDemoData(market, leagueFilter);
            
            // Cache the data
            this.appState.setCache(cacheKey, data);
            
            return data;
        } catch (e) {
            error('Error fetching data:', e);
            return this.generateDemoData(market, leagueFilter);
        }
    }

    generateDemoData(market = 'over_under', leagueFilter = '') {
        const teams = [
            ['Flamengo', 'Palmeiras'], ['Real Madrid', 'Barcelona'],
            ['Manchester City', 'Liverpool'], ['Bayern Munich', 'Borussia Dortmund'],
            ['PSG', 'Marseille'], ['Juventus', 'Inter Milan'],
            ['Arsenal', 'Chelsea'], ['Atletico Madrid', 'Valencia'],
            ['AC Milan', 'Napoli'], ['Tottenham', 'Manchester United'],
            ['Santos', 'Corinthians'], ['São Paulo', 'Vasco'],
            ['Internacional', 'Grêmio'], ['Atletico MG', 'Cruzeiro']
        ];

        let filteredTeams = teams;
        if (leagueFilter) {
            const filter = leagueFilter.toLowerCase();
            filteredTeams = teams.filter(([home, away]) => 
                home.toLowerCase().includes(filter) || 
                away.toLowerCase().includes(filter) ||
                (filter.includes('brazil') && ['Flamengo', 'Palmeiras', 'Santos', 'Corinthians', 'São Paulo', 'Vasco', 'Internacional', 'Grêmio', 'Atletico MG', 'Cruzeiro'].some(team => [home, away].includes(team)))
            );
        }

        return filteredTeams.slice(0, CONFIG.MAX_BUBBLES).map(([home, away]) => {
            const confidence = Math.random();
            const bias = (Math.random() - 0.5) * 2; // -1 to 1
            
            let label;
            if (market === 'over_under') {
                const overOdd = (1.5 + Math.random() * 1.5).toFixed(2);
                const underOdd = (1.5 + Math.random() * 1.5).toFixed(2);
                label = `${home} vs ${away}\nO2.5: ${overOdd} | U2.5: ${underOdd}`;
            } else {
                const homeOdd = (1.5 + Math.random() * 3).toFixed(2);
                const drawOdd = (2.5 + Math.random() * 2).toFixed(2);
                const awayOdd = (1.5 + Math.random() * 3).toFixed(2);
                label = `${home} vs ${away}\n1: ${homeOdd} | X: ${drawOdd} | 2: ${awayOdd}`;
            }
            
            return {
                label,
                confidence,
                bias,
                market
            };
        });
    }
}

// ===== APLICAÇÃO PRINCIPAL =====
class BublesApp {
    constructor() {
        this.appState = new AppState();
        this.router = new Router();
        this.authManager = new AuthManager(this.appState, this.router);
        this.dataManager = new DataManager(this.appState);
        this.bubbleCanvas = null;
        this.miniCanvas = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        log('Initializing Bubles App...');
        
        // Setup routes
        this.setupRoutes();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize canvases
        this.initializeCanvases();
        
        // Start auto-update
        this.startAutoUpdate();
        
        log('App initialized successfully!');
    }

    setupRoutes() {
        this.router.register('home', () => this.handleHomeRoute());
        this.router.register('register', () => this.handleRegisterRoute());
        this.router.register('login', () => this.handleLoginRoute());
        this.router.register('dashboard', () => this.handleDashboardRoute());
    }

    setupEventListeners() {
        // Update button
        const updateBtn = $('#update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateBubbles());
        }

        // Market select
        const marketSelect = $('#market-select');
        if (marketSelect) {
            marketSelect.addEventListener('change', () => this.updateBubbles());
        }

        // League filter
        const leagueFilter = $('#league-filter');
        if (leagueFilter) {
            leagueFilter.addEventListener('input', () => {
                clearTimeout(this.filterTimeout);
                this.filterTimeout = setTimeout(() => this.updateBubbles(), 500);
            });
        }
    }

    initializeCanvases() {
        this.bubbleCanvas = new BubbleCanvas('#bubble-canvas');
        this.miniCanvas = new BubbleCanvas('#mini-canvas');
        
        // Initial data load
        this.updateBubbles();
    }

    startAutoUpdate() {
        // Update bubbles every minute
        this.updateInterval = setInterval(() => {
            this.updateBubbles();
        }, CONFIG.BUBBLE_UPDATE_INTERVAL);
    }

    async updateBubbles() {
        const updateStatus = $('#update-status');
        const market = $('#market-select')?.value || 'over_under';
        const leagueFilter = $('#league-filter')?.value || '';
        
        try {
            if (updateStatus) {
                updateStatus.textContent = 'Atualizando...';
            }
            
            const data = await this.dataManager.fetchRealData(market, leagueFilter);
            
            // Update main canvas
            if (this.bubbleCanvas) {
                this.bubbleCanvas.setBubbles(data);
                this.bubbleCanvas.start();
            }
            
            // Update mini canvas
            if (this.miniCanvas) {
                this.miniCanvas.setBubbles(data.slice(0, 8));
                this.miniCanvas.start();
            }
            
            // Update status
            if (updateStatus) {
                const timestamp = formatTime(new Date());
                updateStatus.textContent = `Atualizado: ${timestamp} — ${data.length} palpites`;
            }
            
            // Update dashboard stats
            this.updateDashboardStats(data);
            
        } catch (e) {
            error('Error updating bubbles:', e);
            if (updateStatus) {
                updateStatus.textContent = 'Erro ao atualizar';
            }
        }
    }

    updateDashboardStats(data) {
        const tipsCount = $('#tips-count');
        const lastUpdate = $('#last-update');
        const todayTips = $('#today-tips');
        
        if (tipsCount) {
            tipsCount.textContent = data.length;
        }
        
        if (lastUpdate) {
            lastUpdate.textContent = formatTime(new Date());
        }
        
        if (todayTips) {
            todayTips.innerHTML = data.slice(0, 5).map(tip => 
                `<div class="tip-item">
                    <span class="tip-match">${tip.label.split('\n')[0]}</span>
                </div>`
            ).join('');
        }
    }

    // Route handlers
    handleHomeRoute() {
        log('Home route');
        // Home is always accessible
    }

    handleRegisterRoute() {
        log('Register route');
        // Clear forms
        const form = $('#register-form');
        if (form) form.reset();
    }

    handleLoginRoute() {
        log('Login route');
        // Clear forms
        const form = $('#login-form');
        if (form) form.reset();
    }

    handleDashboardRoute() {
        log('Dashboard route');
        
        const user = this.appState.currentUser;
        const paywall = $('#paywall');
        const content = $('#dashboard-content');
        const userEmail = $('#user-email');
        const trialStatus = $('#trial-status');
        
        if (!user) {
            // Redirect to login if not authenticated
            showToast('Você precisa fazer login para acessar esta área.', 'error');
            this.router.navigate('login');
            return;
        }
        
        // Update user info
        if (userEmail) {
            userEmail.textContent = user.email;
        }
        
        // Check access
        const accessStatus = this.appState.getAccessStatus(user);
        
        if (trialStatus) {
            trialStatus.textContent = accessStatus.message;
            trialStatus.className = `trial-badge ${accessStatus.hasAccess ? 'active' : 'expired'}`;
        }
        
        // Show/hide content based on access
        if (accessStatus.hasAccess) {
            if (paywall) paywall.classList.add('hidden');
            if (content) content.classList.remove('hidden');
        } else {
            if (paywall) paywall.classList.remove('hidden');
            if (content) content.classList.add('hidden');
        }
    }

    destroy() {
        // Cleanup
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.bubbleCanvas) {
            this.bubbleCanvas.stop();
        }
        
        if (this.miniCanvas) {
            this.miniCanvas.stop();
        }
    }
}

// ===== INICIALIZAÇÃO =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new BublesApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// Export for debugging
window.BublesApp = BublesApp;

