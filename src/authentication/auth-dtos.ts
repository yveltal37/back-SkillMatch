export class SignupDto {
  username: string;
  password: string;
  categoryIds: number[];
}

export class LoginDto {
  username: string;
  password: string;
}

export class CategoryDto {
  id: number;
  name: string;
}
