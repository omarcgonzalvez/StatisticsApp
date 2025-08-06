import snap7
from snap7.util import get_byte, get_dint, get_udint, get_int
from datetime import datetime
import time, struct
from db import insert_or_update, create_table

def ieee_754_to_float(value):   #Conversión de IEEE 754 a FLOAT
    """
    Convierte un valor en formato IEEE 754 a un número de punto flotante.
    Redondea el resultado a 1 decimal.
    """
    return round((struct.unpack('!f', struct.pack('!I', value))[0]), 1)

def ms_to_hms(ms):              #Conversión MILISEGUNDOS A HORAS:MINUTOS:SEGUNDOS
    total_seconds = ms // 1000
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    s = total_seconds % 60
    return f"{h:02}:{m:02}:{s:02}"

def s_to_hms(seconds):          #Conversión SEGUNDOS A HORAS:MINUTOS:SEGUNDOS
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02}:{m:02}:{s:02}"

def mm_to_m(mm):                #Conversión MILIMETROS A METROS
    return mm / 1000.0

def leer_un_elemento(db_bytes, offset):     #Función para leer los valores del DB del PLC y devolverlo en un diccionario
    # Leer fecha y hora
    Year = get_int(db_bytes, offset + 0)
    Month = get_udint(db_bytes, offset + 2)
    Day = get_byte(db_bytes, offset + 6)
    Hour = get_int(db_bytes, offset + 8)
    Min = get_int(db_bytes, offset + 10)
    
    # Leer tiempos
    TimeChargingBatt = get_dint(db_bytes, offset + 12)
    AutoSearch = get_dint(db_bytes, offset + 16)
    AutoOrder = get_dint(db_bytes, offset + 20)
    TimeBlocked = get_dint(db_bytes, offset + 24)
    TimeInError = get_dint(db_bytes, offset + 28)

    # Contadores de tareas
    CanceledTasks = get_dint(db_bytes, offset + 32)
    MovementsCompleted = get_dint(db_bytes, offset + 36)
    TasksCompleted = get_dint(db_bytes, offset + 40)
    # Nueva variable Temp_Cabinet
    Temp_Cabinet = get_dint(db_bytes, offset + 44)
    # Leer los Spare
    Spare = [get_dint(db_bytes, offset + 48 + i * 4) for i in range(8)]

    Errors = get_int(db_bytes, offset + 80)

    Engines = {}     # Leer datos específicos por eje (Axis X, Z, Y)
    axis_names = ["AXIS_X", "AXIS_Z", "AXIS_Y"]
    for i in range(3):
        base = offset + 82 + i * 12     # Cada eje ocupa 12 bytes consecutivos
        Cycles = get_dint(db_bytes, base)
        MoveTime = get_udint(db_bytes, base + 4)
        Distance = get_dint(db_bytes, base + 8)
        axis = axis_names[i]
        Engines[axis] = {
            "Cycles": Cycles,
            "MoveTime": s_to_hms(MoveTime),
            "Distance": mm_to_m(Distance)
        }

    return {     # Retorna todos los datos extraídos como un diccionario con formato
        "date": f"{Year}-{Month:02}-{Day:02}T{Hour:02}:{Min:02}",
        "TimeChargingBatt": ms_to_hms(TimeChargingBatt),
        "Auto&Search": ms_to_hms(AutoSearch),
        "Auto&Order": ms_to_hms(AutoOrder),
        "Time_Blocked": ms_to_hms(TimeBlocked),
        "Time_In_Error": ms_to_hms(TimeInError),
        "Canceled_Tasks": CanceledTasks,
        "Movements_Completed": MovementsCompleted,
        "Tasks_Completed": TasksCompleted,
        "Temp_Cabinet": ieee_754_to_float(Temp_Cabinet),  # Nueva variable
        "Spare": Spare,             # Lista de valores Spare
        "Errors": Errors,
        "Engines": Engines
    }

def main(): # MAIN
    create_table()       # Asegura que la tabla en la base de datos exista (la crea si no)
    while True:          # Bucle infinito para leer datos periódicamente
        plc = snap7.client.Client()        # Crear cliente para comunicarse con el PLC
        try:
            plc.connect('192.168.2.13', 0, 1)   #PLC en IP y rack/slot indicados
            num_elementos = 10   #Numero de APS3D STATISTICS ARRAYS (NUMERO DE APS3D QUE HAY)
            elemento_size = 118  #TAMAÑO DE ARRAY DE DATOSS
            total_length = elemento_size * num_elementos    # Total bytes a leer

            db_bytes = plc.db_read(86, 0, total_length)     # Leer bloque de bytes desde DB 86, offset 0

            data_for_db = {}    # Diccionario para almacenar datos organizados por dispositivo y fecha
            for i in range(num_elementos):
                offset = i * elemento_size  # Offset para cada bloque de datos
                datos = leer_un_elemento(db_bytes, offset)  # Extraer datos legibles de los bytes
                device_name = f"Statistics_APS3D[{i+1}]"    # Nombre del dispositivo basado en índice
                fecha = datos.pop("date")                   # Extraer la fecha y eliminarla del diccionario datos

                # Organizar datos dentro del diccionario: por dispositivo y fecha
                if device_name not in data_for_db:
                    data_for_db[device_name] = {}
                data_for_db[device_name][fecha] = datos

                # Mostrar por consola los datos leídos de cada dispositivo
                print(f"\nDatos de {device_name}:")
                for k, v in datos.items():
                    print(f"{k}: {v}")

            # Insertar o actualizar la base de datos con los datos recopilados
            insert_or_update(data_for_db)
            print(f"\n✅ Datos insertados/actualizados en la base de datos. ({datetime.now().strftime('%H:%M:%S')})")

        except Exception as e:
            # En caso de error en conexión o lectura, mostrar mensaje
            print("❌ Error al conectar o leer:", e)

        finally:
            plc.disconnect()    # Siempre desconectar del PLC para liberar recursos

        time.sleep(10)          # Esperar 10 segundos antes de la siguiente lectura
