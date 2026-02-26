# Job-Tracker Frontend

This document defines the **frontend architecture, project structure, styling strategy, and development standards** for the Job-Tracker application.

The frontend is built using:

* React + TypeScript
* Vite
* Chakra UI
* CSS Modules (`*.module.css`)
* React Hook Form (form handling)
* Recharts (data visualization)

Location: `/frontend`

---

# Tech Stack

## Core

* **React + TypeScript** – Component-based UI library with static typing
* **Vite** – Fast development server and optimized build tool

## UI & Styling

* **Chakra UI** – Accessible and responsive component system
* **CSS Modules** – Scoped component-level styling

## Forms

* **React Hook Form** – Simple and performant form handling

## Charts

* **Recharts** – Data-driven SVG visualizations

## API Communication

* **fetch** (built-in) – Used for all HTTP requests
* **API contract**: `docs/API_CONTRACT.md` (source of truth)

---

# Project Structure

```text
frontend/
│
├── public/                        # Static files (favicon, index.html, robots.txt)
│
├── src/
│   │
│   ├── app/                        # App bootstrap and routing
│   │   ├── App/
│   │   │   ├── App.tsx
│   │   │   ├── App.types.ts
│   │   │   └── App.module.css
│   │   ├── main.tsx
│   │   └── routes.tsx
│   │
│   ├── components/                 # Shared, reusable components
│   │   ├── ui/
│   │   │   └── Button/
│   │   │       ├── Button.tsx
│   │   │       ├── Button.types.ts
│   │   │       └── Button.module.css
│   │   └── layout/
│   │       ├── Navbar/
│   │       │   ├── Navbar.tsx
│   │       │   ├── Navbar.types.ts
│   │       │   └── Navbar.module.css
│   │       └── Sidebar/
│   │           ├── Sidebar.tsx
│   │           ├── Sidebar.types.ts
│   │           └── Sidebar.module.css
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── services/                   # API and business logic
│   │   ├── apiService.ts
│   │   └── jobService.ts
│   │
│   ├── types/                       # Global TypeScript types
│   │   └── api.ts
│   │
│   ├── utils/                       # Helper functions
│   │   └── formatDate.ts
│   │
│   ├── middleware.ts                # Middleware (fetch/axios interceptors)
│   │
│   ├── features/                    # Feature-based modules
│   │   └── jobs/
│   │       ├── components/
│   │       │   ├── JobCard/
│   │       │   │   ├── JobCard.tsx
│   │       │   │   ├── JobCard.types.ts
│   │       │   │   └── JobCard.module.css
│   │       │   ├── JobForm/
│   │       │   │   ├── JobForm.tsx
│   │       │   │   ├── JobForm.types.ts
│   │       │   │   └── JobForm.module.css
│   │       │   └── JobList/
│   │       │       ├── JobList.tsx
│   │       │       ├── JobList.types.ts
│   │       │       └── JobList.module.css
│   │       ├── hooks/               # Feature-specific hooks
│   │       │   ├── useJobs.ts
│   │       │   └── useCreateJob.ts
│   │       └── styles/              # Feature-specific styles
│   │           └── jobs.module.css
│   │
│   ├── pages/                        # Page-level containers
│   │   ├── DashboardPage/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DashboardPage.types.ts
│   │   │   └── DashboardPage.module.css
│   │   ├── JobsPage/
│   │   │   ├── JobsPage.tsx
│   │   │   ├── JobsPage.types.ts
│   │   │   └── JobsPage.module.css
│   │   └── JobDetailsPage/
│   │       ├── JobDetailsPage.tsx
│   │       ├── JobDetailsPage.types.ts
│   │       └── JobDetailsPage.module.css
│   │
│   ├── hooks/                        # Global reusable hooks
│   │   └── useFetch.ts
│   │
│   ├── styles/                       # Minimal global styles
│   │   └── global.css
│   │
│   └── assets/                        # Images, icons, static files
│       ├── images/
│       └── icons/
│
├── index.html
├── vite.config.ts
└── package.json
```

---

# ASCII Architecture Diagram

```text
             ┌───────────────┐
             │ UI Primitives │ (Chakra + Base Components)
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────────┐
             │ Shared Components │
             └───────┬───────────┘
                     │
                     ▼
             ┌────────────────────┐
             │ Feature Components │ (JobCard, JobForm, JobList)
             └───────┬────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 ┌────────────────┐          ┌───────────────┐
 │ Page Containers│          │ Feature Hooks │ (useJobs, useCreateJob)
 └───────┬────────┘          └───────┬───────┘
         │                           │
         ▼                           ▼
 ┌───────────────┐          ┌───────────────┐
 │ Contexts      │          │ Services      │ (apiService, jobService)
 │ (Auth, Theme) │          │               │
 └───────────────┘          └───────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
              Application State & API
```

---

# Styling Strategy

* **Chakra UI** for base components and theming
* **CSS Modules** for component/page-specific styles
* Global styles are minimal (`styles/global.css`)

---

# Form Handling Example (React Hook Form + TypeScript)

```tsx
import { useForm, SubmitHandler } from "react-hook-form";

interface JobFormInputs {
  jobTitle: string;
  company: string;
}

export const JobForm: React.FC = () => {
  const { register, handleSubmit } = useForm<JobFormInputs>();

  const onSubmit: SubmitHandler<JobFormInputs> = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("jobTitle")} placeholder="Job Title" />
      <input {...register("company")} placeholder="Company" />
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

# Chart Example (Recharts + TypeScript)

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { date: "2026-01-01", jobs: 10 },
  { date: "2026-01-02", jobs: 20 },
  { date: "2026-01-03", jobs: 15 },
];

export const JobsChart: React.FC = () => (
  <LineChart width={400} height={200} data={data}>
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="jobs" stroke="#8884d8" />
  </LineChart>
);
```

---

# Naming Conventions

* **camelCase** for variables, functions, props, and API fields
* Follow `docs/API_CONTRACT.md` for API consistency

---
# Main Sections of the App

## Dashboard

![Dashboard](./docs/dashboard.png)

## Applications

![Application-Add-New](./docs/application-add-new.png)
![Application-Add-New-Status](./docs/application-add-new-select-status.png)
![Application-List](./docs/application-list.png)
![Application-List-Status](./docs/application-list-status.png)
![Application-Edit](./docs/application-edit.png)

## Insights

![Insight-Career](./docs/insight-career.png)
![Insight-Skills](./docs/insight-skills.png)
![Insight-Resume](./docs/insight-resume.png)
![Insight-Roles](./docs/insight-roles.png)

---

# Local Development

```bash
cd frontend
npm install
npm run dev
```

Default: `http://localhost:5173`

---

# Backend Integration

Expected backend: `http://localhost:8000`

Optional proxy in `vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": "http://localhost:8000"
  }
}
```

---

# Code Quality Recommendations

* ESLint + Prettier
* Small, focused components
* Keep business logic in hooks
* API calls only in services

---

# Production Build

```bash
npm run build
```

Output directory: `/dist`

---

# Summary

This frontend is:

* **TypeScript-first**
* **Folder-per-component/page**, with `.tsx`, `.types.ts`, `.module.css`
* Feature-based and scalable
* Uses Chakra UI + CSS Modules
* Forms handled via React Hook Form
* Charts rendered via Recharts
* Clean, maintainable, and production-ready
