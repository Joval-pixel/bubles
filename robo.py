import requests
import json
import time

API_KEY = "SUA_API_KEY"

def pegar_jogos():
    url = "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all"

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    }

    res = requests.get(url, headers=headers)
    data = res.json()

    return data.get("response", [])

def calcular(stats):
    return stats["ataques"]*1 + stats["chutes"]*8 + stats["escanteios"]*2

def gerar_sinal(score, stats, minuto):

    if score > 85 and stats["chutes"] >= 5 and 20 <= minuto <= 75:
        return "🔥 ENTRAR FORTE"

    if score > 70:
        return "👀 OBSERVAR"

    return "⏳ AGUARDAR"

def montar_dados():

    jogos = pegar_jogos()

    lista = []

    for j in jogos[:5]:

        # simulando stats (API free não traz completo)
        stats = {
            "ataques": 20,
            "chutes": 5,
            "escanteios": 4
        }

        minuto = j["fixture"]["status"]["elapsed"]

        score = calcular(stats)

        lista.append({
            "jogo": j["teams"]["home"]["name"] + " x " + j["teams"]["away"]["name"],
            "liga": j["league"]["name"],
            "min": minuto,
            "score": score,
            "ataques": stats["ataques"],
            "chutes": stats["chutes"],
            "escanteios": stats["escanteios"],
            "sinal": gerar_sinal(score, stats, minuto)
        })

    with open("dados.json", "w") as f:
        json.dump(lista, f, indent=2)

while True:
    montar_dados()
    print("Atualizado com API")
    time.sleep(60)
