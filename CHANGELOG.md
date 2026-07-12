# Changelog — JLean Frontend

Todos los cambios notables siguen [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.0.0] — 2026-07-12

### Added
- Design system JLean: tokens CSS, dark mode, layout raíz, componentes base
- Auth: login, registro, onboarding paso a paso (perfil, metas, restricciones)
- Dashboard: macro rings, distribución por comida, widgets sueño/ayuno/alertas
- Daily Log: quick add, separación por meal type, edición/eliminación, snapshot UI
- Foods: búsqueda multi-fuente (My Foods, Presets, USDA, OFF), badges calidad, fallbacks
- CreateFoodModal: validación negatives + discrepancia calorías-macros ≥25 kcal
- Recetas: lista, modo manual, constructores avanzados macros y micros
- Perfil: biométricos, metas, targets manuales, restricciones de salud
- Suplementos: CRUD, ventanas horarias, alertas de interacción
- Sueño: registro y recomendaciones de recuperación
- Ayuno intermitente: ventanas configurables, estado activo/inactivo
- Tipos de día: selector con ajuste visual de TDEE
- Historial de peso
- Meal Plan semanal (tablero manual)
- `useFoodSources`: placeholderData con fallbacks por fuente
- `useMealPlan`, `useCreateMealPlanEntry`, `useDeleteMealPlanEntry`

### Technical stack
- Next.js 14 (App Router) + TypeScript 5
- Tailwind CSS + CSS variables
- Axios + TanStack Query v5
- Zod + Lucide React
