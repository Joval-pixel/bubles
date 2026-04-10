import json
import random
import time

def gerar_jogo():
    jogos = [
        ("Flamengo x Palmeiras", "Brasil"),
        ("Real Madrid x Barcelona", "La Liga"),
        ("City x Liverpool", "Premier League"),
        ("PSG x Bayern", "Champions")
    ]

    nome, liga = random.choice(jogos)

    ataques = random.randint(10,40)
    chutes = random.randint(1,10)
    escanteios = random.randint(1,10)
    min = random.randint(20,80)

    score = ataques*0.9 + chutes*6 + escanteios*2

    if score > 80:
        sinal = "🔥 ENTRAR"
    elif score > 60:
        sinal = "👀 OBSERVAR"
    else:
        sinal = "⏳ AGUARDAR"

    return {
        "jogo": nome,
        "liga": liga,
        "min": min,
        "score": int(score),
        "ataques": ataques,
        "chutes": chutes,
        "escanteios": escanteios,
        "sinal": sinal
    }

while True:

    dados = [gerar_jogo() for _ in range(4)]

    with open("dados.json", "w") as f:
        json.dump(dados, f, indent=2)

    print("Atualizado!")

    time.sleep(10)
