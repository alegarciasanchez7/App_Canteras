import { initializeApp, getApps } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import appFirebase from "./credenciales.js";

// Calcula el tamaño de un string Firestore (UTF-8 + 1 byte extra)
function sizeOfString(str) {
  return Buffer.byteLength(str, "utf8") + 1;
}

// Calcula el tamaño de un campo según el tipo Firestore
function sizeOfField(name, value) {
  let size = sizeOfString(name); // Tamaño del nombre del campo
  if (typeof value === "string") {
    size += sizeOfString(value); // Suma tamaño del string
  } else if (typeof value === "boolean") {
    size += 1; // Booleano ocupa 1 byte
  } else if (typeof value === "number") {
    size += 8; // Número ocupa 8 bytes
  } else if (value === null) {
    size += 1; // Null ocupa 1 byte
  } else if (Array.isArray(value)) {
    // Si es array, suma el tamaño de cada elemento
    for (const v of value) size += sizeOfField("", v);
  } else if (typeof value === "object") {
    // Si es objeto/mapa, suma el tamaño de cada campo
    for (const k in value) size += sizeOfField(k, value[k]);
  }
  return size;
}

// Calcula el tamaño del nombre del documento (ruta completa + 16 bytes extra)
function sizeOfDocName(pathArr) {
  let size = 0;
  for (const seg of pathArr) size += sizeOfString(seg);
  size += 16;
  return size;
}

// Inicializa la app de Firebase solo si no está ya inicializada
const app = getApps().length === 0 ? initializeApp(appFirebase) : getApps()[0];
const db = getFirestore(app);

// Función principal: calcula el espacio ocupado por la colección "socios"
export default async function calcularEspacioSocios() {
  const snapshot = await getDocs(collection(db, "socios"));
  let totalBytes = 0;        // Espacio total ocupado
  let maxSocioSize = 0;      // Tamaño máximo de un socio
  let maxSocioId = "";       // ID del socio más grande

  // Recorre todos los documentos de la colección
  snapshot.forEach((doc) => {
    const pathArr = ["socios", doc.id];
    let docSize = sizeOfDocName(pathArr); // Tamaño de la ruta del documento
    const data = doc.data();
    // Suma el tamaño de cada campo del documento
    for (const k in data) {
      docSize += sizeOfField(k, data[k]);
    }
    docSize += 32; // bytes adicionales por documento (metadatos)
    totalBytes += docSize;
    // Guarda el socio de mayor tamaño
    if (docSize > maxSocioSize) {
      maxSocioSize = docSize;
      maxSocioId = doc.id;
    }
  });

  // Límite de espacio (1 GiB en bytes)
  const limiteBytes = 1073700000;
  // Porcentaje de espacio usado
  const porcentaje = ((totalBytes / limiteBytes) * 100).toFixed(2);
  // Número de socios actuales
  const sociosActuales = snapshot.size;
  // Estimación de socios máximos posibles si todos ocupan el tamaño máximo actual
  const sociosMaximosEstimados = Math.floor((limiteBytes - totalBytes) / maxSocioSize) + sociosActuales;

  // Mensajes informativos en consola
    //console.log("Tamaño estimado de la colección socios (incluyendo metadatos):", totalBytes, "bytes");
    //console.log(`Porcentaje de espacio usado respecto a 1 GiB: ${porcentaje}%`);
    //console.log(`Socio de mayor tamaño: ${maxSocioId} (${maxSocioSize} bytes)`);
    //console.log(`Socios actuales: ${sociosActuales}`);
    //console.log(`Puedes añadir aproximadamente hasta ${sociosMaximosEstimados} socios en total si todos los nuevos socios ocupan el tamaño máximo actual.`);

  // Devuelve el total de bytes usados
  return totalBytes;
}