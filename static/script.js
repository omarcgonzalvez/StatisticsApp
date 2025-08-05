import {
  showDataResumen,
  showDataFiltrarPorFecha,
  showDataTotal,
  showDataTotalFiltrar,
  showDataPromedios,
  showDataPromediosFiltrar,
  showTemperatureGraph,
} from './dataRenderer.js';  

const screens = ['screenMain', 'screen2Id', 'screen3Id', 'screen4Id', 'screen5Id', 'screen6Id', 'screen7Id','screen8Id']; //ARRAY DEFINIR VISTAS A UTILIZAR
const screenClasses = '.screen2Class, .screen3Class, .screen4Class, .screen5Class, .screen6Class, .screen7Class, .screen8Class';
const screenHeaderClasses = '.screen2HeaderClass, .screen3HeaderClass, .screen4HeaderClass, .screen5HeaderClass, .screen6HeaderClass, .screen7HeaderClass, .screen8HeaderClass'
const screenSubHeaderClasses = '.screen2SubHeaderClass, .screen3SubHeaderClass, .screen4SubHeaderClass, .screen5SubHeaderClass, .screen6SubHeaderClass, .screen7SubHeaderClass, .screen8SubHeaderClass';

//INICIALIZACION
const initializeCombobox = 'Statistics_APS3D[1]';

//FUNCION FECHA
function nowISO(){
  const now = new Date
  const offsetMs = now.getTimezoneOffset()*60000;
  return new Date(now - offsetMs).toISOString().slice(0, 16);
}
//FIN//

//ACTUALIZAR SCREENS
//function refreshScreen(){
//  
//}


//INICIALIZAR SCREENS
//function refreshInitializeScreen(screen){
//  //1º refreshCombo
//  const comboBox = screen.querySelector('.comboBoxClass');
//  if (comboBox) comboBox.value = initializeCombobox
//  
//  //2º refreshInputTime
//  const dateInputs = screen.querySelectorAll('.datetimeInputClass');
//  dateInputs.forEach(input => {
//    if (screen.classList.contains('screen3Class')){
//      if (input.dataset.role !== 'start'){
//        input.value = nowISO();
//      } else {
//        input.value = '';//FECHA INICIO VACIA
//      }
//    }else {
//      input.value = nowISO();
//    }
//  });
//}
// INICIALIZAR / REFRESCAR UNA PANTALLA //// FECHAS DE PANTALLA 3 SE GUARDAN
function refreshInitializeScreen(screen) {

  /* 1) Combobox ---------------------------------------------------------- */
  const comboBox = screen.querySelector('.comboBoxClass');
  if (comboBox) comboBox.value = initializeCombobox;


  /* 2) Inputs de fecha/hora --------------------------------------------- */
  const dateInputs = screen.querySelectorAll('.datetimeInputClass');

  dateInputs.forEach(input => {

    const yaTieneValor = input.value && input.value.trim() !== '';

    if (screen.classList.contains('screen3Class')|| screen.classList.contains('screen5Class')|| screen.classList.contains('screen7Class')) {
      // ——— Pantalla con dos fechas (start / end) ———
      if (input.dataset.role === 'start') {
        // fecha inicial → deja lo que haya; si está vacío NO lo sobre‑escribas
        if (!yaTieneValor) input.value = '';      // sólo la primera vez
      } else {
        // fecha final → pon nowISO () sólo si todavía estaba vacía
        if (!yaTieneValor) input.value = nowISO();
      }

    } else {
      // ——— Resto de pantallas (sólo un date‑input) ———if (!yaTieneValor) input.value = nowISO(); SI QUEREMOS CONSERVAR VALOR
      input.value = nowISO(); //'2025-06-13T13:10';
    }
  });
}



