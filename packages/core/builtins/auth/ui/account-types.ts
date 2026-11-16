export type AccountSessionView = {
  user: { id: string; email: string; name: string } | null;
  roles: string[];
};
