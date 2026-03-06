# Gobernanza de API: OpenAPI, Validación y CORS

En este proyecto, la API no es solo un "disparador" de Lambdas; es el **contrato formal** entre el sistema y el mundo exterior.

## 1. OpenAPI 3.0.1 (Swagger)
Utilizamos el estándar OpenAPI de forma **explícita**. Esto significa que la definición de rutas, esquemas de datos y respuestas no está enterrada en el código, sino documentada en archivos YAML especializados.

### Estructura de Definición
*   **API Principal**: `infrastructure/api.yaml` (referencia la configuración de AWS como logs y permisos).
*   **Contrato de Datos**: `infrastructure/api/sales-api.yaml` (contiene la lógica de negocio de la API).

## 2. Validación de Request (Escudo de Red)
Implementamos el patrón **Request Validation** directamente en API Gateway.

### ¿Cómo funciona?
1.  **JSON Schema**: Se define un esquema formal (`CreateSaleRequest`) con tipos de datos, longitudes mínimas/máximas y campos obligatorios.
2.  **Rechazo Automático**: Si el cliente envía un dato inválido (ej: precio negativo), API Gateway responde con un **400 Bad Request** sin activar la Lambda.
3.  **Beneficios**:
    *   **Ahorro de computación**: Menos tráfico y ejecuciones innecesarias en Lambda.
    *   **Código Limpio**: La capa de Aplicación de tu código hexagonal no necesita validar si un campo es `string` o `number`.

## 3. Manejo de CORS (Cloud-Native)
El problema de CORS se soluciona de la forma más eficiente posible: **Mock Integrations**.

### Ventajas de esta solución:
*   **Velocidad**: API Gateway responde al `OPTIONS` (preflight) en milisegundos sin latencia de Lambda.
*   **Coste**: Las respuestas de tipo `mock` son prácticamente gratuitas, al contrario de disparar una Lambda para cada preflight.
*   **Centralización**: Todos los dominios permitidos y headers se gestionan en el YAML de la API.

## 4. Soporte para Objetos Dinámicos
OpenAPI nos permite ser estrictos en lo importante y flexibles en lo secundario:
*   **`required: []`**: Define los campos vitales.
*   **`additionalProperties: true`**: Permite que objetos anidados (como `additionalMetadata`) reciban cualquier campo extra sin que la validación falle.

---
**Tip Senior**: Usa esta documentación para que el equipo de Frontend sepa exactamente qué enviar sin tener que preguntarte.
