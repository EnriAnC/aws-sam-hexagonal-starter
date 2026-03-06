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

## 4. Compilación de Pilas Anidadas
`sam build` utiliza el algoritmo de recursión para entrar en cada archivo `.yaml` hijo. SAM no solo compila el código, sino que también genera una ruta interna que luego el comando `deploy` traducirá a una URL de S3.

### Prototipado Local
Dentro de `.aws-sam/build/`, se creará una subcarpeta por cada Stack anidado, lo que facilita el debugeo de los binarios generados.

## 5. Estrategia de CI/CD Multi-entorno
El proyecto cuenta con automatización completa para desplegar a entornos de **CERT** y **PROD**.

### Herramientas
*   **GitHub Actions**: Automatiza despliegues mediante pushes a ramas (`develop` -> cert, `main` -> prod).
*   **AWS CodeBuild**: Permite ejecutar el build y despliegue directamente en la infraestructura de AWS.
*   **samconfig.toml**: Contiene los parámetros específicos por entorno, permitiendo consistencia en el despliegue (`--config-env`).

### Seguridad de los Pipelines
Usamos **OpenID Connect (OIDC)** con AWS, lo que elimina la necesidad de almacenar claves de acceso estáticas (`AccessKeyId`, `SecretAccessKey`) en los secretos de GitHub, reduciendo la superficie de ataque.
