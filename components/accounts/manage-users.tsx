"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus } from "lucide-react";

type Role = "Owner" | "Admin" | "Editor" | "Viewer";

interface UserRow {
  id: string;
  userId: string;
  role: string;
  user: { id: string; email: string; name: string | null };
}

interface Props {
  accountId: string;
  accountName: string;
  initialUsers: UserRow[];
  canManage: boolean;
  currentUserId: string;
}

const ROLE_COLORS: Record<string, string> = {
  Owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Editor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Viewer: "bg-muted text-muted-foreground",
};

export function ManageUsers({ accountId, accountName, initialUsers, canManage, currentUserId }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Editor");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const res = await fetch(`/api/accounts/${accountId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setAdding(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add user");
      return;
    }
    const newUser: UserRow = await res.json();
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.userId === newUser.userId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newUser;
        return updated;
      }
      return [...prev, newUser];
    });
    setEmail("");
    router.refresh();
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    setUpdatingId(userId);
    const res = await fetch(`/api/accounts/${accountId}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUpdatingId(null);
    if (!res.ok) return;
    const updated: UserRow = await res.json();
    setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
  }

  async function handleRemove(userId: string) {
    setUpdatingId(userId);
    const res = await fetch(`/api/accounts/${accountId}/users/${userId}`, { method: "DELETE" });
    setUpdatingId(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to remove user");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" /> Add user
            </CardTitle>
            <CardDescription>
              Enter the email of an existing workspace user to grant them access to <strong>{accountName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 w-36">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={adding}>
                {adding ? "Adding…" : "Add"}
              </Button>
            </form>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-4">No users yet.</p>
          ) : (
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-6 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{u.user.name ?? u.user.email}</p>
                    {u.user.name && (
                      <p className="text-xs text-muted-foreground truncate">{u.user.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canManage ? (
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.userId, v as Role)}
                        disabled={updatingId === u.userId}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`text-xs font-normal ${ROLE_COLORS[u.role] ?? ""}`}>
                        {u.role}
                      </Badge>
                    )}
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(u.userId)}
                        disabled={updatingId === u.userId}
                        title={u.userId === currentUserId ? "Leave account" : "Remove user"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
