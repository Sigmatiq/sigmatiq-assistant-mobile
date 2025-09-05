# SIGMATIQ Assistant Mobile UI Documentation

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
- **Frontend**: React 19.1.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 3.4.17
- **State**: Zustand 5.0.8
- **Data Fetching**: TanStack Query 5.85.9
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.542.0
- **Animations**: Framer Motion 12.23.12
- **UI Primitives**: Radix UI
- **Real-time**: Socket.io Client 4.8.1
- **Backend**: Sigmatiq Assistant API on port 8050

## Project Structure
```
sigmatiq-assistant-mobile/
├── src/
│   ├── api/            # API client, types, and queries
│   ├── components/     # Reusable components
│   ├── pages/          # Page components (Dashboard, Chat)
│   ├── stores/         # Zustand state management
│   ├── styles/         # Theme and global styles
│   ├── assets/         # Static assets
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global CSS with Tailwind
├── docs/
│   ├── architecture/   # System design docs
│   ├── decisions/      # ADRs and design decisions
│   ├── components/     # Component documentation
│   └── features/       # Feature specifications
└── public/             # Static assets
```

## Getting Started
```bash
cd sigmatiq-assistant-mobile
npm install
npm run dev  # Runs on port 3001 (or next available)

# Or using make from root:
make assistant-ui-v2
```

## Documentation Index
1. [Dashboard Design](./features/dashboard.md)
2. [Interactive Context System](./features/context-system.md)
3. [Mobile-First Approach](./architecture/mobile-first.md)
4. [Component Guidelines](./components/guidelines.md)
5. [API Integration](./architecture/api-integration.md)