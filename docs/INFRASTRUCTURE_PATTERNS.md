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

## 3. Patrón Transactional Outbox
Para asegurar que los eventos se envían **solo si** la base de datos se actualizó correctamente, se recomienda:
1.  Activar **DynamoDB Streams** en la tabla de Ventas.
2.  Una Lambda de "Relevo" lee el stream y publica en **EventBridge**.

Esto garantiza consistencia eventual sin acoplar la lógica de guardado con el envío de eventos.
