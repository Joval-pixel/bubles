document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("bubbles-container");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble"); // <- ESSENCIAL
  bubble.textContent = "💬 B3 bolha simulada!";

  container.appendChild(bubble);
});
