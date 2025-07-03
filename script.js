const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

async function getStocks() {
    const response = await fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD");
    const data = await response.json();
    return data.stocks || [];
}

function drawBubbles(stocks) {
    const bubbles = stocks.map(stock => {
        const change = stock.change || 0;
        const volume = stock.volume || 1;
        const radius = Math.min(60, Math.max(10, Math.sqrt(volume) / 300));
        const color = change >= 0 ? "limegreen" : "red";
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius,
            color,
            label: stock.stock
        };
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const b of bubbles) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.closePath();
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "white";
            ctx.shadowBlur = 0;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.label, b.x, b.y);
        }
        requestAnimationFrame(animate);
    }

    animate();
}

getStocks().then(drawBubbles);
