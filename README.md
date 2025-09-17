# PMNS 2.0 - Program Management and Notification System

A comprehensive web application for managing DOST MIMAROPA programs, applications, and user interactions. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## 📁 Project Structure

### Root Directory
```
pmns2.0/
├── client/          # React.js Frontend Application
├── server/          # Node.js/Express Backend API
├── start.bat        # Windows startup script
└── README.md        # This documentation file
```

---

## 🖥️ Frontend (Client) Structure

### 📂 `/client/` - React.js Application Root
**Purpose**: Main frontend application built with React, Vite, and Tailwind CSS

#### Core Files
- **`App.jsx`** - Main application component with routing logic
  - **Connections**: Imports all major components and pages
  - **Content**: Handles user authentication, role-based routing, and main app state
  - **Dependencies**: All dashboard components, layout components, and page components

- **`main.jsx`** - Application entry point
  - **Connections**: Renders App.jsx with providers
  - **Content**: React DOM rendering and provider setup

- **`index.css`** - Global styles and Tailwind CSS imports
- **`App.css`** - Application-specific styles

#### 📂 `/client/src/assets/` - Static Assets
- **`hero-img.png`** - Landing page hero image
- **`react.svg`** - React logo asset

#### 📂 `/client/src/config/` - Configuration Files
- **`api.js`** - API endpoints configuration
  - **Connections**: Used by all components making API calls
  - **Content**: Centralized API endpoint definitions

---

### 📂 `/client/src/Component/` - Reusable Components

#### 📂 `/Component/Context/` - React Context Providers
- **`DarkModeContext.jsx`** - Dark mode theme context provider
  - **Connections**: Used throughout the app for theme switching
  - **Content**: Dark mode state management and theme utilities
- **`index.js`** - Context exports

#### 📂 `/Component/layouts/` - Layout Components
- **`MainLayout.jsx`** - Main application layout wrapper
  - **Connections**: Uses Header, Sidebar, and renders children
  - **Content**: Layout structure with responsive sidebar and header
- **`Header.jsx`** - Top navigation header
  - **Connections**: User profile, notifications, sidebar toggle
  - **Content**: User menu, notifications, and navigation controls
- **`Sidebar.jsx`** - Left navigation sidebar
  - **Connections**: Role-based navigation, user data
  - **Content**: Navigation menu with role-specific sections

#### 📂 `/Component/UI/` - Reusable UI Components
- **`Button.jsx`** - Custom button component
- **`Card.jsx`** - Card container component
- **`Modal.jsx`** - Modal dialog component
- **`Input.jsx`** - Form input component
- **`Badge.jsx`** - Status badge component
- **`Toast.jsx`** - Toast notification component
- **`Alert.jsx`** - Alert message component
- **`StatsCard.jsx`** - Statistics display card
- **`TabNavigation.jsx`** - Tab navigation component
- **`index.js`** - UI components exports

#### 📂 `/Component/ProgramApplication/` - Program Application System
- **`MultiStepForm.jsx`** - Multi-step application form orchestrator
  - **Connections**: Uses form steps, contact information, API endpoints
  - **Content**: Form state management and submission logic
- **`ApplicationMonitor.jsx`** - User's submitted applications display
  - **Connections**: API endpoints, UI components
  - **Content**: Application status tracking and management
- **`ApplicationsPageTemplate.jsx`** - Reusable applications page template
  - **Connections**: Uses ApplicationsList, ApplicationReviewModal, useApplicationReview hook
  - **Content**: Clean template for PSTO application management
- **`ApplicationsList.jsx`** - Application cards display component
  - **Connections**: UI components, application data
  - **Content**: Grid layout of application cards with actions
- **`ApplicationReviewModal.jsx`** - Comprehensive application review modal
  - **Connections**: Application data, review functions
  - **Content**: Detailed application information display and review form

#### 📂 `/Component/ProgramApplication/forms/` - Application Form Steps
- **`SETUPFormSteps.jsx`** - SETUP program application form
- **`GIAFormSteps.jsx`** - GIA program application form
- **`CESTForm.jsx`** - CEST program application form
- **`SSCPForm.jsx`** - SSCP program application form
- **`index.js`** - Form exports

