export type UserRole = 'admin' | 'viewer' | 'demo';

export interface Garage {
    id: string;
    name: string;
    is_demo: boolean;
    created_at: string;
}

export interface GarageMember {
    garage_id: string;
    user_id: string;
    role: UserRole;
    created_at: string;
}