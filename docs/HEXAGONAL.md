# Arquitectura Hexagonal Granular (Ports & Adapters)

Esta arquitectura separa el sistema en capas con responsabilidades claras, ideal para un ERP de gran escala.

## 1. Domain (Núcleo)
Ubicación: `src/modules/{modulo}/domain`

Es la lógica pura del negocio.
*   **Entities**: Modelos de datos de negocio (`Sale`, `Product`).
*   **Ports**: Interfaces que definen los contratos para el mundo exterior (`ISaleRepository`).

## 2. Application (Casos de Uso)
Ubicación: `src/modules/{modulo}/application`

Orquesta el dominio para cumplir los objetivos del sistema.
*   **Use Cases**: Clases que implementan la lógica de un proceso (ej: `CreateSaleUseCase`). Reciben inputs tipados y coordinan entidades y puertos.

### Inbound (Entrada)
Ubicación: `src/modules/{modulo}/adapters/inbound/{nombre-lambda}/`

Cada Lambda tiene su propia carpeta para evitar que los archivos crezcan desmesuradamente en la raíz.
*   **handler.ts**: El punto de entrada de AWS (contiene la función `handler`).
*   **dto.ts**: Data Transfer Objects. Define y valida la estructura que esperamos recibir del mundo exterior.
*   **validator.ts**: (Opcional) Si la validación (ej: Zod) es muy extensa.
*   **mapper.ts**: (Opcional) Si necesitamos transformar el DTO al objeto que espera el caso de uso de la aplicación.

### Outbound (Salida)
*   **Repositories**: Implementaciones técnicas de los puertos (DynamoDB, SQL Server).

## 4. Infrastructure (Tecnología)
Ubicación: `src/modules/{modulo}/infrastructure`

Herramientas técnicas específicas del módulo, como el cliente de conexión a base de datos o helpers de pooling.

## 5. Shared (Transversal)
Ubicación: `src/shared`

Código técnico no relacionado con el negocio que se reutiliza en todo el ERP (Logger, Middleware de Errores, Clientes de Eventos).

---

## 🎨 Diagrama del Refactor Maestro

```mermaid
graph TD
    AWS[Event: API/SQS/StepFunction] --> IN[Adapter Inbound: Handler]
    IN --> VAL[DTO Validation]
    VAL --> UC[Application: Use Case]
    UC --> ENT[Domain: Entity]
    UC --> PRT[Domain: Port Interface]
    PRT --> OUT[Adapter Outbound: Repository]
    OUT --> INF[Infrastructure: DB Helper]
    INF --> DB[(Database)]
    UC -.-> LOG[Shared: Logger]
```
