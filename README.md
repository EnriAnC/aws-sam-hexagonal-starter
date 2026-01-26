# ERP Serverless - Módulo de Ventas (AWS SAM + Hexagonal Architecture)

Este repositorio contiene la arquitectura de referencia para la refactorización de un ERP gigante hacia un sistema serverless escalable, limpio y mantenible. Se utiliza **AWS SAM** con **TypeScript** y **esbuild**.

## 🏛️ Arquitectura

El proyecto sigue los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)** y el **Diseño Dirigido por Dominios (DDD)** para desacoplar la lógica de negocio de la infraestructura de AWS.

### Capas de la Aplicación

1.  **Dominio (`src/modules/sales/domain`)**: El corazón del sistema. Contiene entidades de negocio e interfaces (Puertos). No tiene dependencias de librerías externas o AWS.
2.  **Aplicación (`src/modules/sales/application`)**: Implementa los Casos de Uso. Orquesta el flujo de datos llamando a los servicios de dominio y repositorios.
3.  **Handlers / Adaptadores Primarios (`src/handlers`)**: Puntos de entrada de AWS (Lambda Handlers). Transforman el evento de AWS (API Gateway, SQS, etc.) en llamadas a los casos de uso.
4.  **Infraestructura / Adaptadores Secundarios (`src/modules/sales/infrastructure`)**: Implementaciones concretas de los puertos (ej: DynamoDB, Clientes de API externa).

### 🛠️ Tecnologías Clave

- **AWS SAM**: Orquestación de infraestructura como código.
- **TypeScript & esbuild**: Transpilación moderna con soporte para ESM (ECMAScript Modules).
- **AWS Step Functions**: Orquestación de procesos de larga duración o complejos (Flujo de Venta -> Inventario -> Facturación).
- **AWS EventBridge**: Coreografía de eventos para comunicación asíncrona entre módulos.

## 📂 Estructura de Carpetas

```text
hexagonal-aws-sam/
├── src/
│   ├── handlers/ sales/         # Adaptadores Primarios (Lambdas)
│   │   ├── create-sale.ts       # Entry point API (POST /sales)
│   │   ├── process-inventory.ts # Lógica invocada por Step Function
│   │   └── emit-invoice.ts      # Lógica de facturación
│   ├── modules/ sales/          # El Bounded Context de Ventas
│   │   ├── domain/              # Lógica pura e Interfaces
│   │   │   ├── models/          # Entidades (Sale, SaleItem)
│   │   │   └── repository.ts    # Puerto (Interface para DB)
│   │   ├── application/         # Casos de Uso (CreateSaleUseCase)
│   │   └── infrastructure/      # Adaptadores (DynamoDBSaleRepository)
│   └── shared/                  # Utilidades y tipos cross-module
├── statemachines/               # Definiciones ASL para Step Functions
├── events/                      # Schemas de EventBridge
├── template.yaml                # Definición de AWS SAM (CloudFormation)
└── package.json                 # Dependencias y scripts de build
```

## 🚀 Configuración del Build (esbuild)

El proyecto está configurado para generar un código JavaScript **extremadamente limpio** y legible en los artefactos de despliegue mediante la metadata de SAM:

- **Format: esm**: Genera módulos nativos de JS (import/export), eliminando shims de CommonJS (`__defProp`, etc.).
- **Minify: false**: Mantiene la indentación y legibilidad para facilitar el debugging en la consola de AWS.
- **Target: esNext**: Utiliza las características más modernas de Node.js (const, let) soportadas por Lambda Node 20+.
- **Sourcemaps: true**: Permite mapear errores del JS generado directamente a las líneas originales en TS.

## 🗄️ Estrategia Multi-DB y Lambda Layers

En este proyecto se demuestra cómo manejar múltiples motores de base de datos de manera eficiente:

- **DynamoDB**: Se incluye en el bundle principal de la Lambda mediante tree-shaking. Es ideal para transacciones rápidas.
- **SQL Server (mssql)**: Al ser una librería pesada, se gestiona mediante una **Lambda Layer** en las funciones que la requieren (`ProcessInventory` y `EmitInvoice`).

### Cómo funciona la exclusión de librerías:
En el `template.yaml`, las funciones que usan SQL tienen configurado:
```yaml
External:
  - 'mssql'
```
Esto le indica a `esbuild` que **no** incluya `mssql` dentro del archivo `.js` de la Lambda. En su lugar, la Lambda la buscará en la Layer en tiempo de ejecución. La función `CreateSale` no utiliza esta configuración, por lo que su bundle es 100% independiente y ligero.

## 📦 Comandos Útiles

```bash
# Construir el proyecto (Transpila TS a JS y resuelve imports)
sam build

# Probar la API localmente
sam local start-api

# Desplegar a AWS
sam deploy --guided
```

## 📝 Guía para Implementadores e IAs

Al añadir nueva funcionalidad:
1.  **Define el Puerto**: Crea una interfaz en `domain/`.
2.  **Lógica de Negocio**: Implementa el flujo en `application/` usando la interfaz del puerto.
3.  **Adaptador**: Crea la implementación real en `infrastructure/`.
4.  **Handler**: Crea el lambda en `handlers/` que instance el adaptador y el caso de uso (inyección de dependencias manual).
5.  **SAM**: Declara la nueva función en `template.yaml` especificando el `EntryPoint` en las `Metadata` para que `esbuild` resuelva el árbol de archivos.
