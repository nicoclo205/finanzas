# Changelog

Historial de avances y decisiones del proyecto. Cada entrada: fecha, qué se hizo, por qué.

## 2026-07-21 — Planeación completa (Ideación → Planeación → Estrategia → Ejecución)

- Definido el objetivo: app personal de finanzas (ingresos, gastos, deudas por medio de pago, metas) sincronizada entre PC y Android, con módulo de tiempo/IA en fases futuras.
- Alcance del primer checkpoint acotado a solo finanzas (sin voz, NFC, ni módulo de tiempo todavía).
- Arquitectura decidida: Hexagonal (Ports & Adapters). Backend FastAPI + Postgres (Supabase solo como DB, sin su auth). Frontend Expo (Android + Web) empacado en Electron para escritorio. Protección por API key fija, sin login. Adaptador MCP para IA planeado pero diferido hasta tener el CRUD base sólido.
- Repositorio git inicializado.
- Creados `CLAUDE.md` (documentación viva del proyecto) y este `CHANGELOG.md`.
- Acordado el modo de trabajo: avances fragmentados con checkpoints, cada avance documentado aquí, diseño de frontend distintivo (skill `frontend-design`), y las carpetas `frontend/`/`backend/` las crea Nico.

## 2026-07-22 — Setup inicial del backend y flujo de trabajo con git

- Carpetas `back_finanzas/` y `front_finanzas/` creadas por Nico; `CLAUDE.md` actualizado para reflejar esos nombres reales (en vez de `backend/`/`frontend/`).
- Entorno virtual de Python creado en `back_finanzas/venv/`, con dependencias base instaladas: FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, pydantic-settings, python-dotenv. Versiones fijadas en `back_finanzas/requirements.txt`.
- `.gitignore` separado por carpeta (`back_finanzas/.gitignore`, `front_finanzas/.gitignore`) en vez de uno único en la raíz, ya que cada carpeta es un proyecto independiente (Python vs. Node/Expo).
- Creado el repositorio remoto privado en GitHub (`nicoclo205/finanzas`) y hecho el primer push.
- Creado el esqueleto de carpetas de la arquitectura hexagonal dentro de `back_finanzas/`: `domain/`, `application/`, `application/ports/`, `infrastructure/` (con `infrastructure/api/` e `infrastructure/db/` separando el adaptador REST del adaptador Postgres), cada una como paquete Python vacío.
- Acordado que cada avance significativo actualiza `CLAUDE.md` (si afecta arquitectura/stack/roadmap/convenciones) y `CHANGELOG.md` (siempre), en el mismo momento — no como tarea aparte al final.

## 2026-07-28 — Primera entidad de dominio: `Transaction`

- Creada `back_finanzas/domain/transaction.py`: entidad `Transaction` (dataclass) con `amount`, `transaction_type`, `method`, `date`, `category`, `description` e `id` opcional (se asigna al persistir, no al crear en memoria).
- Definidos como `Enum` los vocabularios cerrados de la entidad: `TransactionType` (ingreso/gasto), `Method` (efectivo/transferencia/tarjeta débito/crédito), `Category` (comida, transporte, salidas, ocio, trabajo, padres, otro).
- Creada `back_finanzas/domain/exceptions.py` con `DomainError` (base) e `InvalidAmountError`, usada en `Transaction.__post_init__` para rechazar montos ≤ 0. Las excepciones de dominio viven junto al dominio, no como `ValueError` genéricos, para que capas superiores las puedan atrapar y traducir específicamente.
- Convención de idioma adoptada para todo el código: identificadores (clases, campos, miembros de Enum) en inglés; texto (valores de Enum, mensajes de excepción) en español.
- Escrito por Nico, con guía paso a paso de Claude (sin que Claude escriba el código), como método de aprendizaje.

## 2026-08-04 — Más validación en `Transaction` y suite de tests

- Ampliada la validación en `Transaction.__post_init__`: además de rechazar montos ≤ 0, ahora rechaza montos por encima de un límite realista (100,000,000) y descripciones de más de 100 caracteres.
- Agregada `InvalidDescriptionError` en `domain/exceptions.py` para el nuevo caso de validación.
- Creada la suite de tests `back_finanzas/tests/domain/test_transaction.py` (pytest): cubre creación válida, monto cero, monto negativo, monto sobre el límite y descripción demasiado larga.

## 2026-08-05 — Docstrings de dominio y primer puerto de aplicación

- Agregados docstrings a `Transaction`, `TransactionType`, `Method` y `Category` en `domain/transaction.py`, documentando el propósito de cada campo/Enum.
- Definido el primer puerto de la capa de aplicación: `back_finanzas/application/ports/transaction_repository.py` con la interfaz abstracta `TransactionRepository` (método `save`), siguiendo el patrón hexagonal — la aplicación depende de esta interfaz, no de una implementación concreta.
- Creada `InMemoryTransactionRepository` en `back_finanzas/tests/fakes/in_memory_transaction_repository.py`, implementación del puerto en memoria (lista + autoincremento de `id`) para poder probar casos de uso sin depender de Postgres todavía.

## 2026-08-25 — Primer caso de uso de aplicación: `RegisterTransaction`

- Agregado docstring a `TransactionRepository` (`application/ports/transaction_repository.py`) explicando su rol como contrato de persistencia.
- Creado `back_finanzas/application/use_cases/register_transaction.py`: caso de uso `RegisterTransaction`, que recibe datos crudos, construye una `Transaction` (delegando la validación al dominio) y la persiste a través del puerto `TransactionRepository`.
- Creada la suite `back_finanzas/tests/application/use_cases/test_register_transaction.py`, con dos tests: uno cubre el camino feliz (guarda y devuelve la transacción con `id` asignado), y otro el camino de error (con un monto inválido, la excepción `InvalidAmountError` del dominio sube sin que el repositorio llegue a guardar nada).
