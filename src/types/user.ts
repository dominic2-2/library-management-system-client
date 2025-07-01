export interface User {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    create_date?: string;
    is_active?: boolean;
    role_id: number;
}
