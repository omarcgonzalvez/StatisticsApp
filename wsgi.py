from api import app
import threading
from plc_reader import main as run_plc_data

# Arranca la lectura PLC en background al iniciar la app
threading.Thread(target=run_plc_data, daemon=True).start()

# WSGI expone el objeto `app` para Gunicorn
# Gunicorn no ejecuta __main__, simplemente importa este archivo
