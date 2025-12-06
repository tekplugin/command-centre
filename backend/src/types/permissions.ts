// Permission system for role-based access control
export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  
  // Company Management
  COMPANY_CREATE = 'company:create',
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  
  // Department Access
  DEPARTMENT_ALL = 'department:all',           // Access to all departments
  DEPARTMENT_FINANCE = 'department:finance',
  DEPARTMENT_LEGAL = 'department:legal',
  DEPARTMENT_HR = 'department:hr',
  DEPARTMENT_MARKETING = 'department:marketing',
  DEPARTMENT_SALES = 'department:sales',
  DEPARTMENT_ENGINEERING = 'department:engineering',
  DEPARTMENT_OPERATIONS = 'department:operations',
  DEPARTMENT_CUSTOMER_SERVICE = 'department:customer_service',
  DEPARTMENT_IT = 'department:it',
  DEPARTMENT_PROCUREMENT = 'department:procurement',
  
  // Financial Management
  FINANCIAL_READ = 'financial:read',
  FINANCIAL_WRITE = 'financial:write',
  FINANCIAL_DELETE = 'financial:delete',
  FINANCIAL_APPROVE = 'financial:approve',
  
  // Project Management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_ASSIGN = 'project:assign',
  
  // HR Management
  HR_READ = 'hr:read',
  HR_WRITE = 'hr:write',
  HR_DELETE = 'hr:delete',
  HR_APPROVE = 'hr:approve',
  
  // Sales Management
  SALES_READ = 'sales:read',
  SALES_WRITE = 'sales:write',
  SALES_DELETE = 'sales:delete',
  
  // Marketing Management
  MARKETING_READ = 'marketing:read',
  MARKETING_WRITE = 'marketing:write',
  MARKETING_DELETE = 'marketing:delete',
  
  // AI Features
  AI_USE = 'ai:use',
  AI_MANAGE = 'ai:manage',
  
  // Reports
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',
  
  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_MANAGE = 'settings:manage',
}

export const RolePermissions: Record<string, Permission[]> = {
  admin: [
    // Global admin - full access to everything
    ...Object.values(Permission),
  ],
  
  executive: [
    // Access to all departments
    Permission.DEPARTMENT_ALL,
    
    // User management (read only, can't delete)
    Permission.USER_READ,
    
    // Company (read and update)
    Permission.COMPANY_READ,
    Permission.COMPANY_UPDATE,
    
    // Financial (full access)
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_WRITE,
    Permission.FINANCIAL_DELETE,
    Permission.FINANCIAL_APPROVE,
    
    // Projects (full access)
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_ASSIGN,
    
    // HR (full access)
    Permission.HR_READ,
    Permission.HR_WRITE,
    Permission.HR_DELETE,
    Permission.HR_APPROVE,
    
    // Sales (full access)
    Permission.SALES_READ,
    Permission.SALES_WRITE,
    Permission.SALES_DELETE,
    
    // Marketing (full access)
    Permission.MARKETING_READ,
    Permission.MARKETING_WRITE,
    Permission.MARKETING_DELETE,
    
    // AI
    Permission.AI_USE,
    Permission.AI_MANAGE,
    
    // Reports
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    
    // Settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_MANAGE,
  ],
  
  manager: [
    // Department managers can manage their department's users
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    
    // Company (read only)
    Permission.COMPANY_READ,
    
    // Department-specific permissions (determined by assigned departments)
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_WRITE,
    
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_ASSIGN,
    
    Permission.HR_READ,
    Permission.HR_WRITE,
    
    Permission.SALES_READ,
    Permission.SALES_WRITE,
    
    Permission.MARKETING_READ,
    Permission.MARKETING_WRITE,
    
    Permission.AI_USE,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],
  
  staff: [
    // Staff only have access to their assigned departments
    // User (read only their own profile)
    Permission.USER_READ,
    
    // Company (read only)
    Permission.COMPANY_READ,
    
    // Department-specific permissions (limited by assigned departments)
    Permission.FINANCIAL_READ,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.HR_READ,
    Permission.SALES_READ,
    Permission.SALES_WRITE,
    Permission.MARKETING_READ,
    Permission.MARKETING_WRITE,
    
    // AI (use only)
    Permission.AI_USE,
    
    // Reports (view only)
    Permission.REPORTS_VIEW,
    
    // Settings (view only)
    Permission.SETTINGS_VIEW,
  ],
};

export function hasPermission(roles: string[], permission: Permission): boolean {
  // Check if any of the user's roles have this permission
  return roles.some(role => {
    const permissions = RolePermissions[role] || [];
    return permissions.includes(permission);
  });
}

export function hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(roles, permission));
}

export function hasAllPermissions(roles: string[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(roles, permission));
}
