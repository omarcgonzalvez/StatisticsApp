from flask import Flask, render_template, request, jsonify
from db import obtener_datos, obtener_filas
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/datos')
def api_datos():
    maquina = request.args.get('maquina')
    fecha = request.args.get('fecha')

    if not maquina or not fecha:
        return jsonify({'error': 'Parámetros requeridos: maquina y fecha'}), 400

    datos = obtener_datos(maquina, fecha)

    if not datos:
        return jsonify({'error': 'No se encontraron datos'}), 404

    return jsonify(datos)

@app.route('/api/kpis_por_fecha')
def api_kpis_por_fecha():
    fecha = request.args.get('fecha')
    if not fecha:
        return jsonify({'error': 'Parámetro "fecha" requerido'}), 400

    conn = obtener_filas()
    # Aquí el código que tenías para filtrar y responder con KPIs agrupados

    # Lo dejo como antes:
    conn = obtener_filas()
    # Filtra por fecha, crea resultado y retorna JSON...
    # (Puedes copiar el código original y adaptarlo aquí)

# Funciones auxiliares para api_diferencia (puedes mover a utils.py si quieres)
def convertir_a_segundos(valor):
    if isinstance(valor, str) and ":" in valor:
        try:
            h, m, s = map(int, valor.split(":"))
            return h * 3600 + m * 60 + s
        except:
            return 0
    try:
        return float(valor)
    except:
        return 0

def segundos_a_hhmmss(segundos):
    segundos = int(round(segundos))
    horas = segundos // 3600
    minutos = (segundos % 3600) // 60
    segundos = segundos % 60
    return f"{horas:02}:{minutos:02}:{segundos:02}"

@app.route('/api/diferencia')
def api_diferencia():
    fecha_inicial_str = request.args.get('fecha_inicial')
    fecha_final_str = request.args.get('fecha_final')

    if not fecha_inicial_str or not fecha_final_str:
        return jsonify({'error': 'Parámetros requeridos: fecha_inicial y fecha_final'}), 400

    try:
        fecha_inicial = datetime.fromisoformat(fecha_inicial_str)
        fecha_final = datetime.fromisoformat(fecha_final_str)
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Usa ISO: YYYY-MM-DDTHH:MM'}), 400

    filas = obtener_filas()

    if not filas:
        return jsonify({'error': 'No se encontraron datos'}), 404

    diferencias = calcular_diferencias(filas, fecha_inicial, fecha_final)

    if not diferencias:
        return jsonify({'error': 'No hay datos suficientes para calcular diferencias'}), 404

    return jsonify(diferencias)

# Puedes copiar la función calcular_diferencias tal cual del original aquí o moverla a utils.py

def calcular_diferencias(filas, fecha_ini_dt, fecha_fin_dt):
    # copia aquí la lógica de calcular_diferencias (igual que tu código original)
    pass  # reemplaza con el código

