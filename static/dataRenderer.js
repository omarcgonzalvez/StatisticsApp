/* dataRenderer.js — v2
 * ---------------------------------------------------------------------------
 *  Ahora cada pantalla puede llamar a SU endpoint distinto sin duplicar lógica.
 *  ‑ Las funciones showDataXX son wrappers muy finos que:
 *       1) recogen parámetros (máquina, fechas…)
 *       2) llaman a loadData(prefix)
 *       3) delegan la pintura en renderScreen()
 * ---------------------------------------------------------------------------*/

///////////////////////////
// 1.  helpers genéricos  //
///////////////////////////

//FUNCIÓN PARA AÑADIR GRAFICA REDONDA
export function addPieChart(containerId, datos, etiquetas) {
  // Buscar el contenedor donde inyectar la gráfica
  const contenedor = document.getElementById(containerId);
  if (!contenedor) {
    console.warn(`Contenedor con id ${containerId} no encontrado`);
    return;
  }
  //LIMPIEZA PREVIA DE CANVAS NO DESEADOS
  contenedor.querySelectorAll('canvas.pieChartClass, .pieChartClass-legend')
  .forEach(el => el.remove());

  // Crear un canvas para la gráfica
  const canvas = document.createElement('canvas');
  canvas.className = 'pieChartClass';
  canvas.width = 200;
  canvas.height = 330;
  canvas.id = containerId + '-pieChartClass';

  // ①  Añádelo **dentro** del contenedor, al final de la columna
  contenedor.appendChild(canvas);      // <─ cambio aquí

  // Crear la gráfica
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: etiquetas,
      datasets: [{
        data: datos,
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b'
        ],
        hoverOffset: 10
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: true, 
                  align: 'start',
                  labels  : {
                    boxWidth : 25,
                    //padding  : 20,
                    font:{size:15}
                    }
        },
        tooltip:{
          titleFont: { size: 15 }, // título (si lo hay)
          bodyFont : { size: 15 }  // texto principal del tooltip
        }
      }
    }
  });
}

export function addContainer ({title, value}) {
  console.log(`[addContainer] Generando div con:`, {title, value});
  const div = document.createElement('div');
  div.className  = 'containerClass';
  // Si es un objeto no nulo, convertirlo a string JSON (como backup)
  const safeValue =
    (typeof value === 'object' && value !== null)
      ? JSON.stringify(value)
      : value ?? '—'; // Muestra un guión si es null o undefined

  div.textContent = `${title}: ${safeValue}`;
  return div;
}

