# Changelog

Historial de avances y decisiones del proyecto. Cada entrada: fecha, qué se hizo, por qué.

## 2026-07-21 — Planeación completa (Ideación → Planeación → Estrategia → Ejecución)

- Definido el objetivo: app personal de finanzas (ingresos, gastos, deudas por medio de pago, metas) sincronizada entre PC y Android, con módulo de tiempo/IA en fases futuras.
- Alcance del primer checkpoint acotado a solo finanzas (sin voz, NFC, ni módulo de tiempo todavía).
- Arquitectura decidida: Hexagonal (Ports & Adapters). Backend FastAPI + Postgres (Supabase solo como DB, sin su auth). Frontend Expo (Android + Web) empacado en Electron para escritorio. Protección por API key fija, sin login. Adaptador MCP para IA planeado pero diferido hasta tener el CRUD base sólido.
- Repositorio git inicializado.
- Creados `CLAUDE.md` (documentación viva del proyecto) y este `CHANGELOG.md`.
- Acordado el modo de trabajo: avances fragmentados con checkpoints, cada avance documentado aquí, diseño de frontend distintivo (skill `frontend-design`), y las carpetas `frontend/`/`backend/` las crea Nico.
