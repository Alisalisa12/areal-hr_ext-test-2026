export interface User {
  id: string;
  role_id: string;
  employee_id: string;
  login: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role_name?: string;
  employee_fio?: string;
}

export interface AuthUser {
  id: string;
  login: string;
  role_id: string;
  employee_id: string;
  role_name: string | null;
  employee_fio: string;
}

export interface CreateUserDto {
  role_id: string;
  employee_id: string;
  login: string;
  password: string;
}

export interface UpdateUserDto {
  role_id?: string;
  employee_id?: string;
  login?: string;
  password?: string;
}
