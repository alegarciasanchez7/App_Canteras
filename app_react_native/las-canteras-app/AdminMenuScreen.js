import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  PixelRatio,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import appFirebase from "./credenciales";
import CryptoJS from "crypto-js";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import calcularEspacioSocios from "./calcularEspacio"; // Importa la función para calcular espacio

// Inicializa la base de datos Firestore
const db = getFirestore(appFirebase);

// Colores usados en la pantalla
const COLORS = {
  background: "#fff",
  green: "#4CAF50",
  white: "#fff",
};

// Función para escalado responsivo
const { width } = Dimensions.get("window");
const scale = width / 375;
function normalize(size) {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}

// Imágenes usadas en la pantalla
const IMAGES = {
  home: require("./assets/arrow.png"),
  pdf: require("./assets/pdf.png"), // Icono para exportar PDF
};

// Opciones de filtro para el buscador
const FILTER_OPTIONS = [
  { label: "NIF", value: "NIF" },
  { label: "Nombre", value: "Nombre" },
  { label: "Nº Socio", value: "NumeroSocio" },
];

// Clave secreta para cifrado de contraseñas
const SECRET_KEY = "@ESTOCOLMO_2025";

// Función para cifrar texto (contraseñas)
export function cifrar(texto) {
  return CryptoJS.AES.encrypt(texto, SECRET_KEY).toString();
}

