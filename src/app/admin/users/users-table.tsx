"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateUserRole } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminUser {
  id: string;
  email: string;
  role: "user" | "super_admin";
  created_at: string;
  playbook_count: number;
}

const PROTECTED_EMAIL = "browley@twilio.com";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(
    userId: string,
    newRole: "user" | "super_admin"
  ) {
    setUpdating(userId);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Role updated");
    }
    setUpdating(null);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Playbooks</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isProtected = user.email === PROTECTED_EMAIL;
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "super_admin" ? "default" : "secondary"
                  }
                >
                  {user.role === "super_admin" ? "Admin" : "User"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {user.playbook_count}
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                {isProtected ? (
                  <span className="text-xs text-muted-foreground">
                    Protected
                  </span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updating === user.id}
                        />
                      }
                    >
                      {updating === user.id ? "Updating..." : "Change Role"}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user.id, "user")}
                        disabled={user.role === "user"}
                      >
                        Make User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleRoleChange(user.id, "super_admin")
                        }
                        disabled={user.role === "super_admin"}
                      >
                        Make Super-Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
