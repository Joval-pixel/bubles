/* Reset e configurações globais */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #111111;
    color: #ffffff;
    overflow-x: hidden;
    min-height: 100vh;
}

.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 100;
}

.logo h1 {
    font-size: 2rem;
    font-weight: bold;
    background: linear-gradient(45deg, #00ff88, #00ccff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.logo .subtitle {
    font-size: 0.9rem;
    color: #888;
    margin-left: 10px;
}

.controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.search-input {
    padding: 10px 15px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px;
    color: #fff;
    font-size: 14px;
    width: 200px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.search-input::placeholder {
    color: #888;
}

.time-controls {
    display: flex;
    gap: 5px;
}

.time-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.time-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.time-btn.active {
    background: #00ff88;
    color: #000;
    border-color: #00ff88;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00ff88;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.status-text {
    font-size: 12px;
    color: #888;
}

/* Main Content */
.main-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.bubble-container {
    position: relative;
    width: 100%;
    height: calc(100vh - 140px);
    overflow: hidden;
}

/* Bolhas */
.bubble {
    position: absolute;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    font-weight: bold;
    text-align: center;
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
}

.bubble:hover {
    transform: scale(1.1);
    z-index: 10;
}

/* Cores das bolhas */
.bubble.positive {
    background: radial-gradient(circle at 30% 30%, rgba(0, 255, 136, 0.8), rgba(0, 255, 136, 0.4));
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 255, 136, 0.5);
}

.bubble.negative {
    background: radial-gradient(circle at 30% 30%, rgba(255, 68, 68, 0.8), rgba(255, 68, 68, 0.4));
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 68, 68, 0.5);
}

.bubble.neutral {
    background: radial-gradient(circle at 30% 30%, rgba(136, 136, 136, 0.8), rgba(136, 136, 136, 0.4));
    box-shadow: 0 0 20px rgba(136, 136, 136, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1);
    border-color: rgba(136, 136, 136, 0.5);
}

.bubble-symbol {
    font-size: 1em;
    font-weight: bold;
    margin-bottom: 2px;
}

.bubble-change {
    font-size: 0.8em;
    font-weight: normal;
}

.bubble-price {
    font-size: 0.7em;
    opacity: 0.8;
    margin-top: 2px;
}

/* Loading */
.loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 50;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 14px;
    z-index: 100;
}

/* Footer */
.footer {
    padding: 15px 30px;
    background: rgba(0, 0, 0, 0.8);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}

.footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #888;
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background: #1a1a1a;
    border-radius: 15px;
    width: 90%;
    max-width: 1000px;
    height: 80%;
    max-height: 600px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
    color: #fff;
    font-size: 1.2rem;
}

.modal-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.modal-body {
    height: calc(100% - 80px);
    padding: 0;
}

#tradingViewWidget {
    width: 100%;
    height: 100%;
}

/* Responsividade */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }
    
    .controls {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .search-input {
        width: 150px;
    }
    
    .bubble-container {
        height: calc(100vh - 180px);
    }
    
    .footer-info {
        flex-direction: column;
        gap: 5px;
    }
    
    .modal-content {
        width: 95%;
        height: 85%;
    }
}

@media (max-width: 480px) {
    .logo h1 {
        font-size: 1.5rem;
    }
    
    .time-btn {
        padding: 6px 12px;
        font-size: 11px;
    }
    
    .search-input {
        width: 120px;
        font-size: 12px;
    }
}
