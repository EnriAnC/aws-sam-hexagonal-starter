# ERP Serverless - Módulo de Ventas (AWS SAM + Hexagonal Architecture)

Este repositorio contiene la arquitectura de referencia para la refactorización de un ERP gigante hacia un sistema serverless escalable, limpio y mantenible. Se utiliza **AWS SAM** con **TypeScript**, **esbuild** y **Step Functions**.

## 📖 Documentación Detallada

Para facilitar la adopción y replicación del sistema, consulta las siguientes guías:

*   [**Arquitectura Hexagonal & DDD**](./docs/HEXAGONAL.md): Capas, responsabilidades y flujo de datos.
*   [**Patrones de Infraestructura**](./docs/INFRASTRUCTURE_PATTERNS.md): Integración con Step Functions y EventBridge.
*   [**Estrategia de Build & Layers**](./docs/BUILDS.md): Configuración de esbuild, SAM y manejo de librerías pesadas.
*   [**Bases de Datos & Multi-Tenancy**](./docs/DATABASE_TIERS.md): Pooling dinámico y optimización de conexiones.

## 🏛️ Arquitectura y Orquestación

El proyecto implementa la **Arquitectura Hexagonal (Puertos y Adaptadores)** y el **Diseño Dirigido por Dominios (DDD)**, orquestando procesos complejos mediante **AWS Step Functions**.

### Capas de la Aplicación

1.  **Dominio (`src/modules/sales/domain`)**: El corazón del sistema. Contiene entidades de negocio (`Sale`, `SaleItem`) e interfaces/puertos (`ISaleRepository`). No tiene dependencias externas.
2.  **Aplicación (`src/modules/sales/application`)**: Implementa los Casos de Uso (`CreateSaleUseCase`). Orquesta el flujo llamando a servicios de dominio y puertos.
3.  **Adaptadores Inbound (`src/modules/sales/adapters/inbound`)**: Handlers de Lambda que actúan como puntos de entrada (API Gateway, eventos internos).
4.  **Adaptadores Outbound (`src/modules/sales/adapters/outbound`)**: Implementaciones técnicas de los puertos. Ejemplo: `DynamoDBSaleRepository` y `SqlServerSaleRepository`.
5.  **Infraestructura (`src/modules/sales/infrastructure`)**: Configuración técnica transversal, como el `database.ts` para el pooling de conexiones.

### 🔄 Flujo de Orquestación (Saga Pattern)

El proceso de venta se gestiona mediante el `SalesOrchestrator` (Step Functions):
1.  **CreateSale**: Valida la petición y arranca la máquina de estados.
2.  **ProcessInventory**: Actualiza el stock en la base de datos corporativa (SQL Server).
3.  **EmitInvoice**: Genera la factura legal (SQL Server).
4.  **EventBridge Notification**: Notifica a otros módulos sobre la venta finalizada.

## 📂 Estructura de Carpetas

```text
hexagonal-aws-sam/
├── src/
│   ├── modules/ sales/          # Bounded Context: Ventas
│   │   ├── domain/              # Lógica pura (Entidades, Puertos, Servicios)
│   │   ├── application/         # Casos de Uso (Orquestación local)
│   │   ├── adapters/            
│   │   │   ├── inbound/         # Handlers (create-sale, process-inventory, emit-invoice)
│   │   │   └── outbound/        # Implementaciones (dynamodb-sale, sqlserver-sale)
│   │   └── infrastructure/      # Configuración técnica (database, logger)
│   └── shared/                  # Código compartido entre módulos
├── layers/                      # Lambda Layers (msql driver y shared weights)
├── statemachines/               # Definición de Step Functions (ASL)
├── template.yaml                # Infraestructura como Código (SAM)
└── package.json                 # Scripts: npm run sam:build
```

## 🛠️ Tecnologías y Configuración

- **AWS SAM & esbuild**: Bundling moderno con soporte nativo para **ESM (ECMAScript Modules)**.
- **Observabilidad & Robustez**:
    - **Access Logs**: Logs detallados en API Gateway para auditoría completa.
    - **Tracing (X-Ray)**: Trazabilidad completa de peticiones.
    - **Log Retention**: Política de retención de 7 días configurada para optimizar costes.
    - **CORS Estándar**: Configuración global de CORS para integraciones seguras.
    - **Tagging**: Etiquetado consistente por Proyecto y Entorno.
- **Multi-DB Strategy**: 
    - **DynamoDB**: Almacenamiento rápido para el estado de la venta.
    - **SQL Server**: Integración con sistemas legacy mediante **Lambda Layers** para evitar bundles pesados (configurado como `External` en SAM).
- **EventBridge**: Bus de eventos centralizado (`ErpEventBus`) para comunicación desacoplada.

## 🚀 CI/CD & Multi-Entorno

El proyecto cuenta con una canalización de CI/CD robusta utilizando **GitHub Actions** y **AWS SAM**, configurada para manejar dos entornos aislados:

### Estrategia de Ramas
- **Rama `develop`**: Despliegue automático al entorno de **Certificación (`cert`)**. No requiere confirmación manual.
- **Rama `main`**: Despliegue automático al entorno de **Producción (`prod`)**. Requiere confirmación de changeset (vía logs o manual según configuración).

### Configuración de SAM
Se utiliza el archivo `samconfig.toml` para definir los parámetros de cada entorno:
- **`erp-sales-cert`**: Stack para pruebas y validación.
- **`erp-sales-prod`**: Stack principal de producción.

### Canalizaciones Admitidas
- **GitHub Actions**: (Recomendado) Automatización completa basada en ramas (`.github/workflows/deploy.yml`).
- **AWS CodeBuild**: Soporte nativo mediante `buildspec.yml`. Permite construcción y despliegue automático si se provee la variable de entorno `ENV` (valores: `cert` o `prod`).

### Requisitos para el Pipeline (GitHub Secrets)
Para que el despliegue funcione, es necesario configurar el siguiente secreto en el repositorio:
- `AWS_ROLE_ARN`: El ARN del rol IAM que GitHub Actions asumirá mediante OIDC para desplegar los recursos.

## 📦 Comandos Útiles

```bash
# Construir el proyecto (npm script)
npm run sam:build

# Desplegar manualmente a Cert
sam deploy --config-env cert

# Desplegar manualmente a Prod
sam deploy --config-env prod

# Probar la API localmente
sam local start-api
```

## 📝 Guía de Implementación

Al añadir nueva funcionalidad:
1.  **Puerto**: Define la interfaz en `domain/ports/`.
2.  **Caso de Uso**: Implementa la lógica en `application/use-cases/`.
3.  **Adaptador**: Crea la implementación en `adapters/outbound/`.
4.  **Handler**: Crea el Lambda en `adapters/inbound/` inyectando las dependencias necesarias.
5.  **SAM**: Declara el recurso en `template.yaml` y configura los `EntryPoints` en la Metadata.