function showOnlyScreen(screenId) {     //FUNCION PARA MOSTRAR VISTAS
  screens.forEach(elementId => {        //RECORRER ARRAY SCREENS
    document.getElementById(elementId)  //GUARDAR CADA ELEMENT ID
            .classList.toggle('hidden', elementId !== screenId);  //OCULTAR VISTAS EXCEPTO LA QUE QUEREMOS MOSTRAR
  });

  const screen = document.getElementById(screenId);
  if (screen){ 
    refreshInitializeScreen(screen);
    //requestData(screen);
  }

  //LOGICA PARA COLOR BOTON FILTRAR
  const filterBtn = screen.querySelector('.filterBtn');
  if (filterBtn) {
    // define un array con las “pantallas de filtrado”
    const filterScreens = ['screen3Id', 'screen5Id', 'screen7Id'];  //SON PANTALLAS DE FILTRADO
    if (filterScreens.includes(screenId)) {
      filterBtn.classList.add('filterBtn--on');
      filterBtn.classList.remove('filterBtn--off');
    } else {
      filterBtn.classList.add('filterBtn--off');
      filterBtn.classList.remove('filterBtn--on');
    }
  }
  //TERMINA LOGICA

  window.scrollTo(0, 0);
}

function OnClick(btnId,callback){   //DEFINIR ONCLICK PARA LOS BOTONES
  document.getElementById(btnId).addEventListener('click',callback) 
}

document.querySelectorAll('.btnInicio')   //BOTON INICION
        .forEach(btn => btn.addEventListener('click', () =>
            showOnlyScreen('screenMain')
        ));

OnClick('btnResumenGeneral',  ()=>  {showOnlyScreen('screen2Id'); showDataResumen(); });    //ONCLICK + FUNCION FLECHA A SHOWONLYSCREEN
OnClick('btnFiltrarPorFecha',  ()=>  {showOnlyScreen('screen3Id'); showDataFiltrarPorFecha(); });
OnClick('btnTotal',  ()=>  {showOnlyScreen('screen4Id'); showDataTotal(); });
OnClick('btnTotalFiltrar',  ()=>  {showOnlyScreen('screen5Id'); showDataTotalFiltrar(); });
OnClick('btnPromedios',  ()=>  {showOnlyScreen('screen6Id'); showDataPromedios(); });
OnClick('btnPromediosFiltrar',  ()=>  {showOnlyScreen('screen7Id'); showDataPromediosFiltrar(); });
OnClick('btnTemperaturas',  ()=>  {showOnlyScreen('screen8Id'); showTemperatureGraph(); });
OnClick('btnInicio',  ()=>  showOnlyScreen('screenMain'));


//FUNCION PARA AÑADIR COMBOBOX
function addComboBox() {
  const label = document.createElement('label');
  label.textContent = 'Selecione Máquina: ';
  label.style.cssText = 'font-weight: bold; font-size: 1.2em;';

  const select = document.createElement('select');
  select.className = 'comboBoxClass';
  select.innerHTML = `
    <option value="Statistics_APS3D[1]">APS3D01</option>
    <option value="Statistics_APS3D[2]">APS3D02</option>
    <option value="Statistics_APS3D[3]">APS3D03</option>
    <option value="Statistics_APS3D[4]">APS3D04</option>
    <option value="Statistics_APS3D[5]">APS3D05</option>
    <option value="Statistics_APS3D[6]">APS3D06</option>
    <option value="Statistics_APS3D[7]">APS3D07</option>
    <option value="Statistics_APS3D[8]">APS3D08</option>
    <option value="Statistics_APS3D[9]">APS3D09</option>
    <option value="Statistics_APS3D[10]">APS3D10</option>
  `;
  label.appendChild(select);
  return label;
}

//OLD
//document.addEventListener('DOMContentLoaded', () => {
//  // Recorre TODAS las pantallas secundarias (.screen2)
//  document.querySelectorAll(screenClasses).forEach(screen => {
//    const header = screen.querySelector(screenHeaderClasses);
//    if (!header) return;                              // por si acaso
//
//    // Evita duplicados en esa pantalla
//    if (!screen.querySelector('.comboBoxClass')) {
//      header.insertAdjacentElement('afterend', addComboBox());
//      //              └────► se inserta FUERA del header, justo debajo
//    }
//
//    if (!screen.querySelector('.datetimeInputClass')) {
//      header.insertAdjacentElement('afterend', addDatetimeLocal());
//    }
//
//  });
//});

//test
//document.addEventListener('change', (event) => {
//  if (event.target && event.target.classList.contains('comboBoxClass')) {
//    console.log('Valor seleccionado:',event.target.value);
//  }
//});
//document.addEventListener('change',  (e) => {
//  if (!e.target.matches('.datetimeInputClass')) return;
//  console.log('value ‑‑>', e.target.value);          // 2025‑03‑26T10:35
//});

