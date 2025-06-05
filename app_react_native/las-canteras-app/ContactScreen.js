import React from "react";
import { StyleSheet, Text, View, Pressable, Linking } from "react-native";

// Definición de colores usados en la pantalla
const COLORS = {
  green: "#4CAF50",
  white: "#fff",
  background: "#f9f9f9",
};

// Pantalla de contacto de la asociación
const ContactScreen = ({ navigation, route }) => {
  // Obtiene el nombre del usuario desde los parámetros de navegación (si existe)
  const nombre = route.params?.nombre || "";

  // Función para abrir el cliente de correo con la dirección de la asociación
  const handleEmailPress = () => {
    Linking.openURL("mailto:laskanteras@gmail.com");
  };

  // Función para iniciar una llamada telefónica al número de la asociación
  const handlePhonePress = () => {
    Linking.openURL("tel:+34956837797");
  };

  // Renderizado de la pantalla de contacto
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Contacto</Text>

      {/* Botón para enviar correo electrónico */}
      <Pressable style={styles.infoButton} onPress={handleEmailPress}>
        <Text style={styles.infoText}>Correo: laskanteras@gmail.com</Text>
      </Pressable>

      {/* Botón para llamar por teléfono */}
      <Pressable style={styles.infoButton} onPress={handlePhonePress}>
        <Text style={styles.infoText}>Teléfono: +34 956 83 77 97</Text>
      </Pressable>

      {/* Botón para navegar a la pantalla de citas */}
      <Pressable
        style={styles.actionButton}
        onPress={() => navigation.navigate("Citas", { nombre })}
      >
        <Text style={styles.actionButtonText}>Pedir Cita con Isabel</Text>
      </Pressable>

      {/* Botón para volver atrás */}
      <Pressable
        style={[styles.actionButton, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.actionButtonText}>Volver Atrás</Text>
      </Pressable>
    </View>
  );
};

// Estilos para la pantalla y componentes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.green,
    marginBottom: 30,
  },
  infoButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#888", // Color diferente para el botón de volver atrás
  },
});

export default ContactScreen;