#### 📂 `/Component/ProgramApplication/components/` - Form Components
- **`ContactInformation.jsx`** - Contact information form section
- **`FormInput.jsx`** - Form input wrapper
- **`FormSelect.jsx`** - Form select wrapper
- **`FormTextarea.jsx`** - Form textarea wrapper
- **`FormFileUpload.jsx`** - File upload component
- **`FormSection.jsx`** - Form section wrapper
- **`index.js`** - Component exports

#### 📂 `/Component/ProgramApplication/hooks/` - Custom Hooks
- **`useApplicationReview.js`** - Application review logic hook
  - **Connections**: API endpoints, state management
  - **Content**: Application fetching, reviewing, and state management

#### 📂 `/Component/ProgramSelection/` - Program Selection System
- **`ProgramSelection.jsx`** - Main program selection component
- **`components/ProgramCard.jsx`** - Individual program card
- **`components/ProgramHeader.jsx`** - Program selection header
- **`components/ActionButtons.jsx`** - Action buttons for programs
- **`data/programsData.jsx`** - Program data definitions
- **`index.js`** - Program selection exports

#### 📂 `/Component/Registration/` - Authentication System
- **`login.jsx`** - User login component
- **`register.jsx`** - User registration component
- **`AuthModal.jsx`** - Authentication modal wrapper
- **`ResetPassword.jsx`** - Password reset component

#### 📂 `/Component/Notifications/` - Notification System
- **`NotificationProvider.jsx`** - Notification context provider
- **`NotificationCenter.jsx`** - Notification center component
- **`NotificationDropdown.jsx`** - Notification dropdown
- **`NotificationToast.jsx`** - Toast notification component
- **`index.js`** - Notification exports

#### 📂 `/Component/Interactive/` - Interactive Features
- **`FloatingMiniGamesButton.jsx`** - Mini-games floating button
- **`MiniGames.jsx`** - Mini-games component
- **`MiniGamesModal.jsx`** - Mini-games modal
- **`AchievementSystem.jsx`** - User achievement system
- **`InteractiveDashboard.jsx`** - Interactive dashboard features
- **`ProgressAnimation.jsx`** - Progress animation component
- **`RealTimeStats.jsx`** - Real-time statistics component
- **`index.js`** - Interactive exports

#### 📂 `/Component/ProjectManagement/` - Project Management
- **`ProjectDashboard.jsx`** - Project management dashboard
- **`ProjectCard.jsx`** - Individual project card
- **`TaskList.jsx`** - Task management component
- **`index.js`** - Project management exports

#### 📂 `/Component/UserManagement/` - User Management
- **`UserManagement.jsx`** - User management interface
- **`index.js`** - User management exports

#### 📂 `/Component/Services/` - Service Components
- **`SETUP.jsx`** - SETUP service component
- **`index.js`** - Service exports

#### 📂 `/Component/Utils/` - Utility Functions
- **`darkModeUtils.js`** - Dark mode utility functions

---

### 📂 `/client/src/Pages/` - Page Components

#### 📂 `/Pages/ProgramSelection/` - Program Selection Pages
- **`ProgramSelectionPage.jsx`** - Program selection page wrapper
- **`index.js`** - Page exports

#### 📂 `/Pages/ApplicationMonitor/` - Application Monitoring
- **`ApplicationMonitorPage.jsx`** - Application monitoring page
- **`index.js`** - Page exports

#### 📂 `/Pages/Proponents/` - Proponent User Pages
- **`pages/ProponentMainPage.jsx`** - Main proponent dashboard
  - **Connections**: Proponent components, program selection, application forms
  - **Content**: Proponent user interface and functionality
- **`Components/ProponentDashboard.jsx`** - Proponent dashboard component
- **`Components/EnterpriseProfile.jsx`** - Enterprise profile management
- **`Components/RegistrationSteps/`** - Registration form steps
  - **`ProponentRegistrationForm.jsx`** - Main registration form
  - **`PersonalInfoStep.jsx`** - Personal information step
  - **`BusinessInfoStep.jsx`** - Business information step
  - **`LoginCredentialsStep.jsx`** - Login credentials step
  - **`ProgramRequestStep.jsx`** - Program request step
  - **`OverviewStep.jsx`** - Registration overview step