/* Escucha cambios en TODOS los .datetimeInputClass */
document.addEventListener('change', e => {
  if (!e.target.matches('.datetimeInputClass')) return;

  const screen = e.target.closest(
    '.screen2Class, .screen3Class, .screen4Class, .screen5Class, .screen6Class, .screen7Class, .screen8Class'
  );

  if (!screen) return;   // por si acaso
  const screenId = screen.id;
  const role   = e.target.dataset.role || 'single';
  console.log(`[${screen.id}] ${role} →`, e.target.value);

  
  // Actualizar datos y gráficas según la pantalla
  switch (screenId) {
    case 'screen2Id':
      showDataResumen();
      break;
    case 'screen3Id':
      showDataFiltrarPorFecha();
      break;
    case 'screen4Id':
      showDataTotal();
      break;
    case 'screen5Id':
      showDataTotalFiltrar();
      break;
    case 'screen6Id':
      showDataPromedios();
      break;
    case 'screen7Id':
      showDataPromediosFiltrar();
      break;
    case 'screen8Id':
      showTemperatureGraph();
      break;
    default:
      console.warn(`No se encontró una función para actualizar la pantalla: ${screenId}`);
  }
});


/*  Log de CUALQUIER clic dentro del documento */
document.addEventListener('click', event => {
  // ¿A qué elemento realmente se hizo clic?
  const btn = event.target.closest('button, .button');
  if (!btn) return;     // no era un botón → salimos

  const id   = btn.id         || '(sin id)';
  const text = btn.textContent.trim();

  console.log(`CLICK ➜ id: ${id} | texto: "${text}"`);
});



//FUNCIÓN PARA AÑADIR ENTRADA DE FECHA
function addDatetimeLocal(labelText = 'Fecha: ', role = ''){
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.cssText = 'font-weight: bold; font-size: 1.2em;';

  const datetimeInput = document.createElement('input');
  datetimeInput.type = 'datetime-local';            
  datetimeInput.className = 'datetimeInputClass';  
  if (role) datetimeInput.dataset.role = role; //ETIQUETA

  label.appendChild(datetimeInput);
  return label;
}

//FUNCIÓN PARA AÑADIR BOTÓN
function addFilterButton(){
  const btn = document.createElement('button');
  btn.className = 'button filterBtn';
  btn.textContent = 'FILTRAR';
  btn.type = 'button';
  return btn;
}




document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll(screenClasses).forEach(screen => {
    // el sub‑header donde van los controles
    const subHeader = screen.querySelector(screenSubHeaderClasses);
    if (!subHeader) {
      console.warn(`No se encontró el subHeader para ${screen.id}`);
      return;
    }
    console.log(`SubHeader encontrado para ${screen.id}`);
    const withComboBox =
      screen.classList.contains('screen2Class') ||
      screen.classList.contains('screen3Class')||
      screen.classList.contains('screen8Class');
      //AÑADIR LAS QUE QUERAMOS
    ;

    const withFilterButton =
      screen.classList.contains('screen2Class') ||
      screen.classList.contains('screen3Class') ||
      screen.classList.contains('screen4Class') ||
      screen.classList.contains('screen5Class') ||
      screen.classList.contains('screen6Class') ||
      screen.classList.contains('screen7Class') ;
    ;

    const withDateTimeInput = {
      screen2Class: 1, //solo 1 input de fecha
      screen3Class: 2, //input inicial y input final
      screen4Class: 1,
      screen5Class: 2, 
      screen6Class: 1,
      screen7Class: 2,
      screen8Class: 1,
    };

    // Combobox // 1º  PANTALLAS QUE LLEVEN COMBOBOX
    if (withComboBox && !subHeader.querySelector('.comboBoxClass')) {
      subHeader.appendChild(addComboBox()).querySelector('select').value = initializeCombobox;
    }
    
    //2.1º BOTON IS FILTER?
    if (withFilterButton && !subHeader.querySelector('.filterBtn')){
      subHeader.appendChild(addFilterButton());
    };


    //FECHAS 2º averiguamos cuántos necesita esta pantalla
    const classKey = Object.keys(withDateTimeInput)
                     .find(c => screen.classList.contains(c)) || '';
    const needed   = withDateTimeInput[classKey] ?? 0;

    const current  = subHeader.querySelectorAll('.datetimeInputClass').length;

    for (let i = current; i < needed; i++) {
      /* etiqueta y role según si es la 1ª o la 2ª de la pantalla con 2 fechas */
      const label = (needed === 2)
        ? (i === 0 ? 'Fecha Inicial:' : 'Fecha Final:')
        : 'Fecha:';
      const role  = (needed === 2)
        ? (i === 0 ? 'start' : 'end')
        : '';

      const dt = addDatetimeLocal(label, role);

      // Inicializar valor:
      if (role !== 'start') {          // única fecha o “Fecha Final”
        dt.querySelector('input').value = nowISO();
      } /* else → Fecha Inicial queda vacía */

      subHeader.appendChild(dt);
    }
  });
});

