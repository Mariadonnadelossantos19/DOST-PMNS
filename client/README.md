# DOST-PMNS Client

A comprehensive Project Management and Notification System built with React and Tailwind CSS.

## Features

### 🏗️ Layout System
- **Header**: Responsive header with search, notifications, and user profile
- **Sidebar**: Collapsible navigation sidebar with menu items
- **MainLayout**: Complete layout wrapper combining header and sidebar

### 🎨 UI Components
- **Button**: Versatile button component with multiple variants and sizes
- **Card**: Flexible card component with header, content, and footer sections
- **Modal**: Accessible modal component with overlay and keyboard support
- **Input**: Form input component with validation states and icons
- **Badge**: Status and category badges with color variants
- **Alert**: Notification alerts with different severity levels

### 📊 Project Management
- **ProjectCard**: Comprehensive project display with progress tracking
- **TaskList**: Kanban-style task management with drag-and-drop functionality
- **ProjectDashboard**: Complete dashboard with statistics and project overview

### 🔔 Notification System
- **NotificationCenter**: Full notification management interface
- **NotificationDropdown**: Header notification dropdown
- **NotificationToast**: Toast notifications for real-time updates
- **NotificationProvider**: Context provider for global notification management

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Component Usage

### Basic Layout
```jsx
import { MainLayout } from './Component';

function App() {
   const user = {
      name: 'John Doe',
      role: 'Project Manager',
      avatar: '/path/to/avatar.jpg'
   };

   const handleLogout = () => {
      // Logout logic
   };

   return (
      <MainLayout user={user} onLogout={handleLogout}>
         <YourContent />
      </MainLayout>
   );
}
```

### Project Dashboard
```jsx
import { ProjectDashboard } from './Component';

const projects = [
   {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete website overhaul',
      status: 'active',
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      teamSize: 5,
      completedTasks: 12,
      totalTasks: 25
   }
];

const tasks = [
   {
      id: 1,
      title: 'Design Homepage',
      description: 'Create new homepage design',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      projectId: 1
   }
];

function App() {
   return (
      <ProjectDashboard
         projects={projects}
         tasks={tasks}
         onProjectUpdate={(id, updates) => console.log('Update project:', id, updates)}
         onTaskUpdate={(id, updates) => console.log('Update task:', id, updates)}
         onTaskCreate={(task) => console.log('Create task:', task)}
         onTaskDelete={(id) => console.log('Delete task:', id)}
      />
   );
}
```

### Notifications
```jsx
import { NotificationProvider, useNotifications } from './Component';

function AppContent() {
   const { showSuccess, showError, showInfo, showWarning } = useNotifications();

   const handleAction = () => {
      showSuccess('Action completed successfully!');
   };

   return (
      <div>
         <button onClick={handleAction}>Perform Action</button>
      </div>
   );
}

function App() {
   return (
      <NotificationProvider>
         <AppContent />
      </NotificationProvider>
   );
}
```

## Component Props

### MainLayout
- `user`: User object with name, role, and avatar
- `onLogout`: Function called when logout button is clicked
- `children`: Content to render inside the layout

### ProjectDashboard
- `projects`: Array of project objects
- `tasks`: Array of task objects
- `onProjectUpdate`: Function called when a project is updated
- `onTaskUpdate`: Function called when a task is updated
- `onTaskCreate`: Function called when a new task is created
- `onTaskDelete`: Function called when a task is deleted

### Button
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'link'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `disabled`: Boolean
- `loading`: Boolean
- `icon`: React element
- `iconPosition`: 'left' | 'right'

### Card
- `padding`: 'none' | 'sm' | 'default' | 'lg'
- `shadow`: 'none' | 'sm' | 'default' | 'lg' | 'xl'
- `border`: Boolean
- `hover`: Boolean

## Styling

The application uses Tailwind CSS for styling. All components are built with Tailwind classes and are fully responsive.

### Custom CSS Classes
- `.line-clamp-2`: Truncates text to 2 lines
- `.line-clamp-3`: Truncates text to 3 lines
- `.custom-scrollbar`: Custom scrollbar styling
- `.focus-ring`: Custom focus ring styles

## Development

### Project Structure
```
src/
├── Component/
│   ├── Layouts/          # Layout components
│   ├── UI/              # Reusable UI components
│   ├── ProjectManagement/ # PM-specific components
│   ├── Notifications/   # Notification components
│   └── index.js         # Component exports
├── App.jsx              # Main application
├── App.css              # Global styles
└── main.jsx             # Application entry point
```

### Adding New Components

1. Create your component in the appropriate directory
2. Export it from the directory's `index.js` file
3. Add it to the main `Component/index.js` export file
4. Use Tailwind classes for styling
5. Follow the existing component patterns

## Contributing

1. Follow the existing code style and patterns
2. Use Tailwind CSS for all styling
3. Add proper TypeScript types if using TypeScript
4. Include proper prop validation
5. Write clean, readable code with comments

## License

This project is part of the DOST-PMNS system.