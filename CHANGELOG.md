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
