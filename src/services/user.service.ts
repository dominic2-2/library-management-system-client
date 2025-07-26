import { ENV } from "@/config/env";
import {
  AdminResetPasswordRequestDTO,
  AdminUpdateUserRequestDTO,
  CreateUserRequestDTO,
  User,
} from "@/features/user/user.types";

export const userService = {
  async getAllUsers(token: string): Promise<User[]> {
    const response = await fetch(`${ENV.apiUrl}/user/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const result = await response.json();

    // Handle .NET API response format with $values
    if (result.$values && Array.isArray(result.$values)) {
      return result.$values;
    }

    // Fallback for direct array response
    if (Array.isArray(result)) {
      return result;
    }

    // Fallback for object with users property
    if (result.users && Array.isArray(result.users)) {
      return result.users;
    }

    // If no valid format found, return empty array
    console.warn("Unexpected API response format:", result);
    return [];
  },

  async createUser(
    token: string,
    userData: CreateUserRequestDTO
  ): Promise<User> {
    const response = await fetch(`${ENV.apiUrl}/user/admin/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Failed to create user");
    return response.json();
  },

  async updateUser(
    token: string,
    userData: AdminUpdateUserRequestDTO
  ): Promise<void> {
    const response = await fetch(`${ENV.apiUrl}/user/admin/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Failed to update user");
  },

  async resetPassword(
    token: string,
    resetData: AdminResetPasswordRequestDTO
  ): Promise<void> {
    const response = await fetch(`${ENV.apiUrl}/user/admin/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });

    if (!response.ok) throw new Error("Failed to reset password");
  },

  async deleteUser(token: string, userId: number): Promise<void> {
    const response = await fetch(`${ENV.apiUrl}/user/admin/delete/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to delete user");
  },

  async getUsersPaged(
    token: string,
    page: number,
    pageSize: number
  ): Promise<{ users: User[]; total: number }> {
    const response = await fetch(
      `${ENV.apiUrl}/user/admin/paged?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch paginated users");

    const result = await response.json();

    return {
      users: result.items, // ✅ Đúng key
      total: result.totalCount, // ✅ Đúng key
    };
  },

  async getUsersByOData(
    token: string,
    query: string
  ): Promise<{ users: User[]; total: number }> {
    const response = await fetch(`${ENV.odataUrl}/UsersOData?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch users with OData");

    const result = await response.json();

    // OData trả về direct array
    const rawUsers = Array.isArray(result) ? result : [];

    const users = rawUsers.map((u: any) => ({
      userId: u.userId,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      address: u.address,
      roleId: u.roleId || 0,
      roleName: u.roleName || "Không rõ",
      isActive: u.isActive,
      createDate: u.createDate,
    }));

    console.log("✅ Final result:", { users, total: users.length });

    return {
      users,
      total: users.length,
    };
  },
};
