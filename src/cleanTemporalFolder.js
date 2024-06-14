const fs = require('fs');
const path = require('path');

/**
 * TEMP_DIR
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description enlace al directorio temporal
 */
const TEMP_DIR = path.join(__dirname, 'uploads');

/**
 * INTERVAL_TIME
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description definicion del intervalo de tiempo en el que se
 * limpiara la carpeta temporal
 */
const INTERVAL_TIME = 60 * 60 * 1000;

fs.mkdir(TEMP_DIR, (err) => {});

/**
 * Limpiar la carpeta temporal
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description limpia la carpeta temporal cada cierto tiempo, el tiempo
 * esta definido por INTERVAL_TIME
 */
function cleanTempFolder() {
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) {
      console.error(`Error al leer el directorio temporal: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error al obtener las estadisticas: ${err}`);
          return;
        }

        // Define el tiempo limite para eliminar archivos (en milisegundos)
        const expireTime = INTERVAL_TIME; // 1 hora

        if (Date.now() - stats.mtimeMs > expireTime) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo: ${err}`);
            } else {
              console.log(`Archivo eliminado: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

// Ejecutar la función cada hora
setInterval(cleanTempFolder, INTERVAL_TIME);