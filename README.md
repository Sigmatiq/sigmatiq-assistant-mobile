# Sigmatiq Mobile UI

Mobile-first responsive user interface for the Sigmatiq trading platform, built with modern React and TypeScript.

## 🚀 Features

- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Modern Tech Stack**: React 19, TypeScript, Vite 7
- **Advanced State Management**: Zustand for global state
- **Real-time Updates**: Socket.io for WebSocket connections
- **Data Fetching**: React Query with caching and synchronization
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS for utility-first styling
- **Animations**: Framer Motion for smooth interactions
- **Type Safety**: Full TypeScript support

## 📱 Mobile-First Approach

This UI is designed with mobile users as the primary target:
- Touch-optimized interactions
- Responsive layouts that work on all screen sizes
- Performance optimized for mobile networks
- Progressive Web App (PWA) capabilities

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript 5.8** - Type-safe development
- **Vite 7** - Lightning fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS
- **Zustand 5** - Lightweight state management
- **React Query 5** - Server state management
- **Radix UI** - Accessible component primitives
- **Framer Motion 12** - Animation library
- **Socket.io Client 4.8** - Real-time communication

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
VITE_API_BASE_URL=http://localhost:8060
VITE_WS_URL=ws://localhost:8060

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true
```

## 📝 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (buttons, inputs, etc.)
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── stores/          # Zustand stores
├── services/        # API and external services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles and Tailwind config
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
    port: 3001,
    proxy: {
      '/api': 'http://localhost:8060'
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
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📄 License

Proprietary - Sigmatiq

## 🤝 Contributing

Please see CONTRIBUTING.md for development guidelines.

## 📞 Support

For support, email support@sigmatiq.com or create an issue in this repository.
