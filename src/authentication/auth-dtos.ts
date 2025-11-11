export class SignupDto {
  username: string;
  password: string;
  categoryIds: number[];
}

export class CategoryDto {
  id: number;
  name: string;
}
