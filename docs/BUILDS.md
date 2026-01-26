# Proceso de Build: SAM, esbuild y Layers

Este proyecto utiliza un sistema de build moderno diseñado para la plataforma Node.js de AWS.

## 1. AWS SAM + Metadata (esbuild)
SAM delega la transpilación de TypeScript a **esbuild** mediante la sección `Metadata` en el `template.yaml`.

### Por qué esbuild?
*   **Velocidad**: Es órdenes de magnitud más rápido que tsc o webpack.
*   **Tree Shaking**: Elimina código que no se usa, reduciendo el tamaño del zip de la Lambda.
*   **Soporte ESM**: Genera módulos nativos de JavaScript.

## 2. Configuración de Limpieza (esNext + ESM)
Nuestra configuración busca el código más cercano al original:
*   `Format: esm`: Usa `import/export` nativos.
*   `Target: esNext`: No transforma `const/let` a `var`, aprovechando que Node.js 20+ es moderno.
*   `Minify: false`: Preferimos legibilidad en el entorno de ERP para facilitar el soporte.

## 3. Estrategia de Lambda Layers
Las librerías pesadas (como `mssql`) no se incluyen en el bundle de la Lambda.

### Flujo de Trabajo:
1.  Definimos el driver en `layers/sqlserver/nodejs/package.json`.
2.  En el `template.yaml` de la Lambda, declaramos la librería como `External`.
3.  `esbuild` deja el `import` intacto en el código fuente.
4.  SAM construye la Layer instalando los módulos físicamente.
5.  En ejecución, Node.js resuelve el `import` leyendo desde `/opt/nodejs/node_modules` (la ruta de la Layer).

**Importante**: Para que TypeScript local no dé errores por librerías externas, debes instalarlas como `devDependencies` en el `package.json` raíz.
