export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'observer';
  createdAt: string;
}
