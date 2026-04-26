"use client";

import { useState } from "react";
import { Users, Car, Shield, Search, Ban, CheckCircle, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  role: string;
  driver?: {
    approvalStatus: string;
    isOnline: boolean;
  };
}

interface UserManagementProps {
  customers: User[];
  drivers: User[];
  admins: User[];
}

export function UserManagement({ customers, drivers, admins }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  };

  const UserRow = ({ user }: { user: User }) => (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            {user.role === "DRIVER" ? (
              <Car className="h-4 w-4 text-green-600" />
            ) : user.role === "ADMIN" ? (
              <Shield className="h-4 w-4 text-purple-600" />
            ) : (
              <Users className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{user.name || "İsimsiz"}</p>
            <p className="text-xs text-muted-foreground">{user.phone || "-"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-sm">{user.email || "-"}</td>
      <td className="py-3 px-2">
        <Badge
          variant={user.status === "ACTIVE" ? "default" : "destructive"}
          className={
            user.status === "ACTIVE"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : user.status === "SUSPENDED"
              ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
              : ""
          }
        >
          {user.status === "ACTIVE" ? "Aktif" : user.status === "SUSPENDED" ? "Askıya alınmış" : user.status}
        </Badge>
      </td>
      <td className="py-3 px-2">
        {user.role === "DRIVER" && user.driver ? (
          <Badge
            variant="outline"
            className={
              user.driver.isOnline
                ? "border-green-500 text-green-600"
                : "border-gray-400 text-gray-500"
            }
          >
            {user.driver.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-2 text-sm text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          {user.role !== "ADMIN" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-orange-600"
              title={user.status === "SUSPENDED" ? "Aktif et" : "Banla"}
            >
              {user.status === "SUSPENDED" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Müşteri, sürücü ve admin yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Müşteriler
            <Badge variant="secondary">{customers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Car className="h-4 w-4" />
            Sürücüler
            <Badge variant="secondary">{drivers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Shield className="h-4 w-4" />
            Adminler
            <Badge variant="secondary">{admins.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Müşteri</th>
                      <th className="text-left py-3 px-2 font-medium">E-posta</th>
                      <th className="text-left py-3 px-2 font-medium">Durum</th>
                      <th className="text-left py-3 px-2 font-medium">Kayıt</th>
                      <th className="text-left py-3 px-2 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(customers).map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                    {filterUsers(customers).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Müşteri bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Sürücü</th>
                      <th className="text-left py-3 px-2 font-medium">E-posta</th>
                      <th className="text-left py-3 px-2 font-medium">Durum</th>
                      <th className="text-left py-3 px-2 font-medium">Çevrimiçi</th>
                      <th className="text-left py-3 px-2 font-medium">Kayıt</th>
                      <th className="text-left py-3 px-2 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(drivers).map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                    {filterUsers(drivers).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Sürücü bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Admin</th>
                      <th className="text-left py-3 px-2 font-medium">E-posta</th>
                      <th className="text-left py-3 px-2 font-medium">Durum</th>
                      <th className="text-left py-3 px-2 font-medium">Kayıt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(admins).map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                    {filterUsers(admins).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          Admin bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}