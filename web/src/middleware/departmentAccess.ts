/**
 * Department Access Control Helper
 * Validates if a user has access to a specific department/module
 */

interface UserData {
  roles?: string[];
  departments?: string[];
}

export const checkDepartmentAccess = (
  department: string | null,
  userData: UserData | null
): boolean => {
  if (!userData) return false;

  const roles = userData.roles || [];
  const departments = userData.departments || [];

  // Admin and Executive have access to everything
  if (roles.includes('admin') || roles.includes('executive')) {
    return true;
  }

  // If no specific department required, allow access
  if (!department) {
    return true;
  }

  // Check if user has the required department
  return departments.includes(department);
};

export const getDepartmentForRoute = (pathname: string): string | null => {
  const routeToDepartment: Record<string, string> = {
    '/cfo': 'finance',
    '/hr': 'hr',
    '/sales': 'sales',
    '/marketing': 'marketing',
    '/legal': 'legal',
    '/engineers': 'engineering',
    '/inventory': 'operations',
  };

  return routeToDepartment[pathname] || null;
};