function normalizeData(data) {
  return {
    times: [
      { title: "TIEMPO DE CARGA BATERIA", value: data.TimeChargingBatt },
      { title: "AUTO & ORDER", value: data.AutoAndOrder },
      { title: "AUTO & SEARCH", value: data.AutoAndSearch },
      { title: "TIME BLOCKED", value: data.Time_Blocked },
      { title: "TIME IN ERROR", value: data.Time_In_Error }
    ],
    orders: [
      { title: "COMPLETED TASKS", value: data.Tasks_Completed },
      { title: "CANCELED TASKS", value: data.Canceled_Tasks },
      { title: "MOVEMENTS COMPLETED", value: data.Movements_Completed },
      { title: "NUMBER OF ERRORS", value: data.Errors }
    ],
    axisMoveTime: [
      { title: "TIEMPO DESPLAZAMIENTO EJE X", value: data.AXIS_X_MoveTime },
      { title: "TIEMPO DESPLAZAMIENTO EJE Y", value: data.AXIS_Y_MoveTime },
      { title: "TIEMPO DESPLAZAMIENTO EJE Z", value: data.AXIS_Z_MoveTime }
    ],
    axisDistance: [
      { title: "DISTANCIA RECORRIDA EJE X", value: data.AXIS_X_Distance },
      { title: "DISTANCIA RECORRIDA EJE Z", value: data.AXIS_Z_Distance }
    ],
    axisCycles: [
      { title: "CICLOS REALIZADOS EJE X", value: data.AXIS_X_Cycles },
      { title: "CICLOS REALIZADOS EJE Z", value: data.AXIS_Z_Cycles },
      { title: "CICLOS REALIZADOS EJE Y", value: data.AXIS_Y_Cycles }
    ]
  };
}

  
  const CONTAINER_SUFFIX = {
    times:         'TimesContainer',
    orders:        'OrdersContainer',
    axisMoveTime:  'AxisMoveTimeContainer',
    axisDistance:  'AxisDistanceContainer',
    axisCycles:    'AxisCyclesContainer',
  };
  
  function clearContainers (screenPrefix) {
    Object.values(CONTAINER_SUFFIX).forEach(suffix => {
      const el = document.getElementById(`${screenPrefix}${suffix}`);
      if (el) el.querySelectorAll('.containerClass').forEach(n => n.remove());
    });
  }
  
  export function renderScreen (screenPrefix, data) {
    console.log(`[renderScreen] Redibujando ${screenPrefix}`);
    console.log(`[renderScreen] Data:`, data);
  
    clearContainers(screenPrefix);
  
    Object.entries(CONTAINER_SUFFIX).forEach(([key, suffix]) => {
      const container = document.getElementById(`${screenPrefix}${suffix}`);
      if (!container) {
        console.warn(`[renderScreen] Contenedor no encontrado: ${screenPrefix}${suffix}`);
        return;
      }
      if (!Array.isArray(data[key])) {
        console.warn(`[renderScreen] No hay datos para ${key}`, data[key]);
        return;
      }
  
      console.log(`[renderScreen] Pintando ${data[key].length} elementos en ${key}`);
  
      data[key].forEach(item => container.appendChild(addContainer(item)));
    });
  }
  
  
  ///////////////////////////////////////////////////////
  // 2.  Config de endpoints y recogida de parámetros  //
  ///////////////////////////////////////////////////////
  
  /* 1‑a   Mapa pantalla → endpoint  */
  const ENDPOINTS = {
    screen2: '/api/datos',
    screen3: '/api/diferencia',
    screen4: '/api/datos_por_fecha',
    screen5: '/api/diferencia',
    screen6: '/api/datos_por_fecha',
    screen7: '/api/diferencia',
  };
  
  /* 1‑b   Recoge máquina y fechas de la UI (si existen) */
  function collectParams(screenPrefix) {
    const root = document.getElementById(`${screenPrefix}Id`);
    if (!root) return {};

    const q = {};
    const sel = root.querySelector('.comboBoxClass');
    if (sel) {
      q.maquina = sel.value;

      // Verifica si el listener ya está registrado
      if (!sel.dataset.listenerAdded) {
        sel.addEventListener('change', () => {
          loadData(screenPrefix).then(data => renderScreen(screenPrefix, data));
        });
        sel.dataset.listenerAdded = true; // Marca el listener como agregado
      }
    }

    const start = root.querySelector('[data-role="start"]');
    const end = root.querySelector('[data-role="end"]');

    if (start) {
      q.from = start.value;

      // Verifica si el listener ya está registrado
      if (!start.dataset.listenerAdded) {
        start.addEventListener('change', () => {
          loadData(screenPrefix).then(data => renderScreen(screenPrefix, data));
        });
        start.dataset.listenerAdded = true; // Marca el listener como agregado
      }
    }

    if (end) {
      q.to = end.value;

      // Verifica si el listener ya está registrado
      if (!end.dataset.listenerAdded) {
        end.addEventListener('change', () => {
          loadData(screenPrefix).then(data => renderScreen(screenPrefix, data));
        });
        end.dataset.listenerAdded = true; // Marca el listener como agregado
      }
    }

    // Si no hay ni start ni end, busca fecha simple
    if (!start && !end) {
      const singleDate = root.querySelector('input.datetimeInputClass[type="datetime-local"]');
      if (singleDate) {
        q.fecha = singleDate.value;

        // Verifica si el listener ya está registrado
        if (!singleDate.dataset.listenerAdded) {
          singleDate.addEventListener('change', () => {
            loadData(screenPrefix).then(data => renderScreen(screenPrefix, data));
          });
          singleDate.dataset.listenerAdded = true; // Marca el listener como agregado
        }
      }
    }
    console.log(`[collectParams] ${screenPrefix}:`, q); // Depuración: muestra los parámetros recogidos
    return q;
  }
  
  ///////////////////////////////////////////////////////
  // 3.  Capa de acceso a datos                        //
  ///////////////////////////////////////////////////////
  
  async function loadData (screenPrefix, fallback = {}) {
    const endpoint = ENDPOINTS[screenPrefix];
    if (!endpoint) return fallback;
  
    const params = collectParams(screenPrefix);
    const qs     = new URLSearchParams(params).toString();
  
    try {
      const rsp = await fetch(`${endpoint}?${qs}`);
      if (!rsp.ok)   throw new Error(`${rsp.status}`);
      const json = await rsp.json();
      console.log(`[loadData] ${screenPrefix}:`, json); // Depuración: muestra los datos obtenidos
      const normalizedData = normalizeData(json);
      return normalizedData;
    } catch (err) {
      console.error(`[dataRenderer] ${endpoint} falló:`, err);
      return fallback;                 // fallback (mock) si algo va mal
    }
  }
  
  /////////////////////////////////////////////
  // 4.  Datos de ejemplo (mock) – opcional  //
  /////////////////////////////////////////////
  
  const datos1 = 3, datos2 = 4, datos3 = 5, datos4 = 10, datos5 = 32, datos6 = 102;
  const plantilla = {
    orders:       ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'],
    axisMoveTime: ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'],
    axisDistance: ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'],
    axisCycles:   ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE Y: 367'],
  };
  const dummyData = prefix => ({
    ...plantilla,
    times: [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${prefix === 'screen2' ? datos5 : datos6} horas`],
  });

  /////////////////////////////////////////////
  // 5.  showData «finas»                    //
  /////////////////////////////////////////////
  
  export async function showDataResumen          () { const data = await loadData('screen2', dummyData('screen2'));  renderScreen('screen2', data); 
    addPieChart('screen2TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
    'TimeChargingBatt',
    'AutoAndSearch',
    'AutoAndOrder',
    'Time_Blocked',
    'Time_In_Error'
    ]);
    addPieChart('screen2OrdersContainer', [100, 100, 100, 100], 
      [
        'Completed Tasks',
        'Canceled Tasks',
        'Movements Completed',
        'Number of Errors'
    ]);
    addPieChart('screen2AxisMoveTimeContainer', [100, 100, 100], 
      [
        'Axis X Movetime',
        'Axis Z Movetime',
        'Axis Y Movetime'
    ]);
    addPieChart('screen2AxisDistanceContainer', [100, 200], 
      [
        'Axis X Distance',
        'Axis Z Distance'
    ]);
    addPieChart('screen2AxisCyclesContainer', [100, 200, 300], 
      [
        'Axis X Cycles',
        'Axis Z Cycles',
        'Axis Y Cycles'
    ]);
  }
  export async function showDataFiltrarPorFecha  () { const data = await loadData('screen3', dummyData('screen3'));  renderScreen('screen3', data); 
    addPieChart('screen3TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
      'TimeChargingBatt',
      'AutoAndSearch',
      'AutoAndOrder',
      'Time_Blocked',
      'Time_In_Error'
      ]);
      addPieChart('screen3OrdersContainer', [100, 100, 100, 100], 
        [
          'Completed Tasks',
          'Canceled Tasks',
          'Movements Completed',
          'Number of Errors'
      ]);
      addPieChart('screen3AxisMoveTimeContainer', [100, 100, 100], 
        [
          'Axis X Movetime',
          'Axis Z Movetime',
          'Axis Y Movetime'
      ]);
      addPieChart('screen3AxisDistanceContainer', [100, 200], 
        [
          'Axis X Distance',
          'Axis Z Distance'
      ]);
      addPieChart('screen3AxisCyclesContainer', [100, 200, 300], 
        [
          'Axis X Cycles',
          'Axis Z Cycles',
          'Axis Y Cycles'
      ]);
    }
  export async function showDataTotal            () { const data = await loadData('screen4', dummyData('screen4'));  renderScreen('screen4', data); 
    addPieChart('screen4TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
      'TimeChargingBatt',
      'AutoAndSearch',
      'AutoAndOrder',
      'Time_Blocked',
      'Time_In_Error'
      ]);
      addPieChart('screen4OrdersContainer', [100, 100, 100, 100], 
        [
          'Completed Tasks',
          'Canceled Tasks',
          'Movements Completed',
          'Number of Errors'
      ]);
      addPieChart('screen4AxisMoveTimeContainer', [100, 100, 100], 
        [
          'Axis X Movetime',
          'Axis Z Movetime',
          'Axis Y Movetime'
      ]);
      addPieChart('screen4AxisDistanceContainer', [100, 200], 
        [
          'Axis X Distance',
          'Axis Z Distance'
      ]);
      addPieChart('screen4AxisCyclesContainer', [100, 200, 300], 
        [
          'Axis X Cycles',
          'Axis Z Cycles',
          'Axis Y Cycles'
      ]);
    }
  export async function showDataTotalFiltrar     () { const data = await loadData('screen5', dummyData('screen5'));  renderScreen('screen5', data); 
    addPieChart('screen5TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
      'TimeChargingBatt',
      'AutoAndSearch',
      'AutoAndOrder',
      'Time_Blocked',
      'Time_In_Error'
      ]);
      addPieChart('screen5OrdersContainer', [100, 100, 100, 100], 
        [
          'Completed Tasks',
          'Canceled Tasks',
          'Movements Completed',
          'Number of Errors'
      ]);
      addPieChart('screen5AxisMoveTimeContainer', [100, 100, 100], 
        [
          'Axis X Movetime',
          'Axis Z Movetime',
          'Axis Y Movetime'
      ]);
      addPieChart('screen5AxisDistanceContainer', [100, 200], 
        [
          'Axis X Distance',
          'Axis Z Distance'
      ]);
      addPieChart('screen5AxisCyclesContainer', [100, 200, 300], 
        [
          'Axis X Cycles',
          'Axis Z Cycles',
          'Axis Y Cycles'
      ]);
    }
  export async function showDataPromedios        () { const data = await loadData('screen6', dummyData('screen6'));  renderScreen('screen6', data); 
    addPieChart('screen6TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
      'TimeChargingBatt',
      'AutoAndSearch',
      'AutoAndOrder',
      'Time_Blocked',
      'Time_In_Error'
      ]);
      addPieChart('screen6OrdersContainer', [100, 100, 100, 100], 
        [
          'Completed Tasks',
          'Canceled Tasks',
          'Movements Completed',
          'Number of Errors'
      ]);
      addPieChart('screen6AxisMoveTimeContainer', [100, 100, 100], 
        [
          'Axis X Movetime',
          'Axis Z Movetime',
          'Axis Y Movetime'
      ]);
      addPieChart('screen6AxisDistanceContainer', [100, 200], 
        [
          'Axis X Distance',
          'Axis Z Distance'
      ]);
      addPieChart('screen6AxisCyclesContainer', [100, 200, 300], 
        [
          'Axis X Cycles',
          'Axis Z Cycles',
          'Axis Y Cycles'
      ]);
    }
  export async function showDataPromediosFiltrar () { const data = await loadData('screen7', dummyData('screen7'));  renderScreen('screen7', data); 
    addPieChart('screen7TimesContainer', [datos1, datos2, datos3, datos4, datos5], [
      'TimeChargingBatt',
      'AutoAndSearch',
      'AutoAndOrder',
      'Time_Blocked',
      'Time_In_Error'
      ]);
      addPieChart('screen7OrdersContainer', [100, 100, 100, 100], 
        [
          'Completed Tasks',
          'Canceled Tasks',
          'Movements Completed',
          'Number of Errors'
      ]);
      addPieChart('screen7AxisMoveTimeContainer', [100, 100, 100], 
        [
          'Axis X Movetime',
          'Axis Z Movetime',
          'Axis Y Movetime'
      ]);
      addPieChart('screen7AxisDistanceContainer', [100, 200], 
        [
          'Axis X Distance',
          'Axis Z Distance'
      ]);
      addPieChart('screen7AxisCyclesContainer', [100, 200, 300], 
        [
          'Axis X Cycles',
          'Axis Z Cycles',
          'Axis Y Cycles'
      ]);
    }
