# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm install` - Install all dependencies for both client and server
- `npm start` - Start both client and server
- `npm run client` - Start only the client (React app)
- `npm run server` - Start only the server (Express)
- `npm run dev` - Start both in development mode
- `cd client && npm test` - Run React tests
- `cd client && npm test -- --testNamePattern=specificTest` - Run a single test

## Code Style Guidelines
- **Imports**: Group and order imports (React, libraries, components, styles)
- **Formatting**: Use 2 spaces for indentation
- **Components**: Functional components with hooks, PascalCase naming
- **API Endpoints**: RESTful design with consistent error handling
- **Error Handling**: Use try/catch blocks with specific error messages
- **Database**: Use parameterized queries to prevent SQL injection
- **CSS**: Component-scoped class names
- **State Management**: React hooks (useState, useEffect) for component state
- **Naming**: camelCase for variables/functions, PascalCase for components