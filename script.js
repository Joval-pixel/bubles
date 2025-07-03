const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tickers = ["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3", "WEGE3", "BBAS3"];
const bubbles = [];

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createBubble(ticker, x, y, radius, color) {
    return { ticker, x, y, radius, color, dx: getRandom(-0.5, 0.5), dy: getRandom(-0.5, 0.5) };
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.shadowColor = bubble.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(bubble.ticker, bubble.x, bubble.y + 4);
}

function updateBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const bubble of bubbles) {
        bubble.x += bubble.dx;
        bubble.y += bubble.dy;

        // Keep bubbles inside screen
        if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) bubble.dx *= -1;
        if (bubble.y + bubble.radius > canvas.height || bubble.y - bubble.radius < 0) bubble.dy *= -1;

        drawBubble(bubble);
    }
    requestAnimationFrame(updateBubbles);
}

tickers.forEach((ticker, i) => {
    const radius = getRandom(30, 60);
    const color = Math.random() > 0.5 ? "#00ff00" : "#ff0000";
    const x = getRandom(radius, canvas.width - radius);
    const y = getRandom(radius, canvas.height - radius);
    bubbles.push(createBubble(ticker, x, y, radius, color));
});

updateBubbles();
