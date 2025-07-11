import snap7
from snap7.util import get_byte, get_dint, get_udint, get_int
from datetime import datetime
import time
from db import insert_or_update, create_table

def ms_to_hms(ms):
    total_seconds = ms // 1000
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    s = total_seconds % 60
    return f"{h:02}:{m:02}:{s:02}"

def s_to_hms(seconds):
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02}:{m:02}:{s:02}"

def mm_to_m(mm):
    return mm / 1000.0

def leer_un_elemento(db_bytes, offset):
    Year = get_int(db_bytes, offset + 0)
    Month = get_udint(db_bytes, offset + 2)
    Day = get_byte(db_bytes, offset + 6)
    Hour = get_int(db_bytes, offset + 8)
    Min = get_int(db_bytes, offset + 10)
    
    TimeChargingBatt = get_dint(db_bytes, offset + 12)
    AutoSearch = get_dint(db_bytes, offset + 16)
    AutoOrder = get_dint(db_bytes, offset + 20)
    TimeBlocked = get_dint(db_bytes, offset + 24)
    TimeInError = get_dint(db_bytes, offset + 28)

    CanceledTasks = get_dint(db_bytes, offset + 32)
    MovementsCompleted = get_dint(db_bytes, offset + 36)
    TasksCompleted = get_dint(db_bytes, offset + 40)

    Errors = get_int(db_bytes, offset + 44)

    Engines = {}
    axis_names = ["AXIS_X", "AXIS_Z", "AXIS_Y"]
    for i in range(3):
        base = offset + 46 + i * 12
        Cycles = get_dint(db_bytes, base)
        MoveTime = get_udint(db_bytes, base + 4)
        Distance = get_dint(db_bytes, base + 8)
        axis = axis_names[i]
        Engines[axis] = {
            "Cycles": Cycles,
            "MoveTime": s_to_hms(MoveTime),
            "Distance": mm_to_m(Distance)
        }

    return {
        "date": f"{Year}-{Month:02}-{Day:02}T{Hour:02}:{Min:02}",
        "TimeChargingBatt": ms_to_hms(TimeChargingBatt),
        "Auto&Search": ms_to_hms(AutoSearch),
        "Auto&Order": ms_to_hms(AutoOrder),
        "Time_Blocked": ms_to_hms(TimeBlocked),
        "Time_In_Error": ms_to_hms(TimeInError),
        "Canceled_Tasks": CanceledTasks,
        "Movements_Completed": MovementsCompleted,
        "Tasks_Completed": TasksCompleted,
        "Errors": Errors,
        "Engines": Engines
    }

def main():
    create_table()
    while True:
        plc = snap7.client.Client()
        try:
            plc.connect('192.168.2.13', 0, 1)
            num_elementos = 10   #numero de APS3D STATISTICS ARRAYS (NUMERO DE APS3D QUE HAY)
            elemento_size = 82  #TAMAÑO DE ARRAY DE DATOSS
            total_length = elemento_size * num_elementos

            db_bytes = plc.db_read(86, 0, total_length)

            data_for_db = {}
            for i in range(num_elementos):
                offset = i * elemento_size
                datos = leer_un_elemento(db_bytes, offset)
                device_name = f"Statistics_APS3D[{i+1}]"
                fecha = datos.pop("date")
                if device_name not in data_for_db:
                    data_for_db[device_name] = {}
                data_for_db[device_name][fecha] = datos

                print(f"\nDatos de {device_name}:")
                for k, v in datos.items():
                    print(f"{k}: {v}")

            insert_or_update(data_for_db)
            print(f"\n✅ Datos insertados/actualizados en la base de datos. ({datetime.now().strftime('%H:%M:%S')})")

        except Exception as e:
            print("❌ Error al conectar o leer:", e)

        finally:
            plc.disconnect()

        time.sleep(10)