//    ///// FECHAS   ////////// OLD ESTA ERA SOLO PARA LA SCREEN3 LA QUE ESTA AHORA ARRIBA CONTEMPLA LAS QUE LE PONGAS EN CONFIG
//    if (screen.classList.contains('screen3Class')){
//      //SCREEN3 2 FECHAS
//      const existentes = subHeader.querySelectorAll('.datetimeInputClass').length;
//
//      if (existentes === 0) {
//        // FECHA INICIAL
//        const dt1 = addDatetimeLocal('Fecha Inicial:', 'start');
//        //dt1.querySelector('input').value = nowISO();
//        subHeader.appendChild(dt1);
//
//        // FECHA FINAL
//        const dt2 = addDatetimeLocal('Fecha Final:', 'end');
//        dt2.querySelector('input').value = nowISO();
//        subHeader.appendChild(dt2);  
//      }
//
//    }else {
//    // Fecha // 2º
//    if (!subHeader.querySelector('.datetimeInputClass')) {
//      subHeader.appendChild(addDatetimeLocal('Fecha: ')).querySelector('input').value = nowISO();
//    }
//  }
//
//  });
//});


/*function addContainer (data){
  const addDiv = document.createElement('div');
  addDiv.className = 'containerClass';
  addDiv.textContent = data;
  return addDiv;
}
//EJEMPLO PARA METER LOS DATOS, DESPUES HAREMOS FETCH A LA API PYTHON PARA MANEJAR LA DATABASE SQL
const datos1 = 3;
const datos2 = 4;
const datos3 = 5;
const datos4 = 10;
const datos5 = 32;
const datos6 = 102;*/

/*function showDataResumen(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos5} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen2TimesContainer = document.getElementById('screen2TimesContainer');
const screen2OrdersContainer = document.getElementById('screen2OrdersContainer');
const screen2AxisMoveTimeContainer = document.getElementById('screen2AxisMoveTimeContainer');
const screen2AxisDistanceContainer = document.getElementById('screen2AxisDistanceContainer');
const screen2AxisCyclesContainer = document.getElementById('screen2AxisCyclesContainer');


//LIMPIAR ANTES DE CARGAR
screen2TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen2OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen2AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen2AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen2AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen2TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen2OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen2AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen2AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen2AxisCyclesContainer.appendChild(addContainer(el)));
}*/

/*function showDataFiltrarPorFecha(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos6} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen3TimesContainer = document.getElementById('screen3TimesContainer');
const screen3OrdersContainer = document.getElementById('screen3OrdersContainer');
const screen3AxisMoveTimeContainer = document.getElementById('screen3AxisMoveTimeContainer');
const screen3AxisDistanceContainer = document.getElementById('screen3AxisDistanceContainer');
const screen3AxisCyclesContainer = document.getElementById('screen3AxisCyclesContainer');


//LIMPIAR ANTES DE CARGAR
screen3TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen3OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen3AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen3AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen3AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen3TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen3OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen3AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen3AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen3AxisCyclesContainer.appendChild(addContainer(el)));
}*/