- **`index.js`** - Proponent exports

#### 📂 `/Pages/PSTO/` - PSTO (Provincial Science and Technology Office) Pages

##### 📂 `/PSTO_Marinduque/` - Marinduque PSTO
- **`pages/MarinduqueDashboard.jsx`** - Marinduque PSTO dashboard
  - **Connections**: PSTO components, applications management
  - **Content**: Marinduque-specific PSTO interface
- **`pages/ApplicationsPage.jsx`** - Applications management page
  - **Connections**: ApplicationsPageTemplate
  - **Content**: Clean applications management using template

##### 📂 `/PSTO_Romblon/` - Romblon PSTO
- **`pages/RomblonDashboard.jsx`** - Romblon PSTO dashboard
- **`pages/ApplicationsPage.jsx`** - Applications management page

##### 📂 `/PSTO_OccidentalMindoro/` - Occidental Mindoro PSTO
- **`pages/OccidentalMindoroDashboard.jsx`** - Occidental Mindoro PSTO dashboard
- **`pages/ApplicationsPage.jsx`** - Applications management page

##### 📂 `/PSTO_OrientalMindoro/` - Oriental Mindoro PSTO
- **`pages/OrientalMindoroDashboard.jsx`** - Oriental Mindoro PSTO dashboard
- **`pages/ApplicationsPage.jsx`** - Applications management page

##### 📂 `/PSTO_Palawan/` - Palawan PSTO
- **`pages/PalawanDashboard.jsx`** - Palawan PSTO dashboard
- **`pages/ApplicationsPage.jsx`** - Applications management page

#### 📂 `/Pages/DOST_MIMAROPA/` - DOST MIMAROPA Pages
- **`DostMimaropaDashboard.jsx`** - DOST MIMAROPA main dashboard
  - **Connections**: DOST components, system overview
  - **Content**: Regional office dashboard and management

#### 📂 `/Pages/superAdmin/` - Super Admin Pages
- **`pages/SuperAdminDashboard.jsx`** - Super administrator dashboard
- **`index.js`** - Super admin exports

---

## 🖥️ Backend (Server) Structure

### 📂 `/server/` - Node.js/Express API Server
**Purpose**: RESTful API server handling business logic, database operations, and authentication

#### Core Files
- **`server.js`** - Main server entry point
  - **Connections**: All routes, middleware, and database
  - **Content**: Express server setup, middleware configuration, route mounting

#### 📂 `/server/src/config/` - Configuration
- **`database.js`** - MongoDB database connection configuration
  - **Connections**: Used by all models and controllers
  - **Content**: Database connection setup and configuration

#### 📂 `/server/src/models/` - Database Models (Mongoose)
- **`User.js`** - User model (all user types)
  - **Connections**: Referenced by all other models
  - **Content**: User schema with role-based fields
- **`Program.js`** - Program model
  - **Connections**: Referenced by application models
  - **Content**: Program definitions and metadata
- **`SETUPApplication.js`** - SETUP program applications
  - **Connections**: User model, Program model
  - **Content**: SETUP application schema and validation
- **`GIAApplication.js`** - GIA program applications
- **`CESTApplication.js`** - CEST program applications
- **`SSCPApplication.js`** - SSCP program applications
- **`ProgramApplication.js`** - Generic program application model
- **`Proponent.js`** - Proponent organization model
- **`PSTO.js`** - PSTO office model
- **`TNA.js`** - Technology Needs Assessment model

#### 📂 `/server/src/controllers/` - Business Logic Controllers
- **`authController.js`** - Authentication and authorization
  - **Connections**: User model, JWT tokens
  - **Content**: Login, registration, password reset logic
- **`userController.js`** - User management
  - **Connections**: User model
  - **Content**: User CRUD operations, profile management
- **`setupController.js`** - SETUP program applications
  - **Connections**: SETUPApplication model, User model
  - **Content**: Application submission, review, and management
- **`giaController.js`** - GIA program applications
- **`cestController.js`** - CEST program applications
- **`sscpController.js`** - SSCP program applications
- **`programApplicationController.js`** - Generic program applications
- **`enrollmentController.js`** - User enrollment management