// Función para descifrar texto cifrado
export function descifrar(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

// Límite de espacio en bytes (1 GiB)
const LIMITE_BYTES = 1073741824;

// Componente principal de la pantalla de administración de socios
const AdminMenuScreen = ({ navigation, route }) => {
  // Obtiene nombre y dni del usuario desde los parámetros de navegación
  const { nombre, dni } = route.params || {};

  // Estados para la gestión de socios y formularios
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [form, setForm] = useState({
    DNI: "",
    Nombre: "",
    NumeroSocio: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("NIF");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [espacioUsado, setEspacioUsado] = useState(0);
  const [porcentajeEspacio, setPorcentajeEspacio] = useState(0);
  const [nuevoAdminDNI, setNuevoAdminDNI] = useState("");
  const [adminDNIs, setAdminDNIs] = useState([]); // Añade este estado para almacenar la lista de DNIs administradores
  const insets = useSafeAreaInsets();

  // Carga los socios y calcula el espacio usado al montar el componente
  useEffect(() => {
    cargarSocios();
    calcularEspacio();
    cargarAdmins();
  }, []);

  // Función para cargar todos los socios desde Firestore
  const cargarSocios = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "socios"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Ordena por número de socio
      lista.sort((a, b) => (a.NumeroSocio || 0) - (b.NumeroSocio || 0));
      setSocios(lista);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los socios.");
    }
    setLoading(false);
  };

  // Calcula el espacio usado por la colección de socios
  const calcularEspacio = async () => {
    const bytes = await calcularEspacioSocios();
    setEspacioUsado(bytes);
    setPorcentajeEspacio(((bytes / LIMITE_BYTES) * 100).toFixed(2));
  };

  // Limpia el formulario y resetea los estados de edición
  const limpiarFormulario = () => {
    setForm({
      DNI: "",
      Nombre: "",
      NumeroSocio: "",
      password: "",
    });
    setSelectedSocio(null);
    setIsEditing(false);
    setShowAddForm(false);
  };

  // Maneja cambios en los campos del formulario
  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Guarda un nuevo socio o actualiza uno existente
  const handleGuardar = async () => {
    console.log("Intentando guardar socio:", form);

    if (!form.DNI || !form.Nombre || !form.NumeroSocio || !form.password) {
      console.warn("Campos incompletos:", form);
      Alert.alert("Atención", "Por favor, rellena todos los campos.");
      return;
    }

    let passwordCifrada = "";
    try {
      console.log("Antes de cifrar:", form.password);
      passwordCifrada = cifrar(form.password.trim());
      console.log("Después de cifrar:", passwordCifrada);
    } catch (e) {
      console.error("Error al cifrar la contraseña:", e);
      Alert.alert("Error", "No se pudo cifrar la contraseña.");
      return;
    }

    const socioData = {
      DNI: form.DNI.trim(),
      Nombre: form.Nombre.trim(),
      NumeroSocio: parseInt(form.NumeroSocio, 10),
      password: passwordCifrada,
    };
    console.log("Datos del socio:", socioData);

    if (isNaN(socioData.NumeroSocio)) {
      console.warn("Número de socio no es un número válido:", form.NumeroSocio);
      Alert.alert("Atención", "El número de socio debe ser un número válido.");
      return;
    }

    try {
      console.log("Datos a guardar en Firestore:", socioData);
      await setDoc(doc(db, "socios", socioData.DNI), socioData);
      console.log("Socio guardado correctamente:", socioData);
      Alert.alert("Éxito", isEditing ? "Socio actualizado." : "Socio añadido.");
      limpiarFormulario();
      cargarSocios();
    } catch (error) {
      console.error("Error al guardar socio:", error);
      Alert.alert("Error", "No se pudo guardar el socio.");
    }
  };

  // Rellena el formulario para editar un socio existente
  const handleEditar = (socio) => {
    setForm({
      DNI: socio.DNI,
      Nombre: socio.Nombre,
      NumeroSocio:
        socio.NumeroSocio !== undefined && socio.NumeroSocio !== null
          ? socio.NumeroSocio.toString()
          : "",
      password: descifrar(socio.password || ""),
    });
    setSelectedSocio(socio);
    setIsEditing(true);
    setShowAddForm(true);
  };

  // Elimina un socio tras confirmación
  const handleEliminar = async (socio) => {
    Alert.alert(
      "Confirmar borrado",
      `¿Seguro que quieres borrar al socio "${socio.Nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "socios", socio.DNI));
              Alert.alert("Eliminado", "Socio borrado correctamente.");
              limpiarFormulario();
              cargarSocios();
            } catch (error) {
              Alert.alert("Error", "No se pudo borrar el socio.");
            }
          },
        },
      ]
    );
  };

  // Carga la lista de administradores desde Firestore
  const cargarAdmins = async () => {
    try {
      const configRef = doc(db, "app", "config");
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        setAdminDNIs(configSnap.data().adminDNIs || []);
      }
    } catch (e) {
      setAdminDNIs([]);
    }
  };

  // Función para convertir un socio en administrador (con confirmación)
  const handleConvertirAdmin = (dniSocio) => {
    const socio = socios.find((s) => s.DNI === dniSocio);
    const nombreSocio = socio ? socio.Nombre : dniSocio;
    if (adminDNIs.includes(dniSocio)) {
      Alert.alert("Info", "Este usuario ya es administrador.");
      return;
    }
    Alert.alert(
      "Confirmar",
      `¿Seguro que quieres convertir a "${nombreSocio}" en administrador/a?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, convertir",
          style: "default",
          onPress: async () => {
            try {
              const configRef = doc(db, "app", "config");
              await updateDoc(configRef, {
                adminDNIs: [...adminDNIs, dniSocio],
              });
              setAdminDNIs((prev) => [...prev, dniSocio]);
              Alert.alert("Éxito", `El socio "${nombreSocio}" ahora es administrador/a.`);
            } catch (e) {
              Alert.alert("Error", "No se pudo convertir en administrador/a.");
            }
          },
        },
      ]
    );
  };

  // Añade la función para eliminar privilegios de administrador (con confirmación)
  const handleEliminarAdmin = (dniSocio) => {
    const socio = socios.find((s) => s.DNI === dniSocio);
    const nombreSocio = socio ? socio.Nombre : dniSocio;
    Alert.alert(
      "Confirmar",
      `¿Seguro que quieres quitar los privilegios de administrador/a a "${nombreSocio}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const configRef = doc(db, "app", "config");
              const nuevosAdmins = adminDNIs.filter((dni) => dni !== dniSocio);
              await updateDoc(configRef, {
                adminDNIs: nuevosAdmins,
              });
              setAdminDNIs(nuevosAdmins);
              Alert.alert("Éxito", `El socio "${nombreSocio}" ya no es administrador/a.`);
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar el administrador/a.");
            }
          },
        },
      ]
    );
  };

  // Filtra los socios según el texto de búsqueda y el campo seleccionado
  const sociosFiltrados = socios.filter((socio) => {
    const search = searchText.toLowerCase();
    if (searchField === "NIF") {
      const value = (socio.DNI || "").toString().toLowerCase();
      return value.startsWith(search);
    }
    const value = (socio[searchField] || "").toString().toLowerCase();
    return value.includes(search);
  });

  // Genera y comparte un PDF con el listado de socios y contraseñas descifradas
  const handleImprimirListado = async () => {
    // Construye las filas de la tabla en HTML
    const tableRows = socios
      .map(
        (socio) => `
      <tr>
        <td>${socio.NumeroSocio}</td>
        <td>${socio.DNI}</td>
        <td>${socio.Nombre}</td>
        <td>${descifrar(socio.password || "")}</td>
      </tr>
    `
      )
      .join("");

    // Fecha actual para el encabezado del PDF
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, "0");
    const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
    const anio = fechaActual.getFullYear();
    const fechaStr = `${dia}/${mes}/${anio}`;

    // Estructura HTML del PDF
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #888; padding: 8px; font-size: 12px; }
          th { background: #e8f5e9; }
        </style>
      </head>
      <body>
        <h2>Listado Socios Aplicación Las Canteras</h2>
        <p>${fechaStr}</p>
        <table>
          <thead>
            <tr>
              <th>Nº Socio</th>
              <th>NIF</th>
              <th>Nombre</th>
              <th>Contraseña</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

    try {
      // Genera el PDF
      const { uri } = await Print.printToFileAsync({ html });
      // Comparte el PDF si es posible
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("No disponible", "No se puede compartir el archivo en este dispositivo.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo generar ni compartir el PDF.");
    }
  };

  // Función para añadir un nuevo admin
  const handleAddAdmin = async () => {
    if (!nuevoAdminDNI) {
      Alert.alert("Error", "Introduce un DNI válido.");
      return;
    }
    try {
      const configRef = doc(db, "app", "config");
      const configSnap = await getDoc(configRef);
      let currentAdmins = [];
      if (configSnap.exists()) {
        currentAdmins = configSnap.data().adminDNIs || [];
      }
      if (!currentAdmins.includes(nuevoAdminDNI)) {
        await updateDoc(configRef, {
          adminDNIs: [...currentAdmins, nuevoAdminDNI],
        });
        Alert.alert("Éxito", "Nuevo administrador añadido.");
        setNuevoAdminDNI("");
      } else {
        Alert.alert("Info", "Ese DNI ya es administrador.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo añadir el administrador.");
    }
  };

  // Renderizado principal de la pantalla
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Barra superior con logo y botón de volver a Home */}
      <StatusBar backgroundColor={COLORS.green} barStyle="light-content" />
      <View style={[styles.topSection, { paddingBottom: insets.bottom }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Cer5iYbPOns_D6mT3n6EavW114x1QYHlbg&s",
            }}
            style={styles.image}
          />
        </View>
        <Text style={styles.titleText}>Las Canteras</Text>
        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home", { nombre, dni })}
        >
          <Image source={IMAGES.home} style={styles.homeIcon} />
        </Pressable>
      </View>
      <View style={styles.container}>
        {/* Título y subtítulo */}
        <Text style={styles.title}>Gestión de Socios</Text>
        <Text style={styles.subtitle}>
          Aquí puedes añadir, modificar o borrar socios. Pulsa el botón para añadir un nuevo socio.
        </Text>

        {/* Botón para mostrar el formulario de añadir socio */}
        {!showAddForm && !isEditing && (
          <Pressable style={styles.addButton} onPress={() => setShowAddForm(true)}>
            <Text style={styles.buttonText}>Añadir un nuevo socio</Text>
          </Pressable>
        )}

        {/* Formulario para añadir o editar socio */}
        {(showAddForm || isEditing) && (
          <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>NIF:</Text>
            <TextInput
              style={styles.input}
              value={form.DNI}
              onChangeText={(v) => handleInputChange("DNI", v)}
              placeholder="Ejemplo: 12345678A"
              autoCapitalize="characters"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Nombre y apellidos:</Text>
            <TextInput
              style={styles.input}
              value={form.Nombre}
              onChangeText={(v) => handleInputChange("Nombre", v)}
              placeholder="Nombre completo"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Número de socio (solo números):</Text>
            <TextInput
              style={styles.input}
              value={form.NumeroSocio}
              onChangeText={(v) => handleInputChange("NumeroSocio", v.replace(/[^0-9]/g, ""))}
              placeholder="Ejemplo: 123"
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(v) => handleInputChange("password", v)}
              placeholder="Contraseña"
              secureTextEntry={false}
              placeholderTextColor="#888"
            />
            <View style={styles.buttonRow}>
              <Pressable style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.buttonText}>{isEditing ? "Actualizar socio" : "Añadir socio"}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={limpiarFormulario}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Título de la lista de socios */}
        <Text style={styles.listTitle}>Lista de socios</Text>

        {/* Barra de espacio usado en Firestore */}
        <View style={styles.espacioBarContainer}>
          <Text style={styles.espacioBarLabel}>
            Hay {socios.length} socios | Espacio usado: {porcentajeEspacio}%
          </Text>
          <View style={styles.espacioBarBackground}>
            <View
              style={[
                styles.espacioBarFill,
                { width: `${Math.min(porcentajeEspacio, 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Botón para imprimir/exportar el listado de socios */}
        <Pressable
          style={{
            backgroundColor: "#1976D2",
            paddingVertical: normalize(10),
            borderRadius: normalize(8),
            alignItems: "center",
            marginBottom: normalize(10),
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            gap: normalize(8),
          }}
          onPress={handleImprimirListado}
        >
          <Image
            source={IMAGES.pdf}
            style={{
              width: normalize(22),
              height: normalize(22),
              marginRight: normalize(8),
              resizeMode: "contain",
            }}
          />
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: normalize(16) }}>
            Listado completo de socios
          </Text>
        </Pressable>

        {/* Buscador y filtro de socios */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: normalize(10),
            gap: normalize(8),
          }}
        >
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
                fontSize: normalize(14),
                minWidth: 0,
                borderColor: "#4CAF50",
                borderWidth: 2,
                backgroundColor: "#fff",
                color: "#222",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            placeholder={`Buscar por ${searchField}`}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#4CAF50"
          />
          {/* Botón tipo Picker para seleccionar campo de búsqueda */}
          <TouchableOpacity
            style={[
              customPickerStyles.button,
              {
                flexDirection: "row",
                minWidth: normalize(110),
                maxWidth: normalize(140),
                flexShrink: 0,
                marginBottom: 0,
                borderColor: "#4CAF50",
                borderWidth: 2,
                backgroundColor: "#fff",
                color: "#222",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={customPickerStyles.buttonText} numberOfLines={1} ellipsizeMode="tail">
              {FILTER_OPTIONS.find((opt) => opt.value === searchField)?.label || "Filtro"}
            </Text>
            <Text style={customPickerStyles.arrow}>▼</Text>
          </TouchableOpacity>
          {/* Modal para seleccionar el campo de filtro */}
          <Modal
            visible={filterModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setFilterModalVisible(false)}
          >
            <TouchableOpacity
              style={customPickerStyles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setFilterModalVisible(false)}
            >
              <View style={customPickerStyles.modalContent}>
                {FILTER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={customPickerStyles.option}
                    onPress={() => {
                      setSearchField(option.value);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={customPickerStyles.optionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Lista de socios filtrados */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} />
        ) : (
          <FlatList
            data={sociosFiltrados}
            keyExtractor={(item) => item.DNI}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: normalize(80) }}
            renderItem={({ item }) => (
              <View style={styles.socioItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.socioText}>
                    <Text style={styles.socioLabel}>Nº Socio:</Text> {item.NumeroSocio}
                  </Text>
                  <Text style={styles.socioText}>
                    <Text style={styles.socioLabel}>NIF:</Text> {item.DNI}
                  </Text>
                  <Text style={styles.socioText}>
                    <Text style={styles.socioLabel}>Nombre:</Text> {item.Nombre}
                  </Text>
                </View>
                <View style={styles.socioButtonsContainer}>
                  <View style={styles.socioButtonsRow}>
                    <Pressable style={styles.editButton} onPress={() => handleEditar(item)}>
                      <Text style={styles.buttonText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.deleteButton} onPress={() => handleEliminar(item)}>
                      <Text style={styles.buttonText}>Borrar</Text>
                    </Pressable>
                  </View>
                  {/* Botón para convertir en administrador */}
                  {!adminDNIs.includes(item.DNI) && (
                    <Pressable
                      style={styles.adminButton}
                      onPress={() => handleConvertirAdmin(item.DNI)}
                    >
                      <Text style={styles.adminButtonText}>Convertir</Text>
                      <Text style={styles.adminButtonText}>administrador</Text>
                    </Pressable>
                  )}
                  {/* Botón para eliminar privilegios de administrador */}
                  {adminDNIs.includes(item.DNI) && (
                    <Pressable
                      style={styles.removeAdminButton}
                      onPress={() => handleEliminarAdmin(item.DNI)}
                    >
                      <Text style={styles.removeAdminButtonText}>Eliminar</Text>
                      <Text style={styles.removeAdminButtonText}>administrador</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Estilos para la pantalla y componentes
const styles = StyleSheet.create({
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.green,
    justifyContent: "space-between",
    paddingHorizontal: normalize(20),
    width: "100%",
    height: normalize(70),
  },
  imageContainer: {
    width: normalize(45),
    height: normalize(45),
    borderRadius: normalize(30),
    overflow: "hidden",
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    padding: normalize(5),
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titleText: {
    fontSize: normalize(28),
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginLeft: normalize(20),
  },
  homeButton: {
    backgroundColor: COLORS.green,
    padding: normalize(5),
    borderRadius: normalize(8),
    alignItems: "center",
    justifyContent: "center",
  },
  homeIcon: {
    width: normalize(35),
    height: normalize(35),
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: normalize(20),
    paddingTop: normalize(10),
    justifyContent: "flex-start",
  },
  title: {
    fontSize: normalize(26),
    fontWeight: "bold",
    color: COLORS.green,
    textAlign: "center",
    marginBottom: normalize(10),
  },
  subtitle: {
    fontSize: normalize(12),
    color: "#444",
    textAlign: "center",
    marginBottom: normalize(20),
  },
  addButton: {
    backgroundColor: COLORS.green,
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: "center",
    marginBottom: normalize(18),
  },
  formContainer: {
    backgroundColor: "#f3f3f3",
    borderRadius: normalize(10),
    padding: normalize(15),
    marginBottom: normalize(20),
    //maxHeight: normalize(500),
  },
  label: {
    fontSize: normalize(16),
    color: COLORS.green,
    marginBottom: normalize(4),
    marginTop: normalize(8),
  },
  input: {
    height: normalize(45),
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(10),
    marginBottom: normalize(8),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    color: "#222", // <-- negro para el texto introducido
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: normalize(10),
    marginBottom: normalize(40),
  },
  saveButton: {
    backgroundColor: COLORS.green,
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(8),
    flex: 1,
    marginRight: normalize(5),
    alignItems: "center",
    paddingBottom: normalize(12),
  },
  cancelButton: {
    backgroundColor: "#888",
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(8),
    marginLeft: normalize(5),
    alignItems: "center",
    paddingBottom: normalize(12),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
  },
  listTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: COLORS.green,
    marginBottom: normalize(8),
    marginTop: normalize(10),
    textAlign: "center",
  },
  list: {
    flex: 1,
    marginBottom: 0,
    maxHeight: undefined,
  },
  socioItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    borderRadius: normalize(8),
    padding: normalize(10),
    marginBottom: normalize(8),
  },
  socioText: {
    fontSize: normalize(15),
    color: "#222",
  },
  socioLabel: {
    fontWeight: "bold",
    color: "#222",
  },
  socioButtonsContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: normalize(10),
  },
  socioButtonsRow: {
    flexDirection: "row",
    marginBottom: normalize(6),
  },
  editButton: {
    backgroundColor: "#1976D2",
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(6),
    marginRight: normalize(5),
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(6),
    alignItems: "center",
  },
  adminButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(6),
    alignItems: "center",
    marginLeft: normalize(5),
    width: normalize(110),
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  adminButtonText: {
    color: COLORS.white,
    fontSize: normalize(12),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: normalize(16),
  },
  removeAdminButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(6),
    alignItems: "center",
    marginLeft: normalize(5),
    width: normalize(110),
    alignSelf: "flex-end",
    marginTop: normalize(4),
    justifyContent: "center",
  },
  removeAdminButtonText: {
    color: COLORS.white,
    fontSize: normalize(12),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: normalize(16),
  },
  backButton: {
    backgroundColor: "#888",
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: "center",
    marginTop: normalize(10),
    alignSelf: "center",
    width: "90%",
    position: "absolute",
    bottom: normalize(20),
    left: "5%",
  },
  espacioBarContainer: {
    marginBottom: normalize(18),
    width: "100%",
  },
  espacioBarLabel: {
    fontSize: normalize(14),
    color: "#222",
    marginBottom: normalize(4),
    textAlign: "center",
  },
  espacioBarBackground: {
    width: "100%",
    height: normalize(18),
    backgroundColor: "#e0e0e0",
    borderRadius: normalize(9),
    overflow: "hidden",
  },
  espacioBarFill: {
    height: "100%",
    backgroundColor: "#1976D2",
    borderRadius: normalize(9),
  },
});

// Estilos personalizados para el picker de filtro
const customPickerStyles = {
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: normalize(8),
    backgroundColor: "#fff",
    paddingHorizontal: normalize(12),
    height: normalize(45),
    marginBottom: normalize(8),
  },
  buttonText: {
    fontSize: normalize(14),
    color: "#222",
  },
  arrow: {
    fontSize: normalize(16),
    color: COLORS.green,
    marginLeft: normalize(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: normalize(10),
    paddingVertical: normalize(8),
    width: "70%",
    elevation: 5,
  },
  option: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(20),
  },
  optionText: {
    fontSize: normalize(14),
    color: "#222",
  },
};

export default AdminMenuScreen;