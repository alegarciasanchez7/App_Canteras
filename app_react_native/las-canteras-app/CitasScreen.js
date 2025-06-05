import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as MailComposer from "expo-mail-composer";

// Definición de colores usados en la pantalla
const COLORS = {
  green: "#4CAF50",
  white: "#fff",
  background: "#f9f9f9",
};

// Pantalla para solicitar una cita
const CitasScreen = ({ navigation, route }) => {
  // Estados para la fecha, hora, motivo y correo electrónico
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Nombre del usuario recibido por parámetros de navegación
  const nombreUsuario = route.params?.nombre || "";

  // Maneja el cambio de fecha seleccionada
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const today = new Date();
      const oneWeekFromToday = new Date();
      oneWeekFromToday.setDate(today.getDate() + 7);

      // Solo permite fechas de lunes a viernes y con al menos una semana de antelación
      if (
        date >= oneWeekFromToday &&
        date.getDay() >= 1 &&
        date.getDay() <= 5
      ) {
        setSelectedDate(date);
      } else {
        Alert.alert(
          "Fecha no válida",
          "Por favor selecciona un día válido (lunes a viernes, con al menos una semana de margen).",
        );
      }
    }
  };

  // Maneja el cambio de hora seleccionada
  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      // Permite solo horas entre las 9:30 y las 13:30 (inclusive)
      const isAfterStart =
        (hours > 9) || (hours === 9 && minutes >= 30);
      const isBeforeEnd =
        (hours < 13) || (hours === 13 && minutes === 0);
      if (isAfterStart && isBeforeEnd) {
        setSelectedTime(time);
      } else {
        Alert.alert(
          "Hora no válida",
          "Por favor selecciona una hora entre las 9:30 y las 13:00.",
        );
      }
    }
  };

  // Maneja el envío de la solicitud de cita por correo electrónico
  const handleCreateEvent = async () => {
    // Valida que todos los campos estén completos
    if (!selectedDate || !selectedTime || !title || !email) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    // Formatea la fecha y la hora seleccionadas
    const fecha = selectedDate.toLocaleDateString();
    const hora = selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Cuerpo del correo electrónico
    const body =
      `Nombre del socio: ${nombreUsuario}\n\n` +
      `Motivo: ${title}\n\n` +
      `Fecha: ${fecha}\n\n` +
      `Hora: ${hora}\n\n` +
      `Email de contacto: ${email}`;

    // Opciones para el envío del correo
    const options = {
      recipients: ["laskanteras@gmail.com"], // destinatario fijo
      subject: "Solicitud de cita",
      body,
    };

    // Abre el cliente de correo con los datos pre-rellenados
    const result = await MailComposer.composeAsync(options);

    // Muestra mensajes según el resultado del envío
    if (result.status === "sent") {
      Alert.alert("Éxito", "El correo se ha enviado correctamente.");
      navigation.goBack();
    } else {
      Alert.alert("Info", "El correo no se ha enviado.");
    }
  };

  // Renderizado de la pantalla
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Cita con Isabel</Text>

      {/* Requisitos para solicitar una cita */}
      <View style={styles.requisitosBox}>
        <Text style={styles.requisitosTitle}>
          Requisitos para solicitar una cita:
        </Text>
        <Text style={styles.requisitoItem}>
          • Selecciona una fecha con al menos una semana de antelación.
        </Text>
        <Text style={styles.requisitoItem}>
          • Solo se permiten citas de lunes a viernes.
        </Text>
        <Text style={styles.requisitoItem}>
          • Elige una hora entre las 09:30 y las 13:00.
        </Text>
      </View>

      {/* Selección de fecha */}
      <Pressable
        style={styles.inputButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>
          {selectedDate
            ? selectedDate.toLocaleDateString()
            : "Selecciona una fecha"}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Selección de hora */}
      <Pressable
        style={styles.inputButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.inputText}>
          {selectedTime
            ? selectedTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Selecciona una hora"}
        </Text>
      </Pressable>
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Campo para el motivo de la cita */}
      <TextInput
        style={styles.input}
        placeholder="Motivo de la cita"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#4CAF50" // Verde para contraste
      />

      {/* Campo para el correo electrónico */}
      <TextInput
        style={styles.input}
        placeholder="Tu correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#4CAF50" // Verde para contraste
      />

      {/* Botón para crear el evento */}
      <Pressable style={styles.actionButton} onPress={handleCreateEvent}>
        <Text style={styles.actionButtonText}>Pedir Cita</Text>
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
  requisitosBox: {
    backgroundColor: "#eafbe7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  requisitosTitle: {
    fontWeight: "bold",
    color: COLORS.green,
    marginBottom: 4,
    fontSize: 16,
  },
  requisitoItem: {
    color: "#222",
    fontSize: 14,
    marginBottom: 2,
  },
  inputButton: {
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
  inputText: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#4CAF50", // Verde para mejor contraste
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff", // Fondo blanco para contraste
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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

export default CitasScreen;
