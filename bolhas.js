
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("bubbles-container");
  const bubble = document.createElement("div");
  bubble.textContent = "💬 B3 bolha simulada!";
  bubble.style.padding = "20px";
  bubble.style.backgroundColor = "#cceeff";
  bubble.style.borderRadius = "50%";
  bubble.style.display = "inline-block";
  container.appendChild(bubble);
});
