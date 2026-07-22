# Finanzas — App personal de finanzas (y futura organización del tiempo)

App personal (un solo usuario: Nico) para llevar ingresos, gastos y deudas por medio de pago (efectivo/transferencia/tarjeta), con metas financieras y, más adelante, un módulo de gestión del tiempo/actividades y un asesor financiero conectado por IA. Sincronizada entre PC y Android.

Ver `CHANGELOG.md` para el historial de avances y decisiones tomadas sesión a sesión.

## Arquitectura

**Hexagonal (Ports & Adapters)** en el backend (`back_finanzas/`):

- `back_finanzas/domain/` — entidades y reglas de negocio puras (Transacción, Deuda, Meta). No conoce Postgres, FastAPI ni Claude.
- `back_finanzas/application/` — casos de uso (`registrarGasto`, `calcularBalance`, etc.), orquestan el dominio.
- `back_finanzas/application/ports/` — interfaces que el dominio/aplicación espera (`TransaccionRepository`, etc.).
- `back_finanzas/infrastructure/` — adaptadores concretos: repositorio Postgres (SQLAlchemy) como adaptador de salida (driven); API REST (FastAPI) como adaptador de entrada (driving). Un adaptador MCP para IA se añadirá aquí más adelante sin tocar `domain/` ni `application/`.

El frontend vive en `front_finanzas/`.

## Stack

| Capa | Elección | Notas |
|---|---|---|
| Backend | FastAPI (Python) | Pydantic como DTOs/validación, `Depends` como inyección de dependencias |
| Base de datos | Postgres gestionado en Supabase | Solo como DB — acceso directo vía SQLAlchemy, sin usar el auto-API ni el auth de Supabase |
| Protección del backend | API key fija compartida entre dispositivos | Sin pantallas de login/registro — no es multiusuario |
| Frontend | Expo (React Native + Expo Router) | Un código → app Android instalable + build web |
| Escritorio (PC) | Electron empacando el build web de Expo | App nativa de Windows, sin curva de aprendizaje nueva |
| IA / asesoría financiera | Servidor MCP (FastMCP) — futuro | Expone los mismos casos de uso de `application/` como herramientas para Claude; se construye después de que el CRUD base esté sólido |
| Hosting | Vercel (frontend/desktop build) + a definir (Railway/Render) para el backend | Todo en capa gratuita |

## Roadmap (fases de ejecución)

1. Setup y arquitectura base del backend (hexagonal, conexión real a Postgres, API key)
2. CRUD financiero: ingresos, gastos, deudas por medio de pago
3. Frontend Expo: pantallas de registro y listados, conectadas al backend
4. Dashboard (balance, gasto por categoría, deudas próximas) y Metas
5. Empaquetado y despliegue: backend en producción, build Android, app de escritorio con Electron
6. (Futuro, fuera del alcance actual) Adaptador MCP para asesoría financiera con IA

Explícitamente fuera de alcance por ahora: comandos por voz, NFC, módulo de tiempo/actividades/anti-procrastinación. No se descartan, se retoman en fases posteriores una vez el núcleo financiero esté sólido.

## Cómo trabajar en este proyecto (importante)

- **Avances fragmentados.** No implementar una fase completa de una sola vez. Construir en piezas pequeñas y verificables, mostrar el resultado, y esperar confirmación antes de seguir con la siguiente pieza.
- **Documentar cada avance.** Cada cambio significativo (una pieza terminada, una decisión de arquitectura, un cambio de rumbo) se agrega a `CHANGELOG.md` con fecha, qué cambió y por qué. No dejar avances sin registrar.
- **Diseño de frontend único, no genérico.** Antes de construir o rediseñar cualquier pantalla, usar la skill `frontend-design` para tomar decisiones deliberadas de dirección visual (tipografía, paleta, layout) — evitar el look genérico de plantilla por defecto.
- **Las carpetas `back_finanzas/` y `front_finanzas/` las crea Nico manualmente.** No generar automáticamente esa estructura de carpetas top-level sin que se pida explícitamente.
