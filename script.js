const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

async function fetchData() {
    try {
        const response = await fetch("https://brapi.dev/api/quote/list?sortBy=volume&limit=50&token=5bTDfSmR2ieax6y7JUqDAD");
        const data = await response.json();
        const stocks = data.stocks;

        bubbles = stocks.map(stock => ({
            symbol: stock.symbol || "N/A",
            change: stock.change_percent || 0,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.max(25, Math.abs((stock.change_percent || 0) * 8)),
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            color: stock.change_percent >= 0 ? "lime" : "red",
        }));
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

function drawBubble(b) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";
    ctx.font = `${Math.min(b.radius * 0.6, 18)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 15);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let b of bubbles) {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.dx *= -1;
        if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.dy *= -1;

        drawBubble(b);
    }
    requestAnimationFrame(animate);
}

function showCategory(category) {
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab[onclick*="${category}"]`).classList.add('active');
    // Aqui você pode adicionar lógica para filtrar as bolhas no futuro.
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

fetchData().then(() => animate());