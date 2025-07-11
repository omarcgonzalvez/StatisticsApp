from flask import Flask, render_template, request, jsonify
from db import obtener_datos, obtener_filas, obtener_datos_por_fecha
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)

@app.route('/') #RUTA INICIAL
def index():
    return render_template('index.html')

###################
#### API DATOS #### DEVUELVE TODOS LOS CAMPOS ==> 1 SOLA MAQUINA + 1 SOLA FECHA
###################
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

#############################
#### API DATOS POR FECHA #### DEVUELVE TODOS LOS CAMPOS PARA TODAS LAS MAQUINAS EN UNA FECHA
#############################

@app.route('/api/datos_por_fecha')
def api_datos_por_fecha():
    fecha = request.args.get('fecha')
    if not fecha:
        return jsonify({'error': 'Parámetro "fecha" requerido'}), 400

    filas = obtener_datos_por_fecha(fecha)

    if not filas:
        return jsonify({'error': 'No se encontraron datos'}), 404

    # Agrupar por DeviceName
    datos_por_maquina = {row['DeviceName']: row for row in filas}
    return jsonify(datos_por_maquina)


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

#############################
#### API DIFERENCIA      #### DEVUELVE YA FILTRADOS TODOS LOS CAMPOS PARA TODAS LAS MAQUINAS 
############################# ENTRE UNA FECHA INICIAL Y UNA FECHA FINAL. TODOS LOS DATOS ENTRE ESAS FECHAS

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


def calcular_diferencias(filas, fecha_ini_dt, fecha_fin_dt):
    from collections import defaultdict

    datos_por_dispositivo = defaultdict(list)

    for fila in filas:
        device = fila[0]
        fecha_dt = datetime.fromisoformat(fila[1])
        datos = fila[2:]
        datos_por_dispositivo[device].append((fecha_dt, datos))

    campos = [
        "TimeChargingBatt", "AutoAndSearch", "AutoAndOrder",
        "Time_Blocked", "Time_In_Error",
        "Canceled_Tasks", "Movements_Completed", "Tasks_Completed", "Errors",
        "AXIS_X_Distance", "AXIS_Z_Distance", "AXIS_Y_Distance",
        "AXIS_X_MoveTime", "AXIS_Y_MoveTime", "AXIS_Z_MoveTime",
        "AXIS_X_Cycles", "AXIS_Y_Cycles", "AXIS_Z_Cycles"
    ]

    campos_tiempo = {
        "TimeChargingBatt", "AutoAndSearch", "AutoAndOrder",
        "Time_Blocked", "Time_In_Error",
        "AXIS_X_MoveTime", "AXIS_Y_MoveTime", "AXIS_Z_MoveTime"
    }

    diferencias = {}

    for device, registros in datos_por_dispositivo.items():
        registros_ordenados = sorted(registros, key=lambda x: x[0])

        # CASO MISMO DÍA
        if fecha_ini_dt.date() == fecha_fin_dt.date():
            val_inicio = None
            val_final = None
            for dt, valores in registros_ordenados:
                if dt == fecha_ini_dt:
                    val_inicio = valores
                elif dt == fecha_fin_dt:
                    val_final = valores
            if not (val_inicio and val_final):
                continue  # no suficientes datos para este dispositivo
            diferencia = {}
            for i, campo in enumerate(campos):
                ini = convertir_a_segundos(val_inicio[i])
                fin = convertir_a_segundos(val_final[i])
                total = fin - ini
                total = max(total, 0)  # evitar negativos
                if campo in campos_tiempo:
                    diferencia[campo] = segundos_a_hhmmss(total)
                else:
                    diferencia[campo] = int(round(total))
            diferencias[device] = diferencia
            continue

        # CASO FECHAS DIFERENTES (lógica original)
        val_inicio = val_max_ini = val_final = None
        intermedios_por_dia = defaultdict(lambda: [0] * len(campos))

        for dt, valores in registros_ordenados:
            if dt == fecha_ini_dt:
                val_inicio = valores
            elif dt.date() == fecha_ini_dt.date():
                if not val_max_ini:
                    val_max_ini = valores
                else:
                    val_max_ini = [
                        valores[i] if convertir_a_segundos(valores[i]) > convertir_a_segundos(val_max_ini[i])
                        else val_max_ini[i]
                        for i in range(len(campos))
                    ]
            elif fecha_ini_dt.date() < dt.date() < fecha_fin_dt.date():
                dia = dt.date()
                for i in range(len(campos)):
                    valor_actual = convertir_a_segundos(valores[i])
                    if valor_actual > intermedios_por_dia[dia][i]:
                        intermedios_por_dia[dia][i] = valor_actual
            elif dt == fecha_fin_dt:
                val_final = valores

        if not (val_inicio and val_max_ini and val_final):
            continue

        intermedios_sumados = [0] * len(campos)
        for valores_dia in intermedios_por_dia.values():
            for i in range(len(campos)):
                intermedios_sumados[i] += valores_dia[i]

        diferencia = {}
        for i, campo in enumerate(campos):
            ini = convertir_a_segundos(val_inicio[i])
            max_ini = convertir_a_segundos(val_max_ini[i])
            fin = convertir_a_segundos(val_final[i])
            total = (max_ini - ini) + intermedios_sumados[i] + fin

            if campo in campos_tiempo:
                diferencia[campo] = segundos_a_hhmmss(total)
            else:
                diferencia[campo] = int(round(total))

        diferencias[device] = diferencia

    return diferencias
