from api import app
import threading
from plc_reader import main as run_plc_data

if __name__ == '__main__':
    # Arranca la lectura PLC en un hilo daemon (background)
    threading.Thread(target=run_plc_data, daemon=True).start()
    

    # Arranca el servidor Flask
    app.run(host='0.0.0.0', debug=False)
