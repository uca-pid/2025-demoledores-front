# US Web App Frontend 🏠

[![CI/CD Pipeline](https://github.com/USERNAME/REPOSITORY/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPOSITORY/actions/workflows/ci.yml)
[![Development CI](https://github.com/USERNAME/REPOSITORY/actions/workflows/dev.yml/badge.svg)](https://github.com/USERNAME/REPOSITORY/actions/workflows/dev.yml)
[![Coverage](https://codecov.io/gh/USERNAME/REPOSITORY/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPOSITORY)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern apartment management system with comprehensive testing suite and automated CI/CD pipeline.

## 🎯 Project Overview

A modern React TypeScript application for apartment management with user authentication, reservation system, and comprehensive testing coverage. Built with modern development practices including automated testing, continuous integration, and deployment.

## 🧪 Testing & Quality Assurance

- **106 Passing Tests** with comprehensive coverage
- **Coverage Thresholds**: 80% minimum for branches, functions, lines, and statements
- **Test Types**: Unit tests, Integration tests, API tests
- **Modern Testing Stack**: Vitest + React Testing Library + MSW
- **Continuous Testing** with GitHub Actions

### Test Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui
```

## 🚀 Development

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔄 CI/CD Pipeline

### Main Branch Pipeline (`ci.yml`)
- **Triggers**: Push/PR to `main` and `develop` branches
- **Node Versions**: 18.x, 20.x (matrix testing)
- **Steps**:
  1. Code linting with ESLint
  2. Test execution with coverage reporting
  3. Build verification
  4. Coverage upload to Codecov
  5. **Auto-deployment** to GitHub Pages (main branch only)

### Development Pipeline (`dev.yml`)
- **Triggers**: Push/PR to `develop` branch
- **Steps**: Linting, testing, building (no deployment)

### Coverage Reporting
- **Provider**: v8
- **Formats**: Text, JSON, HTML, LCOV
- **Upload**: Codecov integration
- **Thresholds**: 80% minimum coverage required

## 📊 Features

### Core Functionality
- ✅ **User Authentication**: Login/Register with validation
- ✅ **Apartment Management**: CRUD operations for apartments
- ✅ **Reservation System**: Booking and management
- ✅ **Modern UI Components**: Date/Time pickers with animations
- ✅ **Responsive Design**: Mobile-first approach

### Technical Features
- ✅ **TypeScript**: Full type safety
- ✅ **Modern React**: Hooks, Context, Routing
- ✅ **Animation**: Framer Motion integration
- ✅ **API Mocking**: MSW for testing
- ✅ **Code Quality**: ESLint configuration
- ✅ **Build Optimization**: Vite bundling

## 🛠️ Tech Stack

### Frontend Framework
- **React 19** - Modern React with latest features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server

### Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Icons** - Additional icon sets

### Testing
- **Vitest** - Fast test runner
- **React Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/jest-dom** - Custom matchers

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **GitHub Actions** - CI/CD automation

## 📁 Project Structure

```
src/
├── api_calls/          # API integration functions
├── assets/             # Static assets (images, icons)
├── components/         # Reusable React components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components (Login, Register, Dashboard)
├── styles/             # Global styles
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── pages/          # Page tests
    ├── integration/    # Integration tests
    └── utils/          # Test utilities and mocks
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with Vitest setup
- `tailwind.config.js` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules and settings
- `.github/workflows/` - CI/CD pipeline definitions

## 📈 Deployment

### GitHub Pages (Automatic)
- **Trigger**: Push to `main` branch
- **Build**: Automatic via GitHub Actions
- **URL**: `https://USERNAME.github.io/REPOSITORY`

### Manual Deployment
```bash
# Build production version
npm run build

# Deploy dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:coverage`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Maintain test coverage above 80%
- Follow TypeScript best practices
- Use ESLint for code consistency
- Write meaningful commit messages
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/USERNAME/REPOSITORY/issues)
2. Review the test output for specific error messages
3. Ensure all dependencies are properly installed
4. Verify Node.js version compatibility (18.x or 20.x)

---

**Note**: Replace `USERNAME/REPOSITORY` in badge URLs with your actual GitHub username and repository name.
