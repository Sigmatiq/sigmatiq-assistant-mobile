# SIGMATIQ Assistant UI-V2 Documentation

## Overview
SIGMATIQ Assistant is an **analysis-only** trading application focused on market research, technical analysis, and stock discovery. This is a mobile-first, responsive web application built with modern React.

## Quick Links
- [Architecture Overview](./architecture/overview.md)
- [Design Decisions](./decisions/design-decisions.md)
- [Component Library](./components/README.md)
- [Features Documentation](./features/README.md)

## Key Principles
1. **Analysis-Only** - No portfolio tracking or trading execution
2. **Mobile-First** - Designed for mobile, scales to desktop
3. **Context-Aware** - Everything is clickable and sets context
4. **Progressive Disclosure** - Simple by default, advanced on demand

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Backend**: FastAPI (Python) on port 8050

## Project Structure
```
ui-v2/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── api/            # API client and queries
│   ├── stores/         # Zustand stores
│   ├── styles/         # Theme and global styles
│   └── hooks/          # Custom React hooks
├── docs/
│   ├── architecture/   # System design docs
│   ├── decisions/      # ADRs and design decisions
│   ├── components/     # Component documentation
│   └── features/       # Feature specifications
└── public/             # Static assets
```

## Getting Started
```bash
cd products/sigma-assistant/ui-v2
npm install
npm run dev  # Runs on port 3001 (or next available)
```

## Documentation Index
1. [Dashboard Design](./features/dashboard.md)
2. [Interactive Context System](./features/context-system.md)
3. [Mobile-First Approach](./architecture/mobile-first.md)
4. [Component Guidelines](./components/guidelines.md)
5. [API Integration](./architecture/api-integration.md)