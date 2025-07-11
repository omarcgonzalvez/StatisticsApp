// Utilidades
function convertirAHoras(timeStr) {
    if (!timeStr) return 0;
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h + m / 60 + s / 3600).toFixed(2);
  }
  
  function formatearTiempo(timeStr) {
    if (!timeStr) return '0h 0m';
    const [h, m] = timeStr.split(':');
    return `${h}h ${m}m`;
  }
  
  function formatearDistancia(valor) {
    if (!valor && valor !== 0) return '--';
    return parseFloat(valor).toFixed(1).replace('.', ',');
  }
  
  
  function formatearFechaISOaDDMMYYYY(fechaISO) {
    const [año, mes, dia] = fechaISO.split('-');
    return `${dia}-${mes}-${año}`;
  }
  