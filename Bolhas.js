document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("bubbles-container");

  const bubble = document.createElement("div");
  bubble.textContent = "💬 B3 bolha simulada!";
  bubble.classList.add("bubble");

  container.appendChild(bubble);
});
