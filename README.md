# App Canteras

Este proyecto incluye una aplicación móvil desarrollada con React Native. Permite a los usuarios gestionar citas, visualizar tarjetas virtuales y administrar socios.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas y herramientas:

1. **Node.js** (versión 16 o superior) y `npm` (incluido con Node.js). [https://nodejs.org/en](https://nodejs.org/en)
2. **Expo CLI** (para ejecutar la aplicación React Native):  
   ```bash
   npm install -g expo-cli
   ```
3. **Git** (para clonar el repositorio).

---

## Configuración del proyecto

### 1. Clonar el repositorio

Clona este repositorio en tu máquina local:

```bash
git clone https://github.com/alegarciasanchez7/App_Canteras.git
cd App_Canteras
```

---

### 2. Configuración de la aplicación React Native

#### a. Instalar dependencias de Node.js

Navega a la carpeta [`app_react_native/las-canteras-app`](app_react_native/las-canteras-app):

```bash
cd app_react_native/las-canteras-app
npm install
```

#### b. Configurar credenciales y archivos sensibles

Por seguridad, los archivos con claves y credenciales no están incluidos en el repositorio.  
Debes copiar `credenciales_template.js` a `credenciales.js` y rellenar tus datos de Firebase.  
Haz lo mismo con cualquier otro archivo de configuración sensible.

#### c. Ejecutar la aplicación

Inicia la aplicación con Expo:

```bash
npm start
```

Escanea el código QR con la aplicación Expo Go en tu dispositivo móvil o ejecuta la aplicación en un emulador.

---

## Estructura del proyecto

```plaintext
App_Canteras/
├── app_react_native/
│   ├── las-canteras-app/
│   │   ├── App.js
│   │   ├── CitasScreen.js
│   │   ├── ContactScreen.js
│   │   ├── HomeScreen.js
│   │   ├── AdminMenuScreen.js
│   │   ├── ChangePasswordScreen.js
│   │   ├── TarjetaVirtualScreen.js
│   │   ├── AuthContext.js
│   │   ├── calcularEspacio.js
│   │   ├── credenciales.js
│   │   ├── credencial-cloud.json
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── package.json
│   │   ├── assets/
│   │   └── ...
```

---

## Notas importantes

- **Credenciales:**  
  No compartas tus archivos `credenciales.js` ni `credencial-cloud.json`. Usa plantillas y sigue las instrucciones de configuración.

---

## Comandos útiles

### Para la aplicación React Native

- Instalar dependencias:
  ```bash
  npm install
  ```
- Iniciar Expo:
  ```bash
  npm start
  ```

---

## Builds de producción

Para crear una build de la app con tu cuenta de Expo:

```bash
npx expo login
npx eas build --platform android
npx eas build --platform ios
```

---

## Seguridad y colaboración

- Los archivos sensibles están en `.gitignore`.

---
