import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Linking,
  StatusBar,
  Dimensions,
  PixelRatio,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lista de DNIs de administradores
const ADMIN_DNIS = ["75785723X", "31310901N"];

// Paleta de colores usada en la pantalla
const COLORS = {
  background: "#fff",
  green: "#4CAF50",
  white: "#fff",
};

// Imágenes usadas en los botones
const IMAGES = {
  card: require("./assets/id-card.png"),
  web: require("./assets/globe.png"),
  convenios: require("./assets/handshake.png"),
  correo: require("./assets/sobre.png"),
  user: require("./assets/user.png"),
  settings: require("./assets/settings.png"),
};

// Función para escalado responsivo según el ancho de pantalla
const { width } = Dimensions.get("window");
const scale = width / 375;
function normalize(size) {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}

// Pantalla principal tras el login
const HomeScreen = ({ navigation, route }) => {
  // Estado para el usuario actual
  const [user, setUser] = React.useState({ nombre: "", dni: "" });
  const insets = useSafeAreaInsets();

  // Carga el usuario desde los parámetros de navegación o desde almacenamiento local
  React.useEffect(() => {
    async function loadUser() {
      if (route.params?.nombre && route.params?.dni) {
        setUser({ nombre: route.params.nombre, dni: route.params.dni });
      } else {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser({ nombre: parsed.nombre, dni: parsed.dni });
        }
      }
    }
    loadUser();
  }, [route.params]);

  // Determina si el usuario es administrador
  const isAdmin = ADMIN_DNIS.includes(user.dni);

  // Botón superior: lleva siempre a la pantalla de cambio de contraseña
  const handleUserButton = () => {
    navigation.navigate("ChangePasswordScreen", { dni: user.dni });
  };

  // Botón especial para admin: navega a la gestión de socios
  const handleAdminGestion = () => {
    navigation.navigate("AdminMenuScreen", { nombre: user.nombre, dni: user.dni });
  };

  // Botón para mostrar la tarjeta virtual del usuario
  const handleTarjetaVirtual = () => {
    if (user.dni) {
      navigation.navigate("TarjetaVirtualScreen", { dni: user.dni });
    } else {
      alert("No se encontró el DNI del usuario.");
    }
  };

  // Renderizado de la pantalla principal
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.green }}>
      <StatusBar backgroundColor={COLORS.green} barStyle="light-content" />
      {/* Barra superior con logo, título y botón de usuario */}
      <View style={[styles.topSection, { paddingTop: insets.top, height: normalize(70) + insets.top }]}>
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
          style={styles.loginButton}
          onPress={handleUserButton}
        >
          <Image
            source={IMAGES.user}
            style={styles.loginButtonIcon}
          />
        </Pressable>
      </View>
      {/* Sección principal con botones de navegación */}
      <View style={styles.container}>
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeText}>Hola {user.nombre || "Usuario"}</Text>
          <View style={styles.buttonRow}>
            {/* Botón para carnet virtual */}
            <Pressable style={styles.button} onPress={handleTarjetaVirtual}>
              <Image source={IMAGES.card} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Carnet de socio virtual</Text>
            </Pressable>
            {/* Botón para la web */}
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://asociacionlascanteras.org")}
            >
              <Image source={IMAGES.web} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Página Web</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            {/* Botón para convenios */}
            <Pressable
              style={styles.button}
              onPress={() =>
                Linking.openURL("https://asociacionlascanteras.org/convenios/")
              }
            >
              <Image source={IMAGES.convenios} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Convenios</Text>
            </Pressable>
            {/* Botón especial para admin o contacto */}
            {isAdmin ? (
              <Pressable
                style={styles.button}
                onPress={handleAdminGestion}
              >
                <Image
                  source={require("./assets/settings.png")}
                  style={[styles.buttonIcon, { marginBottom: 0, marginRight: 6 }]}
                />
                <Text style={styles.buttonText}>Gestión de socios</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.button}
                onPress={() => navigation.navigate("Contacto", { nombre: user.nombre })}
              >
                <Image source={IMAGES.correo} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Contacto</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Estilos para la pantalla y componentes
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: normalize(20),
    width: "100%",
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
    justifyContent: "center",
    marginLeft: normalize(20),
  },
  loginButton: {
    backgroundColor: COLORS.green,
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(8),
    marginRight: normalize(-15),
  },
  loginButtonIcon: {
    width: normalize(35),
    height: normalize(35),
  },
  bottomSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: normalize(20),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.green,
    marginHorizontal: normalize(10),
    justifyContent: "center",
    alignItems: "center",
    height: normalize(100),
    borderRadius: normalize(8),
  },
  buttonIcon: {
    width: normalize(30),
    height: normalize(30),
    marginBottom: normalize(5),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: COLORS.green,
    textAlign: "center",
    marginBottom: normalize(20),
  },
});

export default HomeScreen;
