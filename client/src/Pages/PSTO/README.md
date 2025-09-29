# PSTO Dashboard Architecture

## File Structure Explanation

### Current Setup (Simplified)

```
UnifiedPSTODashboard.jsx (Main Container)
├── Overview View
│   ├── PSTOStats (statistics cards)
│   └── Recent Applications (simple table)
├── Applications View → PSTOManagementDashboard.jsx
├── Management View → PSTOManagementDashboard.jsx  
├── TNA Management View → TNAManagement.jsx
├── Document Validation View → DocumentValidation.jsx
├── TNA Reports View → TNAReportUpload.jsx
└── Proponents View → ProponentManagement.jsx

PSTOManagementDashboard.jsx (Detailed Application Management)
├── Statistics Dashboard
├── Tabbed Interface (All, Pending, Approved, Returned, Rejected)
├── DataTable with Actions
└── ApplicationReviewModal
```

## Component Responsibilities

### UnifiedPSTODashboard.jsx
- **Role**: Main router/container for all PSTO views
- **Navigation**: Handles sidebar navigation and view switching
- **Data**: Uses `usePSTOData` hook for shared data
- **Views**: Renders different components based on `currentPage` prop

### PSTOManagementDashboard.jsx  
- **Role**: Specialized application management interface
- **Features**: Full CRUD operations, filtering, review workflow
- **Usage**: Embedded in UnifiedPSTODashboard for applications/management views
- **Independence**: Can work standalone with its own data fetching

## Navigation Flow

```
Sidebar Navigation (UnifiedLayout)
    ↓
UnifiedPSTODashboard (receives currentPage prop)
    ↓
Switch based on currentPage:
- 'dashboard' → Overview (stats + recent apps)
- 'applications' → PSTOManagementDashboard (full management)
- 'management' → PSTOManagementDashboard (same as applications)
- 'tna-management' → TNAManagement
- etc.
```

## Why This Structure?

1. **Separation of Concerns**: 
   - UnifiedPSTODashboard = Navigation & Layout
   - PSTOManagementDashboard = Business Logic & Operations

2. **Reusability**: 
   - PSTOManagementDashboard can be used independently
   - Other components can be easily swapped in/out

3. **Maintainability**: 
   - Clear boundaries between routing and functionality
   - Easier to test individual components

## Recommendations

1. **Keep both files** - they serve different purposes
2. **UnifiedPSTODashboard** should focus on layout and navigation
3. **PSTOManagementDashboard** should handle all application management logic
4. Consider renaming for clarity:
   - `UnifiedPSTODashboard` → `PSTODashboardContainer` 
   - `PSTOManagementDashboard` → `ApplicationManagement`