/*function showDataTotal(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos6} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen4TimesContainer = document.getElementById('screen4TimesContainer');
const screen4OrdersContainer = document.getElementById('screen4OrdersContainer');
const screen4AxisMoveTimeContainer = document.getElementById('screen4AxisMoveTimeContainer');
const screen4AxisDistanceContainer = document.getElementById('screen4AxisDistanceContainer');
const screen4AxisCyclesContainer = document.getElementById('screen4AxisCyclesContainer');

//LIMPIAR ANTES DE CARGAR
screen4TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen4OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen4AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen4AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen4AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen4TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen4OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen4AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen4AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen4AxisCyclesContainer.appendChild(addContainer(el)));
}*/

/*function showDataTotalFiltrar(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos6} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen5TimesContainer = document.getElementById('screen5TimesContainer');
const screen5OrdersContainer = document.getElementById('screen5OrdersContainer');
const screen5AxisMoveTimeContainer = document.getElementById('screen5AxisMoveTimeContainer');
const screen5AxisDistanceContainer = document.getElementById('screen5AxisDistanceContainer');
const screen5AxisCyclesContainer = document.getElementById('screen5AxisCyclesContainer');


//LIMPIAR ANTES DE CARGAR
screen5TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen5OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen5AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen5AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen5AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen5TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen5OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen5AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen5AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen5AxisCyclesContainer.appendChild(addContainer(el)));
}*/

/*function showDataPromedios(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos6} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen6TimesContainer = document.getElementById('screen6TimesContainer');
const screen6OrdersContainer = document.getElementById('screen6OrdersContainer');
const screen6AxisMoveTimeContainer = document.getElementById('screen6AxisMoveTimeContainer');
const screen6AxisDistanceContainer = document.getElementById('screen6AxisDistanceContainer');
const screen6AxisCyclesContainer = document.getElementById('screen6AxisCyclesContainer');


//LIMPIAR ANTES DE CARGAR
screen6TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen6OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen6AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen6AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen6AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen6TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen6OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen6AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen6AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen6AxisCyclesContainer.appendChild(addContainer(el)));
}*/

/*function showDataPromediosFiltrar(){
  const times = [`TIEMPO DE CARGA BATERIA: ${datos1} horas`, `AUTO & ORDER: ${datos2} horas`, `AUTO & SEARCH: ${datos3} horas`, `TIME BLOCKED: ${datos4} horas`, `TIME IN ERROR: ${datos6} horas`];
  const orders = ['COMPLETED TASKS', 'CANCELED TASKS', 'MOVEMENTS COMPLETED', 'NUMBER OF ERRORS'];
  const axisMoveTime = ['TIEMPO DESPLAZAMIENTO EJE X: 1 hora', 'TIEMPO DESPLAZAMIENTO EJE Z: 2 horas', 'TIEMPO DESPLAZAMIENTO EJE Y: 1 hora'];
  const axisDistance = ['DISTANCIA RECORRIDA EJE X: 100 metros', 'DISTANCIA RECORRIDA EJE Z: 400 metros'];
  const axisCycles = ['CICLOS REALIZADOS EJE X: 142', 'CICLOS REALIZADOS EJE Z: 282', 'CICLOS REALIZADOS EJE X: 367'];
  
//CONTENEDORES
const screen7TimesContainer = document.getElementById('screen7TimesContainer');
const screen7OrdersContainer = document.getElementById('screen7OrdersContainer');
const screen7AxisMoveTimeContainer = document.getElementById('screen7AxisMoveTimeContainer');
const screen7AxisDistanceContainer = document.getElementById('screen7AxisDistanceContainer');
const screen7AxisCyclesContainer = document.getElementById('screen7AxisCyclesContainer');


//LIMPIAR ANTES DE CARGAR
screen7TimesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen7OrdersContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen7AxisMoveTimeContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen7AxisDistanceContainer.querySelectorAll('.containerClass').forEach(el => el.remove());
screen7AxisCyclesContainer.querySelectorAll('.containerClass').forEach(el => el.remove());

//AÑADIR CONTENEDORES CON DATOS
times.forEach(el => screen7TimesContainer.appendChild(addContainer(el)));
orders.forEach(el => screen7OrdersContainer.appendChild(addContainer(el)));
axisMoveTime.forEach(el => screen7AxisMoveTimeContainer.appendChild(addContainer(el)));
axisDistance.forEach(el => screen7AxisDistanceContainer.appendChild(addContainer(el)));
axisCycles.forEach(el => screen7AxisCyclesContainer.appendChild(addContainer(el)));
}*/

