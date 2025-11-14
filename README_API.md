# Estructura Modular de la API

La aplicación usa servicios modulares organizados por funcionalidad.

## 📁 Estructura de Archivos

```
src/api/
├── apiClient.js       # Cliente Axios base con JWT
├── chatService.js     # Servicios de chat/predicción
├── promptService.js   # CRUD de plantillas de prompts
├── clientService.js   # Gestión de clientes (admin)
├── configService.js   # Configuración del modelo (localStorage)
├── base44Client.js    # Adapter de compatibilidad (para no romper código existente)
└── index.js           # Exports centralizados
```

## 🔧 Configuración

`.env`:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_JWT_TOKEN=tu_token_jwt
VITE_ADMIN_API_KEY=tu_admin_key
```

## 📝 Uso de los Servicios

### chatService

```javascript
import { chatService } from "@/api";

const response = await chatService.sendMessage({
  prompt: "Hola",
  temperature: 1,
  systemInstructions: "Eres un asistente útil",
  imageBase64: null,
  sessionId: "session_123",
});
// Responde: { full_response, metrics }
```

### promptService

```javascript
import { promptService } from "@/api";

// Listar
const templates = await promptService.list();

// Crear
await promptService.create({
  name: "Mi plantilla",
  description: "Descripción",
  prompt: "Texto del prompt",
});

// Actualizar
await promptService.update(id, { name: "Nuevo nombre" });

// Eliminar
await promptService.delete(id);
```

### clientService

```javascript
import { clientService } from "@/api";

await clientService.createSecret("client_name", "secret_key");
await clientService.updateSecret("client_name", "new_secret");
await clientService.deleteSecret("client_name");
```

### configService

```javascript
import { configService } from "@/api";

const config = configService.get(); // { temperature, system_instructions }
configService.save({ temperature: 0.8 });
```

## 🗑️ Archivos Eliminados

- ❌ `entities.js` - Ya no se usa
- ❌ `integrations.js` - Ya no se usa
- ❌ SDK `@base44/sdk` - Reemplazado por servicios modulares

## ✅ Ventajas de la Modularización

- **Separación de responsabilidades**: Cada servicio maneja su funcionalidad
- **Fácil mantenimiento**: Cambios aislados por módulo
- **Reutilizable**: Los servicios se pueden importar directamente
- **Testeable**: Cada servicio se puede probar independientemente
