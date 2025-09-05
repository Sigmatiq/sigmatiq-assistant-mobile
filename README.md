# Sigmatiq Assistant Mobile UI

Mobile-first responsive user interface for the Sigmatiq Assistant - an **analysis-only** trading application focused on market research, technical analysis, and stock discovery.

## 🚀 Features

- **Analysis-Only Focus**: Market research and technical analysis without portfolio tracking
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Modern Tech Stack**: React 19, TypeScript 5.8, Vite 7
- **Advanced State Management**: Zustand 5 for global state
- **Real-time Updates**: Socket.io Client 4.8 for WebSocket connections
- **Data Fetching**: TanStack Query 5 with caching and synchronization
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS 3.4 for utility-first styling
- **Animations**: Framer Motion 12 for smooth interactions
- **Context-Aware**: Everything is clickable and sets context
- **Type Safety**: Full TypeScript support

## 📱 Mobile-First Approach

This UI is designed with mobile users as the primary target:
- Touch-optimized interactions
- Responsive layouts that work on all screen sizes
- Performance optimized for mobile networks
- Progressive Web App (PWA) capabilities

## 🛠️ Tech Stack

- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 7.1.2** - Lightning fast build tool
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Zustand 5.0.8** - Lightweight state management
- **TanStack Query 5.85.9** - Server state management (formerly React Query)
- **Radix UI** - Accessible component primitives
- **Framer Motion 12.23.12** - Animation library
- **Socket.io Client 4.8.1** - Real-time communication
- **Axios 1.11.0** - HTTP client
- **Lucide React 0.542.0** - Icon library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Sigmatiq/sigmatiq-mobile-ui.git
cd sigmatiq-mobile-ui

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at http://localhost:3001

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8050  # Assistant API
VITE_SIGMA_CORE_URL=/api/core            # Proxied to Core API
VITE_SIGMA_ASSISTANT_URL=/api/assistant  # Proxied to Assistant API

# Feature Flags
VITE_ENABLE_PWA=false
VITE_ENABLE_OFFLINE=false
VITE_ENABLE_ANALYTICS=false

# Environment
VITE_ENV=development
```

Note: The Vite dev server proxies API calls:
- `/api/core` → `http://localhost:8050` (Core/Assistant API)
- `/api/assistant` → `http://localhost:8090` (if separate Assistant API)

## 📝 Available Scripts

```bash
# Development server with hot reload (port 3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking (via build)
npm run build  # TypeScript check is part of build
```

## 🏗️ Project Structure

```
src/
├── api/             # API client and types
│   ├── client.ts    # Axios instances and API methods
│   ├── queries.ts   # TanStack Query hooks
│   └── types.ts     # TypeScript interfaces
├── components/      # Reusable UI components
│   ├── layouts/     # Layout components (MobileLayout)
│   ├── AssistantPanel.tsx
│   ├── ClickableEntity.tsx
│   ├── MobileHeader.tsx
│   ├── MobileNav.tsx
│   └── ...
├── pages/           # Page components
│   ├── Chat.tsx     # Assistant chat interface
│   └── Dashboard.tsx # Main dashboard
├── stores/          # Zustand stores
│   └── useAppStore.ts
├── styles/          # Global styles and theme
│   └── sigmatiq-theme.ts
├── assets/          # Static assets
├── App.tsx          # Main app component
├── main.tsx         # App entry point
└── index.css        # Global CSS with Tailwind
```

## 🎨 Design System

- **Colors**: Defined in Tailwind config with dark mode support
- **Typography**: System font stack with responsive sizing
- **Spacing**: 4px base unit system
- **Components**: Consistent design tokens and variants
- **Icons**: Lucide React for consistent iconography

## 📱 Progressive Web App

This UI includes PWA features:
- Offline support with service workers
- App-like experience on mobile
- Push notifications (when enabled)
- Home screen installation

## 🔧 Configuration

### Tailwind Configuration

Customize the design system in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom brand colors
      }
    }
  }
}
```

### Vite Configuration

Build and dev server settings in `vite.config.ts`:

```typescript
export default {
  server: {
    port: 3001,  // Default, but will auto-increment if in use
    proxy: {
      '/api/core': {
        target: 'http://localhost:8050',  // Core/Assistant API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, '')
      },
      '/api/assistant': {
        target: 'http://localhost:8090',  // Separate Assistant API if needed
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assistant/, '')
      }
    }
  }
}
```

## 🚢 Deployment

### Docker

```bash
# Build Docker image
docker build -t sigmatiq-mobile-ui .

# Run container
docker run -p 3001:80 sigmatiq-mobile-ui
```

### Static Hosting

Build and deploy to any static hosting service:

```bash
npm run build
# Deploy 'dist' folder to hosting service
```

## 🧪 Testing

```bash
# Run unit tests (not yet configured)
npm run test  # TODO: Add testing framework

# Run e2e tests (not yet configured)
npm run test:e2e  # TODO: Add e2e testing

# Test coverage (not yet configured)
npm run test:coverage  # TODO: Add coverage reporting
```

**Note**: Testing infrastructure is planned but not yet implemented.

## 🔗 Related Documentation

- [Architecture Overview](./docs/architecture/overview.md)
- [Design Decisions](./docs/decisions/design-decisions.md)
- [Features Documentation](./docs/features/README.md)
- [Dashboard Design](./docs/features/dashboard.md)

## 📄 License

Proprietary - Sigmatiq

## 🤝 Contributing

Please see CONTRIBUTING.md for development guidelines.

## 📞 Support

For support, email support@sigmatiq.com or create an issue in this repository.

## ⚙️ Integration with Backend

This UI connects to:
- **Sigmatiq Assistant API** (port 8050) - Primary backend
- **Sigmatiq Core API** (via Assistant) - Market data and screeners

Make sure both APIs are running:
```bash
# Terminal 1: Run Assistant API
make assistant-api

# Terminal 2: Run Mobile UI
make assistant-ui-v2
```
## North Star Goals

- Follow the shared Rules of Engagement for every change and reference them in PRs (see ../RULES_OF_ENGAGEMENT.md).
- Complete the 4‑persona review before opening a PR and include a brief summary in the PR description.
- Keep PRs small in scope; update tests/docs; avoid schema-breaking changes or include safe migrations; preserve beginner‑friendly defaults.

### 4‑Persona Review Prompts

- Trader: Does this add edge in the intended regime? Are risk controls adequate?
- Architect: Is design coherent, extensible, and aligned with schema/weighting/scaling rules?
- Developer: Is code simple, documented, and well‑tested? Any performance traps?
- Beginner: Is the change explainable in one paragraph and free of surprise losses?
