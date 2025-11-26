export interface SignupDto {
  username: string;
  password: string;
  categoryIds: number[];
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface CategoryDto {
  id: number;
  name: string;
}
