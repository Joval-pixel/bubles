document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bubbles-container");
  const bubble = document.createElement("div");
  bubble.style.padding = "20px";
  bubble.style.backgroundColor = "#cceeff";
  bubble.style.borderRadius = "50%";
  bubble.style.display = "inline-block";
  <script src="./bolhas.js"></script>
  bubble.style.fontSize = "18px";
  bubble.style.margin = "10px";
  bubble.textContent = "💬 B3 bolha simulada!";
  container.appendChild(bubble);
});