# Comunicación e Integración: Step Functions & EventBridge

En un ERP gigante, los módulos no deben llamarse entre sí directamente por HTTP. Usamos un patrón híbrido de **Orquestación** y **Coreografía**.

## 1. Orquestación con Step Functions (Interno)
Se utiliza para flujos de trabajo **dentro de un mismo dominio** (Ventas).

### ¿Cuándo usarlo?
*   Cuando el proceso tiene varios pasos (Venta -> Inventario -> Factura).
*   Cuando necesitas reintentos automáticos si falla un paso.
*   Cuando hay esperas (ej: esperar a que el ente fiscal apruebe una factura).

### Beneficios
*   **Visualización**: Puedes ver el estado del flujo en la consola de AWS.
*   **Manejo de Errores**: Fácil gestión de excepciones y flujos de compensación (Sagas).

## 2. Coreografía con EventBridge (Externo)
Se utiliza para la comunicación **entre diferentes módulos** (Ventas -> Contabilidad).

### El Flujo de Eventos
1.  El módulo de **Ventas** termina su trabajo y publica un evento `SaleCompleted` en el `ErpEventBus`.
2.  A Ventas **no le importa** quién escucha ese evento.
3.  El módulo de **Contabilidad** tiene una regla en EventBridge que dispara sus propios procesos cuando ve un `SaleCompleted`.

## 3. Modularización: Nested Stacks (Pilas Anidadas)
Para proyectos de gran escala, un solo `template.yaml` es inmanejable. Usamos una arquitectura de **Pilas Anidadas**:

### Estructura de Proyecto
*   **Root Template**: Orquestador central (`template.yaml`).
*   **Infrastructure Stacks**: `api.yaml`, `database.yaml`, `events.yaml`, `layers.yaml`.
*   **Business Stacks**: `sales-module.yaml` (contiene Lambdas y Step Functions del dominio).

### Beneficios
*   **Escalabilidad**: Evita el límite de 500 recursos de CloudFormation.
*   **Aislamiento**: Los cambios en la API no afectan la base de datos.
*   **Reutilización**: Los componentes de infraestructura se definen una sola vez.

## 4. Gobernanza de API: OpenAPI 3.0 & Validación
La definición de la API se desacopla de la infraestructura de AWS mediante archivos de especificación externa.

### El "Contrato" de API
*   **Definición Externa**: Ubicada en `infrastructure/api/sales-api.yaml`.
*   **Validación de Esquema**: API Gateway valida el JSON contra un esquema definido (JSON Schema) antes de invocar a la Lambda. Esto ahorra costes y asegura que el código de negocio siempre reciba datos válidos.
*   **Manejo de CORS**: Implementado mediante integraciones `mock` en API Gateway para respuestas de preflight (`OPTIONS`) ultrarrápidas y económicas.

## 5. Patrón Transactional Outbox
Para asegurar que los eventos se envían **solo si** la base de datos se actualizó correctamente, se recomienda:
1.  Activar **DynamoDB Streams** en la tabla de Ventas.
2.  Una Lambda de "Relevo" lee el stream y publica en **EventBridge**.

Esto garantiza consistencia eventual sin acoplar la lógica de guardado con el envío de eventos.
