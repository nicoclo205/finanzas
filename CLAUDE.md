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
2. CRUD financiero: ingresos y gastos por medio de pago (entidad `Transaction`) — **completo**
3. Frontend Expo: pantallas de registro y listados, conectadas al backend
4. Dashboard (balance, gasto por categoría) y Metas
5. Empaquetado y despliegue: backend en producción, build Android, app de escritorio con Electron
6. (Futuro, fuera del alcance actual) Adaptador MCP para asesoría financiera con IA

**Decisión de alcance (2026-08-29):** la entidad `Deuda` se difiere — el balance calculado a partir de `Transaction` (ingreso/gasto) alcanza para el caso de uso actual (saldo que fluctúa en positivo/negativo desde 0). `Deuda` se retoma más adelante si surge necesidad real de trackear una obligación pendiente como algo distinto de un gasto puntual (no se descarta, solo se saca de la Fase 2).

**Diseño ya acordado para `Deuda` (implementación pendiente, no antes de la Fase 3):** entidad con `creditor` (texto libre, ej. "tarjeta de crédito", nombre de un amigo), `amount`, `paid_amount` (default 0), `method`, `description`, `date`, y `due_date` opcional (`None` para deudas sin fecha, como las de amigos). El estado (`pendiente`/`parcial`/`pagada`) se calcula a partir de `amount` vs. `paid_amount`, no se guarda como campo aparte. Pagar una deuda genera además una `Transaction` de gasto vinculada, para que el pago también se refleje en el balance. Explícitamente fuera de este diseño por ahora: recurrencia automática (ciclos mensuales de tarjeta, cargos recurrentes tipo gimnasio) y auto-acumulación de gastos con tarjeta de crédito hacia una `Deuda` — Nico marcó esta última como importante para automatizar más adelante (cada pago con `tarjeta_credito` debería sumar automáticamente a la deuda de esa tarjeta), pero se implementa manual primero para no resolver reglas de negocio (cuándo cierra el ciclo, qué cuenta) que todavía no están validadas con uso real.

Explícitamente fuera de alcance por ahora: comandos por voz, NFC, módulo de tiempo/actividades/anti-procrastinación. No se descartan, se retoman en fases posteriores una vez el núcleo financiero esté sólido.

## Cómo trabajar en este proyecto (importante)

- **Avances fragmentados.** No implementar una fase completa de una sola vez. Construir en piezas pequeñas y verificables, mostrar el resultado, y esperar confirmación antes de seguir con la siguiente pieza.
- **Documentar cada avance.** Cada cambio significativo (una pieza terminada, una decisión de arquitectura, un cambio de rumbo) se agrega a `CHANGELOG.md` con fecha, qué cambió y por qué. No dejar avances sin registrar. Además, si el cambio afecta arquitectura, stack, roadmap o estas convenciones de trabajo, `CLAUDE.md` se actualiza en el mismo momento para que no quede desactualizado — ambos archivos se mantienen sincronizados en cada avance.
- **Diseño de frontend único, no genérico.** Antes de construir o rediseñar cualquier pantalla, usar la skill `frontend-design` para tomar decisiones deliberadas de dirección visual (tipografía, paleta, layout) — evitar el look genérico de plantilla por defecto.
- **Las carpetas `back_finanzas/` y `front_finanzas/` las crea Nico manualmente.** No generar automáticamente esa estructura de carpetas top-level sin que se pida explícitamente.
