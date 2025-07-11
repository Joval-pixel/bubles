/* style.css */
body {
  margin: 0;
  background: #111;
  color: white;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

#topo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.logo {
  height: 30px;
  margin-right: 10px;
}

.titulo-site {
  font-size: 18px;
  font-weight: bold;
}

#botoes {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 5px 0;
  flex-wrap: wrap;
}

.botao {
  font-size: 11px;
  padding: 5px 8px;
  background: #222;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.bolha {
  position: absolute;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  padding: 4px;
  box-shadow: 0 0 10px white;
  transition: transform 0.2s;
}

.bolha:hover {
  transform: scale(1.1);
  z-index: 2;
}