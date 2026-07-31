# Livia Health — Project Documentation

## Overview

Livia Health is a doctor-facing medical application built with React, TanStack Router, Supabase, Tailwind CSS, and shadcn/ui. It provides appointment management, patient records, and AI-powered diagnostic tools.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4, shadcn/ui (base-nova) |
| Backend | Supabase (auth, database) |
| AI API | Express 5, TensorFlow.js (ResNet50) |
| Forms | React Hook Form + Zod |

---

## AI Tools

Two tools are available under `/ai-tools`:

1. **Fatty Liver Scanner** — image-based detection via external API
2. **Fatty Liver Risk Assessment** — form-based scoring, runs client-side

---

## Fatty Liver Scanner

### How It Works

1. Doctor uploads a liver ultrasound scan (drag & drop or file picker)
2. Image is sent as raw bytes to the API
3. API runs inference through a ResNet50 model
4. Result is displayed with diagnosis and confidence score

### API Details

- **Endpoint:** `POST https://livia-ai-api.onrender.com/predict`
- **Request:** Raw image binary body with `Content-Type: image/*` (PNG, JPEG, BMP)
- **Max size:** 25 MB
- **Response:**

```json
{
  "fattyLiver": true,
  "probability": 0.8732,
  "threshold": 0.5
}
```

| Field | Type | Description |
|---|---|---|
| `fattyLiver` | boolean | `true` if probability ≥ threshold |
| `probability` | number | Model confidence (0–1) |
| `threshold` | number | Decision boundary (always 0.5) |

### Model Details

- **Architecture:** ResNet50 (TensorFlow.js graph model)
- **Input:** 224×224 RGB image
- **Preprocessing:** ImageNet BGR mean subtraction
- **Output:** Single float probability

### Error Responses

| Status | Meaning |
|---|---|
| 400 | Empty or invalid image body |
| 500 | Prediction/processing failure |
| 503 | Model not loaded yet |

### CORS

The API currently has **no CORS configuration**. Browser requests from the frontend will be blocked until CORS middleware is added to the Express server.

### Environment Variable

```
VITE_LIVIA_AI_API_URL=https://livia-ai-api.onrender.com
```

---

## FIB-4 Index Calculator

### How It Works

1. Doctor enters 4 values from standard blood work (age, AST, ALT, platelets)
2. Score is calculated entirely **client-side** using the standard FIB-4 formula — no API calls, no network requests
3. Interpretation and age warning are displayed

### Formula

FIB-4 is a well-established clinical formula, computed directly in the browser:

```
FIB-4 = (Age × AST) / (Platelets × √ALT)
```

### Input Fields

| Field | Type | Unit |
|---|---|---|
| Age | number | years |
| AST | number | U/L |
| ALT | number | U/L |
| Platelet Count | number | × 10⁹/L |

### Interpretation

| Score | Result | Action |
|---|---|---|
| < 1.45 | Low fibrosis | Advanced fibrosis unlikely. Routine follow-up. |
| 1.45 – 3.25 | Indeterminate | Further evaluation may be needed (e.g., elastography or NFS). |
| > 3.25 | Advanced fibrosis | Consider liver biopsy for confirmation. |

### Age Caveat

FIB-4 is less reliable for patients **under 35** or **over 65** years old. The calculator shows a warning when the patient's age falls outside this range.

### Source

Based on the [Fibrosis-4 (FIB-4) Index](https://www.mdcalc.com/calc/2200/fibrosis-4-fib-4-index-liver-fibrosis) from MDCalc. This is a clinically validated, noninvasive scoring tool widely used as a first-line screen for liver fibrosis.

---

## Architecture

```
src/
├── routes/_authenticated/ai-tools/
│   ├── index.tsx                    # AI Tools landing page
│   ├── fatty-liver-scan.tsx         # Image upload + API call
│   └── fatty-liver-assessment.tsx   # FIB-4 calculator (client-side)
├── features/ai-tools/services/
│   └── prediction.ts               # API client + FIB-4 calculation
└── features/dashboard/
    └── services/appointments.ts     # Supabase appointment queries
```

- **Image prediction** → calls external API at `VITE_LIVIA_AI_API_URL`
- **FIB-4 calculator** → runs locally in the browser, no network request
- **Navigation** → AI Tools is highlighted in sidebar/bottom nav for all sub-routes
