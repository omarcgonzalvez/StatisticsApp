import sqlite3

DB_PATH = 'database.db'

def get_conn():
    return sqlite3.connect(DB_PATH)

def create_table():
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

def insert_or_update(data):
    with get_conn() as conn:
        for device, dates in data.items():
            for date, stats in dates.items():
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
                    stats["Errors"],
                    engines["AXIS_X"]["Cycles"],
                    engines["AXIS_X"]["MoveTime"],
                    engines["AXIS_X"]["Distance"],
                    engines["AXIS_Z"]["Cycles"],
                    engines["AXIS_Z"]["MoveTime"],
                    engines["AXIS_Z"]["Distance"],
                    engines["AXIS_Y"]["Cycles"],
                    engines["AXIS_Y"]["MoveTime"],
                    engines["AXIS_Y"]["Distance"]
                ))

def obtener_datos(maquina, fecha):
    with get_conn() as conn:
        cursor = conn.execute("""
            SELECT * FROM Statistics_APS3D WHERE DeviceName = ? AND Date = ?
        """, (maquina, fecha))
        fila = cursor.fetchone()
        if not fila:
            return None
        columnas = [desc[0] for desc in cursor.description]
        return dict(zip(columnas, fila))

def obtener_filas():
    with get_conn() as conn:
        cursor = conn.execute("SELECT * FROM Statistics_APS3D")
        return cursor.fetchall()
