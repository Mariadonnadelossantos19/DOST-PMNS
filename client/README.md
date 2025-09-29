# DOST-PMNS Client Application

A modern React-based client application for the DOST Project Management & Notification System (PMNS) version 2.0.

## Overview

This is the frontend application for the DOST-PMNS system, built with React, Vite, and Tailwind CSS. It provides interfaces for different user roles including PSTO officers, proponents, and DOST MIMAROPA administrators.

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## User Roles & Features

### 🏢 PSTO (Provincial Science & Technology Office)
- Application management and review
- TNA (Technology Needs Assessment) scheduling
- Document validation
- Proponent management
- Statistics dashboard

### 👥 Proponents
- Program application submission
- Application status tracking
- Enterprise profile management
- Document uploads

### 🏛️ DOST MIMAROPA
- Regional oversight dashboard
- Final application approvals
- System-wide statistics

## Technology Stack

- **React 19** - UI Framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router DOM** - Navigation

## Project Structure

```
src/
├── Component/           # Reusable UI components
├── Pages/              # Page-level components
├── hooks/              # Custom React hooks
├── config/             # Configuration files
├── utils/              # Utility functions
└── App.jsx             # Main application component
```

## Development

### Code Style
- Use 3 spaces for indentation
- Follow React best practices
- Use Tailwind CSS for styling
- Add meaningful comments for complex logic

### Component Guidelines
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use React.memo for performance optimization

## License

This project is part of the DOST-PMNS system for the MIMAROPA Region.
