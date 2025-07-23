import sqlite3

DB_PATH = 'database.db' #NOMBRE DE LA BASE DE DATOS

def get_conn(): #Definimos conexión a la base de datos
    return sqlite3.connect(DB_PATH)

def create_table(): #Creamos la estructura de la tabla de la base de datos
    with get_conn() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS Statistics_APS3D (
                DeviceName TEXT,
                Date TEXT,
                TimeChargingBatt TEXT,
                AutoAndSearch TEXT,
                AutoAndOrder TEXT,
                Time_Blocked TEXT,
                Time_In_Error TEXT,
                Canceled_Tasks INTEGER,
                Movements_Completed INTEGER,
                Tasks_Completed INTEGER,
                Temp_Cabinet REAL,
                Spare_0 INTEGER, 
                Spare_1 INTEGER,
                Spare_2 INTEGER,
                Spare_3 INTEGER,
                Spare_4 INTEGER,
                Spare_5 INTEGER,
                Spare_6 INTEGER,
                Spare_7 INTEGER,
                Errors INTEGER,
                AXIS_X_Cycles INTEGER,
                AXIS_X_MoveTime TEXT,
                AXIS_X_Distance INTEGER,
                AXIS_Z_Cycles INTEGER,
                AXIS_Z_MoveTime TEXT,
                AXIS_Z_Distance INTEGER,
                AXIS_Y_Cycles INTEGER,
                AXIS_Y_MoveTime TEXT,
                AXIS_Y_Distance INTEGER,
                PRIMARY KEY (DeviceName, Date)
            )
        ''')
        conn.commit()

def insert_or_update(data): #Insertamos o actualizamos los datos
    with get_conn() as conn:
        for device, dates in data.items():
            for date, stats in dates.items():
                spare = stats["Spare"]
                engines = stats["Engines"]
                conn.execute('''
                    INSERT OR REPLACE INTO Statistics_APS3D VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    device,
                    date,
                    stats["TimeChargingBatt"],
                    stats["Auto&Search"],
                    stats["Auto&Order"],
                    stats["Time_Blocked"],
                    stats["Time_In_Error"],
                    stats["Canceled_Tasks"],
                    stats["Movements_Completed"],
                    stats["Tasks_Completed"],
                    stats["Temp_Cabinet"],
                    spare[0], spare[1], spare[2], spare[3], spare[4], spare[5], spare[6], spare[7],
                    stats["Errors"],
                    engines["AXIS_X"]["Cycles"],    # AXIS_X
                    engines["AXIS_X"]["MoveTime"],
                    engines["AXIS_X"]["Distance"],
                    engines["AXIS_Z"]["Cycles"],    # AXIS_Z
                    engines["AXIS_Z"]["MoveTime"],
                    engines["AXIS_Z"]["Distance"],
                    engines["AXIS_Y"]["Cycles"],    # AXIS_Y
                    engines["AXIS_Y"]["MoveTime"],
                    engines["AXIS_Y"]["Distance"]
                ))
        conn.commit()

def obtener_datos(maquina, fecha): #Devuelve todos los campos de la tabla para una máquina específica (maquina) en una fecha (fecha).
    with get_conn() as conn:
        cursor = conn.execute("""
            SELECT * FROM Statistics_APS3D WHERE DeviceName = ? AND Date = ?
        """, (maquina, fecha))
        fila = cursor.fetchone()
        
        if not fila:
            return None
        
        columnas = [desc[0] for desc in cursor.description]
        return dict(zip(columnas, fila))

def obtener_datos_por_fecha(fecha):#Devuelve todos los campos de la tabla para todas las máquinas que tengan datos en la fecha proporcionada.
    with get_conn() as conn:
        cursor = conn.execute("""
            SELECT * FROM Statistics_APS3D WHERE Date = ?
        """, (fecha,))
        filas = cursor.fetchall()

        if not filas:
            return None
                
        columnas = [desc[0] for desc in cursor.description]
        return [dict(zip(columnas, fila)) for fila in filas]

def obtener_filas():               #Devuelve todas las filas de la tabla   
    with get_conn() as conn:
        cursor = conn.execute("""
        SELECT DeviceName, Date,
               TimeChargingBatt, AutoAndSearch, AutoAndOrder,
               Time_Blocked, Time_In_Error,
               Canceled_Tasks, Movements_Completed, Tasks_Completed, Errors,
               AXIS_X_Distance, AXIS_Z_Distance, AXIS_Y_Distance,
               AXIS_X_MoveTime, AXIS_Y_MoveTime, AXIS_Z_MoveTime,
               AXIS_X_Cycles, AXIS_Y_Cycles, AXIS_Z_Cycles
            FROM Statistics_APS3D
        """)
        return cursor.fetchall()

