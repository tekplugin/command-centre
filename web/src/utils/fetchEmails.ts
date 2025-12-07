// Utility to fetch emails from the backend API (MongoDB)
// Uses NEXT_PUBLIC_API_URL from environment variables

export async function fetchEmails() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/email/inbox`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.statusText}`);
  }

  return response.json();
}
