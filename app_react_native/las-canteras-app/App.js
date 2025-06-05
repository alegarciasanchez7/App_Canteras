// Importaciones principales de React y librerías necesarias
import React, { useState, useEffect, useContext } from "react";
import { StatusBar, Text, TextInput, View, Pressable, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import ContactScreen from "./ContactScreen";
import TarjetaVirtualScreen from "./TarjetaVirtualScreen";
import CitasScreen from "./CitasScreen";
import { AuthContext } from "./AuthContext";
import ChangePasswordScreen from "./ChangePasswordScreen";
import AdminMenuScreen, { cifrar, descifrar } from "./AdminMenuScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importar firebase y utilidades de Firestore
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import appFirebase from "./credenciales";

// Inicializa la base de datos Firestore
const db = getFirestore(appFirebase);

// Crea el stack de navegación
const Stack = createNativeStackNavigator();

// Pantalla de Login
const LoginScreen = ({ navigation }) => {
  const [dni, setDni] = useState(""); // Estado para el NIF/DNI
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const { setIsLoggedIn } = useContext(AuthContext); // Contexto de autenticación

  // Función que maneja el login del usuario
  const handleLogin = async () => {
    try {
      // Consulta la colección de socios buscando el DNI introducido
      const sociosRef = collection(db, "socios");
      const q = query(sociosRef, where("DNI", "==", dni.trim()));
      const querySnapshot = await getDocs(q);

      // Si no existe el usuario, muestra error
      if (querySnapshot.empty) {
        alert("DNI o contraseña incorrectos.");
        return;
      }

      // Obtiene los datos del usuario y descifra la contraseña
      const userData = querySnapshot.docs[0].data();
      const passwordReal = descifrar(userData.password);

      // Comprueba si la contraseña es correcta
      if (passwordReal === password.trim()) {
        // Login correcto: guarda sesión y navega a Home
        setIsLoggedIn(true);
        await AsyncStorage.setItem("user", JSON.stringify({
          nombre: userData.Nombre,
          dni: userData.DNI,
        }));
        navigation.navigate("Home", { nombre: userData.Nombre, dni: userData.DNI });
      } else {
        alert("DNI o contraseña incorrectos.");
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  // Renderiza la interfaz de login
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* Logo de la asociación */}
      <Image
        source={require("./assets/logo.jpeg")}
        style={{
          width: 100,
          height: 100,
          marginBottom: 20,
        }}
        resizeMode="cover"
      />
      {/* Título */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          width: 200,
          alignContent: "center",
          textAlign: "center",
        }}
      >
        Iniciar Sesión
      </Text>
      {/* Campo de texto para el NIF */}
      <TextInput
        style={{
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
        }}
        placeholder="Ingrese su NIF"
        placeholderTextColor="#4CAF50"
        autoCapitalize="characters"
        value={dni}
        onChangeText={setDni}
      />
      {/* Campo de texto para la contraseña */}
      <TextInput
        style={{
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
        }}
        placeholder="Ingrese su contraseña"
        placeholderTextColor="#4CAF50"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Oculta la contraseña
      />
      {/* Botón para iniciar sesión */}
      <Pressable
        style={{
          backgroundColor: "#4CAF50",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        }}
        onPress={handleLogin}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Iniciar Sesión
        </Text>
      </Pressable>
    </View>
  );
};

// Componente principal que gestiona la navegación y la sesión
const MyStack = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Al montar, revisa si hay sesión guardada
  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) setIsLoggedIn(true);
    };
    checkSession();
  }, []);

  // Provee el contexto de autenticación y define las rutas de la app
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
        <Stack.Navigator>
          {/* Pantalla de Login */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla principal tras login */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla de contacto */}
          <Stack.Screen
            name="Contacto"
            component={ContactScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla de citas */}
          <Stack.Screen
            name="Citas"
            component={CitasScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla de tarjeta virtual */}
          <Stack.Screen
            name="TarjetaVirtualScreen"
            component={TarjetaVirtualScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla para cambiar contraseña */}
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />
          {/* Pantalla de administración (solo para admins) */}
          <Stack.Screen
            name="AdminMenuScreen"
            component={AdminMenuScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default MyStack;
