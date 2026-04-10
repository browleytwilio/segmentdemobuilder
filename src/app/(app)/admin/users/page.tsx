import { getAdminUsers } from "../actions";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  const { data: users, error } = await getAdminUsers();

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load users: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>
      <UsersTable users={users ?? []} />
    </div>
  );
}
