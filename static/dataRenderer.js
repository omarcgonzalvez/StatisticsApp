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

  // Limpieza previa de canvas no deseados
  contenedor.querySelectorAll('canvas.pieChartClass, .pieChartClass-legend')
    .forEach(el => el.remove());

  // Crear un canvas para la gráfica
  const canvas = document.createElement('canvas');
  canvas.className = 'pieChartClass';
  canvas.width = 200;
  canvas.height = 330;
  canvas.id = containerId + '-pieChartClass';

  // Añádelo dentro del contenedor
  contenedor.appendChild(canvas);

  // Crear la gráfica
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: etiquetas, // Etiquetas originales
      datasets: [{
        data: datos, // Datos numéricos
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
        legend: {
          display: true,
          align: 'start',
          labels: {
            boxWidth: 25,
            font: { size: 15 }
          }
        },
        tooltip: {
          titleFont: {
            size: 16, // Tamaño de la fuente del título
            weight: 'bold' // Negrita para el título
          },
          bodyFont: {
            size: 16, // Tamaño de la fuente del cuerpo
            weight: 'bold' // Negrita para el cuerpo
          },
          padding: 10, // Espaciado interno del tooltip
          boxPadding: 5, // Espaciado adicional alrededor del tooltip
          callbacks: {
            label: function(tooltipItem) {
              const dataset = tooltipItem.dataset;
              const total = dataset.data.reduce((acc, val) => acc + val, 0);
              const value = dataset.data[tooltipItem.dataIndex];
              const porcentaje = ((value / total) * 100).toFixed(2);

              // Si el contenedor es de tiempos, mostrar en formato HH:MM:SS
              if (containerId.includes('TimesContainer') || containerId.includes('AxisMoveTimeContainer')) {
                const tiempoHHMMSS = convertirSegundosAHHMMSS(value);
                return `${tiempoHHMMSS} (${porcentaje}%)`;
              }

              // Para otros contenedores, mostrar el valor original
              return `${value} (${porcentaje}%)`;
            }
          }
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
    screen4: '/api/totales_por_fecha',
    screen5: '/api/totales_diferencia',
    screen6: '/api/promedios_por_fecha',
    screen7: '/api/promedios_diferencia',
  };
  
  /* 1‑b   Recoge máquina y fechas de la UI (si existen) */
  function collectParams(screenPrefix) {
    const root = document.getElementById(`${screenPrefix}Id`);
    if (!root) return {};
  
    const q = {};
    const sel = root.querySelector('.comboBoxClass');
    if (sel) {
      q.maquina = sel.value;
    }
  
    const start = root.querySelector('[data-role="start"]');
    const end = root.querySelector('[data-role="end"]');
  
    if (start) {
      q.fecha_inicial = start.value;
    }
  
    if (end) {
      q.fecha_final = end.value;
    }
  
    // Si no hay ni start ni end, busca fecha simple
    if (!start && !end) {
      const singleDate = root.querySelector('input.datetimeInputClass[type="datetime-local"]');
      if (singleDate) {
        q.fecha = singleDate.value;
      }
    }
  
    console.log(`[collectParams] ${screenPrefix}:`, q); // Depuración: muestra los parámetros recogidos
    return q;
  }
  
  ///////////////////////////////////////////////////////
  // 3.  Capa de acceso a datos                        //
  ///////////////////////////////////////////////////////
  
  async function loadData(screenPrefix, fallback = {}) {
    const endpoint = ENDPOINTS[screenPrefix];
    if (!endpoint) return fallback;
  
    const params = collectParams(screenPrefix);
    const qs = new URLSearchParams(params).toString();
  
    try {
      const rsp = await fetch(`${endpoint}?${qs}`);
      if (!rsp.ok) {
        if (rsp.status === 400) {
          alert("HTTP Request Error 400 (BAD REQUEST): The request is invalid. Please check the input data and try again.");
        } else if (rsp.status === 404) {
          alert("HTTP Request Error 404 (NOT FOUND): No data found for the given request.");
        }
        throw new Error(`${rsp.status}`);
      }
      const json = await rsp.json();
      console.log(`[loadData] ${screenPrefix}:`, json); // Depuración: muestra los datos obtenidos
      const normalizedData = normalizeData(json);
      return normalizedData;
    } catch (err) {
      console.error(`[dataRenderer] ${endpoint} falló:`, err);
      return fallback; // fallback (mock) si algo va mal
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
  const titleArray = {
    times: ['TimeChargingBatt', 'AutoAndSearch', 'AutoAndOrder', 'Time_Blocked', 'Time_In_Error'],
    orders: ['Tasks_Completed', 'Canceled_Tasks', 'Movements_Completed', 'Errors'],
    axisMoveTime: ['AXIS_X_MoveTime', 'AXIS_Z_MoveTime', 'AXIS_Y_MoveTime'],
    axisDistance: ['AXIS_X_Distance', 'AXIS_Z_Distance'],
    axisCycles: ['AXIS_X_Cycles', 'AXIS_Z_Cycles', 'AXIS_Y_Cycles']
  };

  function convertirATiempoEnSegundos(hhmmss) {
    if (typeof hhmmss !== 'string' || !hhmmss.includes(':')) return 0;
  
    const [horas, minutos, segundos] = hhmmss.split(':').map(Number);
    return (horas * 3600) + (minutos * 60) + segundos;
  }

  function convertirSegundosAHHMMSS(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  }
  
  export async function showDataResumen() {
    const data = await loadData('screen2', dummyData('screen2')); // Carga los datos reales o ficticios
    renderScreen('screen2', data); // Actualiza los contenedores


    addPieChart('screen2TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen2OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen2AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen2AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen2AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }
  
  export async function showDataFiltrarPorFecha() {
    const data = await loadData('screen3', dummyData('screen3'));
    renderScreen('screen3', data);
  

    addPieChart('screen3TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen3OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen3AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen3AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen3AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }
  
  export async function showDataTotal() {
    const data = await loadData('screen4', dummyData('screen4'));
    renderScreen('screen4', data);
  

    addPieChart('screen4TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen4OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen4AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen4AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen4AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }
  
  export async function showDataTotalFiltrar() {
    const data = await loadData('screen5', dummyData('screen5'));
    renderScreen('screen5', data);
  

    addPieChart('screen5TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen5OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen5AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen5AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen5AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }
  
  export async function showDataPromedios() {
    const data = await loadData('screen6', dummyData('screen6'));
    renderScreen('screen6', data);
  

    addPieChart('screen6TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen6OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen6AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen6AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen6AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }
  
  export async function showDataPromediosFiltrar() {
    const data = await loadData('screen7', dummyData('screen7'));
    renderScreen('screen7', data);
  

    addPieChart('screen7TimesContainer', data.times.map(t => convertirATiempoEnSegundos(t.value)), titleArray.times );
    addPieChart('screen7OrdersContainer', data.orders.map(o => o.value), titleArray.orders);
    addPieChart('screen7AxisMoveTimeContainer', data.axisMoveTime.map(t => convertirATiempoEnSegundos(t.value)), titleArray.axisMoveTime);
    addPieChart('screen7AxisDistanceContainer', data.axisDistance.map(a => a.value), titleArray.axisDistance);
    addPieChart('screen7AxisCyclesContainer', data.axisCycles.map(a => a.value), titleArray.axisCycles);
  }

  export function showTemperatureGraph() {
    const containerId = 'screen8TemperatureContainer'; // ID del contenedor donde irá la gráfica
    const contenedor = document.getElementById(containerId);
  
    if (!contenedor) {
      console.warn(`Contenedor con id ${containerId} no encontrado`);
      return;
    }
  
    // Limpieza previa de canvas no deseados
    contenedor.querySelectorAll('canvas.lineChartClass').forEach(el => el.remove());
  
    // Crear un canvas para la gráfica
    const canvas = document.createElement('canvas');
    canvas.className = 'lineChartClass';
    canvas.width = 400;
    canvas.height = 200;
    canvas.id = containerId + '-lineChartClass';
  
    // Añádelo dentro del contenedor
    contenedor.appendChild(canvas);
  
    // Datos ficticios (últimos 10 valores de temperatura)
    const temperaturas = [2, 7, 4, 1, -4, -5, -8, -1, 6, 12, -4, -8, 2, 7, 4, 1, -4, -5, -8, -1, 6, 12, -4, -8]; // Valores de ejemplo
    const etiquetas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']; // Etiquetas de los puntos
  
    // Crear la gráfica
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas, // Etiquetas para los puntos
        datasets: [{
          label: 'Temperatura (°C)',
          data: temperaturas, // Datos numéricos
          borderColor: '#4e73df', // Color de la línea
          backgroundColor: 'rgba(78, 115, 223, 0.1)', // Color de relleno bajo la línea
          borderWidth: 2,
          tension: 0.4, // Suavizar la línea
          pointHitRadius: 50 // Aumenta el área de detección del cursor alrededor del punto
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: { size: 14 }
            }
          },
          tooltip: {
            titleFont: {
              size: 16, // Tamaño de la fuente del título
              weight: 'bold' // Negrita para el título
            },
            bodyFont: {
              size: 16, // Tamaño de la fuente del cuerpo
              weight: 'bold' // Negrita para el cuerpo
            },
            padding: 10, // Espaciado interno del tooltip
            boxPadding: 5, // Espaciado adicional alrededor del tooltip
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.raw} °C`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Últimos 10 registros',
              font: { size: 14 }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Temperatura (°C)',
              font: { size: 14 }
            },
            beginAtZero: true
          }
        }
      }
    });
  }