//OLD
//document.addEventListener('click', e => {
//  const btn = e.target.closest('.filterBtn');   // ¿se hizo clic en un FILTRAR?
//  if (!btn) return;                             // …si no, salimos
//
//  const screen = btn.closest(
//    '.screen2Class, .screen3Class, .screen4Class, .screen5Class'              // donde vivirá
//  );
//  if (!screen) return;                          // por si se descuadra el DOM
//
//  if (screen.classList.contains('screen2Class')) {  //SI ESTAMOS EN 4
//    // equivalente a pulsar el botón “Filtrar por Fecha”
//    showOnlyScreen('screen3Id');//IR A 3
//    showDataFiltrarPorFecha();  //MOSTRAR DATOS 3        // <- si quieres cargar datos
//    // o bien:  document.getElementById('btnFiltrarPorFecha').click();
//  }
//  else if (screen.classList.contains('screen3Class')) {
//    // vuelta al Resumen
//    showOnlyScreen('screen2Id');
//    showDataResumen();
//    // o bien:  document.getElementById('btnResumenGeneral').click();
//  }  else if (screen.classList.contains('screen4Class')) {
//    // vuelta al Resumen
//    showOnlyScreen('screen5Id');
//    showDataPromedios();
//    // o bien:  document.getElementById('btnResumenGeneral').click();
//  }  else if (screen.classList.contains('screen5Class')) {
//    // vuelta al Resumen
//    showOnlyScreen('screen4Id');
//    showDataTotal();
//    // o bien:  document.getElementById('btnResumenGeneral').click();
//  }
//});


/* ---- mapa de navegación del botón FILTRAR ---- */
const filterRoutes = {
  screen2Class: { target: 'screen3Id', paint: showDataFiltrarPorFecha },
  screen3Class: { target: 'screen2Id', paint: showDataResumen         },
  screen4Class: { target: 'screen5Id', paint: showDataTotalFiltrar       },
  screen5Class: { target: 'screen4Id', paint: showDataTotal           },
  screen6Class: { target: 'screen7Id', paint: showDataPromediosFiltrar           },
  screen7Class: { target: 'screen6Id', paint: showDataPromedios           },
  // añade aquí las que necesites:
  // screen6Class: { target: 'screenXId', paint: showDataLoQueSea      },
};

document.addEventListener('click', e => {
  const btn = e.target.closest('.filterBtn');
  if (!btn) return;                         // SU NO ES UN FILTERBTN SALIR

  /* pantalla en la que vive el botón */
  const screen = btn.closest(
    Object.keys(filterRoutes).map(c => '.' + c).join(', ')
  );
  if (!screen) return;                      // por si se descoloca el DOM

  /* buscamos la ruta correspondiente */
  const cls   = Object.keys(filterRoutes).find(c => screen.classList.contains(c));
  if (!cls) return;                         // esa pantalla no está en la tabla

  const { target, paint } = filterRoutes[cls];

  showOnlyScreen(target);  // navega
  paint();                 // pinta datos de destino
});

/* Escucha cambios en TODOS los .comboBoxClass */
document.addEventListener('change', e => {
  if (!e.target.matches('.comboBoxClass')) return;

  const screen = e.target.closest(
    '.screen2Class, .screen3Class, .screen4Class, .screen5Class, .screen6Class, .screen7Class, .screen8Class'
  );

  if (!screen) return; // por si acaso

  const screenId = screen.id;
  console.log(`[${screenId}] Combobox →`, e.target.value);

  // Actualizar datos y gráficas según la pantalla
  switch (screenId) {
    case 'screen2Id':
      showDataResumen();
      break;
    case 'screen3Id':
      showDataFiltrarPorFecha();
      break;
    case 'screen4Id':
      showDataTotal();
      break;
    case 'screen5Id':
      showDataTotalFiltrar();
      break;
    case 'screen6Id':
      showDataPromedios();
      break;
    case 'screen7Id':
      showDataPromediosFiltrar();
      break;
    case 'screen8Id':
      showTemperatureGraph();
      break;
    default:
      console.warn(`No se encontró una función para actualizar la pantalla: ${screenId}`);
  }
});