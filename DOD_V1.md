# JLean Frontend — Definition of Done v1

> Generado: 2026-07-12 | Rama: `main`

---

## ✅ Checklist de Cierre

### Fase 9 — Base Frontend y Autenticación
- [x] 9.1 Next.js 14 + TypeScript + Tailwind + Design System JLean (tokens CSS, dark mode, layout raíz)
- [x] 9.2 Cliente API (Base URL, interceptores auth/refresh con Axios). Capa de datos con React Query.
- [x] 9.3 Pantallas de Login, Registro y Onboarding paso a paso para el perfil.

### Fase 10 — Vistas y Módulos Frontend
- [x] 10.1 Búsqueda de Alimentos: tabs My Foods / Presets / USDA / OFF. Detalle con advertencias de calidad.
- [x] 10.2 UI de Recetas: lista, modo manual, constructores avanzados (por macros y por micros).
- [x] 10.3 UI de Daily Log: Quick Add, separación por meal type, edición/eliminación ágil.
- [x] 10.4 Dashboard: barras de progreso circulares/lineales, widgets de día activo, sueño y alertas.

### Módulos adicionales del alcance v1
- [x] Perfil completo: biométricos, metas, targets manuales, restricciones de salud (alergias, intolerancias, condiciones médicas, medicamentos sensibles).
- [x] Suplementos: CRUD con ventanas horarias e interacciones.
- [x] Registro de sueño.
- [x] Ayuno intermitente: configuración y estado activo/inactivo.
- [x] Tipos de día: selector de día con ajuste de TDEE.
- [x] Historial de peso.
- [x] Meal Plan semanal (v2-lite): tablero de planificación manual por día y tipo de comida.

### Fase 11 — Validaciones, Caché y Resiliencia
- [x] 11.1 Validación de reglas de negocio: bloqueo de macros negativos, advertencia por discrepancia calorías vs macros en CreateFoodModal.
- [x] 11.2 Estrategia de fallback: mensajes de degradación en tabs USDA/OFF, `useFoodSources` con `placeholderData` y badges de calidad.

### Fase 12 — Cierre
- [x] 12.3 Este documento — revisión final DoD y CHANGELOG del frontend.

---

## 📝 CHANGELOG v1.0.0

### Breaking changes
_Ninguno — primera versión estable._

### Features
- Design system JLean: tokens CSS (color, spacing, dark mode), componentes base, layout de aplicación.
- Auth: login, registro, onboarding paso a paso.
- Dashboard: macro rings, widgets de ayuno, sueño, alertas y suplementos pendientes.
- Daily Log: quick add, separación por comida, snapshot inmutable, edición/eliminación.
- Foods: búsqueda multi-fuente (My Foods, Presets, USDA, OFF) con badges de calidad y advertencias de fallback.
- CreateFoodModal: validación de negativos + discrepancia calorías-macros.
- Recetas: lista, modo manual, constructores avanzados por macros y por micros.
- Perfil completo con restricciones de salud (allergies, intolerances, medical conditions, sensitive medications).
- Suplementos con horarios e interacciones.
- Sueño: registro de horas y cruce con recomendaciones.
- Ayuno intermitente: ventanas 16:8 / 18:6 / custom, estado activo/inactivo.
- Tipos de día: selector con ajuste visual de calorías.
- Historial de peso: gráfica + tabla de registros.
- Meal Plan: tablero semanal con planificación manual por día y tipo de comida.

### Technical stack
- Next.js 14 (App Router) + TypeScript 5
- Tailwind CSS + CSS variables (Design System JLean)
- Axios + React Query (TanStack Query v5)
- Zod para validación de formularios
- Lucide React para iconografía

---

## 🚀 Puesta en marcha

```bash
# Instalar dependencias
npm ci

# Desarrollo
npm run dev

# Build de producción
npm run build && npm start
```

### Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🚧 Alcance v2+ (pendiente)

- [ ] Escáner de código de barras (cámara / móvil)
- [ ] Gráficas de peso e histórico de macros
- [ ] Meal planning con balanceo automático de macros
- [ ] Recomendaciones IA
- [ ] Comunidad / perfiles públicos
- [ ] App móvil nativa (React Native)
- [ ] Integración con wearables (Garmin, Apple Health, Google Fit)
