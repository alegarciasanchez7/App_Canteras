import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "./AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import appFirebase from "./credenciales";

// Relación de aspecto de la plantilla de la tarjeta
const CARD_RATIO = 320 / 200;
const db = getFirestore(appFirebase);

// Pantalla que muestra la tarjeta virtual del usuario
const TarjetaVirtualScreen = ({ route, navigation }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const { dni } = route.params;
  const { width, height } = useWindowDimensions();

  // Estado para los datos del usuario y carga
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga los datos del usuario desde Firestore al montar el componente
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const userRef = doc(db, "socios", dni);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsuario(userSnap.data());
        } else {
          setUsuario(null);
        }
      } catch (error) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [dni]);

  // Si el usuario no está logueado, muestra mensaje de error
  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No tienes acceso a esta página.</Text>
      </View>
    );
  }

  // Si está cargando, muestra un spinner
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Si no se encuentra el usuario, muestra mensaje de error
  if (!usuario) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se encontró el usuario.</Text>
      </View>
    );
  }

  // Calcula el tamaño máximo de la tarjeta para que ocupe casi toda la pantalla
  const margin = 32;
  const tarjetaHeight = width - margin * 2;
  const tarjetaWidth = tarjetaHeight * CARD_RATIO;

  // Estilos proporcionales para los textos de la tarjeta
  const numeroSocioStyle = {
    position: "absolute",
    top: tarjetaHeight * 0.385,
    left: tarjetaWidth * 0.34,
    fontSize: tarjetaHeight * 0.07,
    color: "#222",
    fontWeight: "bold",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  };

  const dniStyle = {
    position: "absolute",
    top: tarjetaHeight * 0.515,
    left: tarjetaWidth * 0.2,
    fontSize: tarjetaHeight * 0.07,
    color: "#222",
    fontWeight: "bold",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  };

  const nombreStyle = {
    position: "absolute",
    bottom: tarjetaHeight * 0.1,
    left: tarjetaWidth * 0.065,
    fontSize: tarjetaHeight * 0.06,
    width: tarjetaWidth * 0.5,
    color: "#222",
    fontWeight: "bold",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  };

  // Contenedor rotado para mostrar la tarjeta en horizontal
  const landscapeContainer = {
    width: height,
    height: width,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    position: "relative",
  };

  // Posición del botón "Volver" en la esquina inferior derecha (ya rotado)
  const botonAbajoDerecha = {
    position: "absolute",
    bottom: margin,
    right: margin,
    zIndex: 2,
  };

  // Renderizado de la tarjeta virtual
  return (
    <View
      style={[
        styles.container,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <View style={landscapeContainer}>
        <ImageBackground
          source={require("./assets/template.png")}
          style={[
            styles.tarjeta,
            { width: tarjetaWidth, height: tarjetaHeight },
          ]}
          imageStyle={{ borderRadius: 24 }}
        >
          <Text style={numeroSocioStyle}>{usuario.NumeroSocio}</Text>
          <Text style={dniStyle}>{usuario.DNI}</Text>
          <Text style={nombreStyle}>{usuario.Nombre}</Text>
        </ImageBackground>
        <Pressable
          style={[styles.backButton, botonAbajoDerecha]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  tarjeta: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  texto: {
    color: "#222",
    fontWeight: "bold",
    position: "absolute",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  numeroSocio: {
    top: 135,
    left: 180,
    fontSize: 24,
  },
  dni: {
    top: 178,
    left: 105,
    fontSize: 24,
  },
  nombre: {
    bottom: 30,
    left: 32,
    fontSize: 24,
    width: 300,
  },
  backButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TarjetaVirtualScreen;
