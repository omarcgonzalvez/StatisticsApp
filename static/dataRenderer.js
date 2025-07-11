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

export function addContainer (text) {
    const div = document.createElement('div');
    div.className  = 'containerClass';
    div.textContent = text;
    return div;
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
    clearContainers(screenPrefix);
  
    Object.entries(CONTAINER_SUFFIX).forEach(([key, suffix]) => {
      const container = document.getElementById(`${screenPrefix}${suffix}`);
      if (!container || !Array.isArray(data[key])) return;
  
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
  function collectParams (screenPrefix) {
    const root = document.getElementById(`${screenPrefix}Id`);
    if (!root) return {};
  
    const q = {};
    const sel = root.querySelector('.comboBoxClass');
    if (sel)  q.maquina = sel.value;
  
    const start = root.querySelector('[data-role="start"]')?.value;
    const end   = root.querySelector('[data-role="end"]')?.value;
    screenPrefix

    if (start) q.from = start;
    if (end)   q.to   = end;

    //Si no hay ni start ni end significa que hay fecha simple
    if (!start && !end){
      const singleDate = root.querySelector('input.datetimeInputClass[type="datetime-local"]')?.value;
      if (singleDate) q.fecha = singleDate;
    }
    
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
      return json;
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
  