#### 📂 `/server/src/routes/` - API Routes
- **`authRoutes.js`** - Authentication endpoints
  - **Connections**: authController
  - **Content**: Login, register, password reset routes
- **`userRoutes.js`** - User management endpoints
  - **Connections**: userController
  - **Content**: User CRUD, profile management routes
- **`programRoutes.js`** - Program-related endpoints
  - **Connections**: Program controllers
  - **Content**: Program management, application routes
- **`enrollmentRoutes.js`** - Enrollment endpoints
  - **Connections**: enrollmentController
  - **Content**: User enrollment and registration routes

#### 📂 `/server/src/middleware/` - Custom Middleware
- **`auth.js`** - JWT authentication middleware
  - **Connections**: Used by all protected routes
  - **Content**: Token verification and user authentication
- **`upload.js`** - File upload middleware
  - **Connections**: Used by application controllers
  - **Content**: File upload handling and validation

#### 📂 `/server/src/services/` - External Services
- **`emailService.js`** - Email notification service
  - **Connections**: Used by controllers for notifications
  - **Content**: Email sending functionality

#### 📂 `/server/src/utils/` - Utility Functions
- **`seedData.js`** - Database seeding utilities
- **`seedPSTO.js`** - PSTO data seeding

#### 📂 `/server/uploads/` - File Storage
- **Purpose**: Stores uploaded application files (PDFs, DOCX)
- **Content**: User-uploaded documents and attachments

---

## 🔗 Key Connections and Data Flow

### Authentication Flow
1. **User Registration/Login** → `authController.js` → `User.js` model
2. **JWT Token** → `auth.js` middleware → Protected routes
3. **Role-based Access** → `Sidebar.jsx` → Role-specific navigation

### Application Flow
1. **Program Selection** → `ProgramSelection.jsx` → `MultiStepForm.jsx`
2. **Form Submission** → `setupController.js` → `SETUPApplication.js` model
3. **PSTO Review** → `ApplicationsPageTemplate.jsx` → `setupController.js`
4. **Status Updates** → Database → `ApplicationMonitor.jsx`

### Component Hierarchy
```
App.jsx
├── MainLayout.jsx
│   ├── Header.jsx
│   └── Sidebar.jsx
├── Role-based Dashboards
│   ├── ProponentMainPage.jsx
│   ├── DostMimaropaDashboard.jsx
│   └── PSTO Dashboards
└── Page Components
    ├── ProgramSelectionPage.jsx
    ├── ApplicationMonitorPage.jsx
    └── ApplicationsPage.jsx (PSTO)
```

### API Endpoints Structure
```
/api/auth/*          → Authentication
/api/users/*         → User management
/api/programs/*      → Program applications
/api/enrollment/*    → User enrollment
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd client
   npm install
   
   # Backend
   cd ../server
   npm install
   ```

### Running the Application
1. Start MongoDB service
2. Start the backend server:
   ```bash
   cd server
   npm start
   ```
3. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

### Windows Quick Start
Use the provided `start.bat` file to start both frontend and backend simultaneously.

---

## 📝 Notes

- **Clean Architecture**: The project follows clean code principles with reusable components
- **Role-based Access**: Different user roles (Proponent, PSTO, DOST, Super Admin) have different interfaces
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **File Uploads**: Supports PDF and DOCX file uploads for applications
- **Real-time Features**: Interactive elements and mini-games for user engagement
- **Dark Mode**: Full dark mode support throughout the application

---

## 🔧 Development

### Code Organization
- **Components**: Reusable UI components in `/Component/UI/`
- **Pages**: Page-level components in `/Pages/`
- **Hooks**: Custom React hooks in `/Component/*/hooks/`
- **Utils**: Utility functions in `/Component/Utils/` and `/server/src/utils/`

### Database Models
- **User**: Central user model with role-based fields
- **Applications**: Separate models for each program type
- **Programs**: Program definitions and metadata
- **PSTO/Proponent**: Organization-specific models

This documentation provides a comprehensive overview of the PMNS 2.0 project structure, helping developers understand the codebase organization and component relationships.
