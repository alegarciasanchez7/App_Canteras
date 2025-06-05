import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import appFirebase from "./credenciales";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definición de colores usados en la pantalla
const COLORS = {
  background: "#fff",
  green: "#4CAF50",
  white: "#fff",
};

// Inicializa la base de datos Firestore
const db = getFirestore(appFirebase);

// Pantalla para cambiar la contraseña del usuario
const ChangePasswordScreen = ({ route, navigation }) => {
  // Obtiene el DNI del usuario desde los parámetros de navegación
  const { dni } = route.params;
  // Estados para los campos del formulario
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const insets = useSafeAreaInsets();

  // Función que gestiona el cambio de contraseña
  const handleChangePassword = async () => {
    // Validación de campos vacíos
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    // Validación de coincidencia de la nueva contraseña
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    try {
      // Obtiene el documento del usuario en Firestore
      const userRef = doc(db, "socios", dni);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        Alert.alert("Error", "Usuario no encontrado.");
        return;
      }
      const userData = userSnap.data();
      // Comprueba si la contraseña actual es correcta (sin cifrado)
      if (userData.password !== currentPassword) {
        Alert.alert("Error", "La contraseña actual es incorrecta.");
        return;
      }
      // Actualiza la contraseña en Firestore
      await updateDoc(userRef, { password: newPassword });
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
      console.error(error);
    }
  };

  // Función para cerrar sesión y volver a la pantalla de login
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // Renderizado de la pantalla
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.green }}>
      <StatusBar backgroundColor={COLORS.green} barStyle="light-content" />
      {/* Barra superior con logo y título */}
      <View style={[styles.topSection, { paddingTop: insets.top, height: 70 + insets.top }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Cer5iYbPOns_D6mT3n6EavW114x1QYHlbg&s",
            }}
            style={styles.image}
          />
        </View>
        <Text style={styles.titleText}>Las Canteras</Text>
        <View style={styles.loginButtonPlaceholder} />
      </View>
      {/* Contenido principal */}
      <View style={styles.container}>
        <Text style={styles.title}>Cambiar Contraseña</Text>
        {/* Campo para la contraseña actual */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña actual"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor="#4CAF50"
        />
        {/* Campo para la nueva contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#4CAF50"
        />
        {/* Campo para confirmar la nueva contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#4CAF50"
        />
        {/* Botón para actualizar la contraseña */}
        <Pressable style={styles.updateButton} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Actualizar Contraseña</Text>
        </Pressable>
        {/* Botones para volver atrás y cerrar sesión */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Volver Atrás</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Estilos para la pantalla y componentes
const styles = StyleSheet.create({
  topSection: {
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    width: "100%",
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginLeft: 20,
  },
  loginButtonPlaceholder: {
    width: 45,
    height: 45,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.green,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#4CAF50",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  backButton: {
    backgroundColor: "#888",
    marginRight: 5,
  },
  logoutButton: {
    backgroundColor: "#D32F2F",
    marginLeft: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChangePasswordScreen;
