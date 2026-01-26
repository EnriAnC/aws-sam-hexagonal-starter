# Estrategia de Base de Datos y Multi-Tenancy

En un ERP gigante saas, el manejo de la base de datos es el mayor cuello de botella. Esta arquitectura implementa dos patrones clave:

## 1. Singleton Connection Pool (Global Scope)
AWS Lambda puede reutilizar "Contextos de Ejecución". aprovechamos esto definiendo el pool fuera del handler.

*   **Cold Start**: La conexión se crea.
*   **Warm Start**: La conexión se reutiliza, ahorrando ~200ms de handshake de red.

## 2. Dynamic Tiered Pooling
Implementamos un caché basado en `Map` para manejar diferentes niveles de servicio (Free, Middle, Premium) dentro de una misma Lambda.

```typescript
const cachedPools = new Map<ServiceTier, mssql.ConnectionPool>();
```

### Por qué usar un Map?
*   Si una Lambda atiende secuencialmente a un cliente Free y luego a un Premium, ambos pools quedan calientes en memoria.
*   Permite asignar recursos proporcionalmente (ej: 1 conexión para Free, 15 para Premium).

## 3. Ubicación del Código de DB
Aunque la conexión a SQL Server parece algo general, hemos movido la lógica a `src/modules/sales/infrastructure/database.ts`.

**Razón**: El principio de **Independencia de Módulos**. 
Si el módulo de Ventas decide cambiar sus parámetros de conexión o su motor de base de datos, no debe arriesgar la estabilidad de otros módulos compartiendo un archivo central de base de datos. Cada módulo es dueño de su conexión.
