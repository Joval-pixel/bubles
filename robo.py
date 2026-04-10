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

    ataques = random.randint(10, 40)
    chutes = random.randint(1, 10)
    escanteios = random.randint(1, 10)
    posse = random.randint(40, 70)
    minuto = random.randint(10, 90)

    # 🔥 NOVO SCORE
    score = (
        ataques * 1.0 +
        chutes * 8 +
        escanteios * 2 +
        posse * 0.3
    )

    # 🎯 FILTRO INTELIGENTE
    if (
        score >= 85 and
        ataques >= 20 and
        chutes >= 5 and
        20 <= minuto <= 75
    ):
        sinal = "🔥 ENTRAR FORTE"

    elif (
        score >= 70 and
        ataques >= 15 and
        chutes >= 3 and
        15 <= minuto <= 80
    ):
        sinal = "👀 OBSERVAR"

    else:
        sinal = "⏳ AGUARDAR"

    return {
        "jogo": nome,
        "liga": liga,
        "min": minuto,
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

    print("Robô atualizado com inteligência")

    time.sleep(10)
