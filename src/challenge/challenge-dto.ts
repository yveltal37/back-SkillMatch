export interface CreateChallengeDto {
  name: string;
  description: string;
  expirationDate: string;
  categoryIds: number[];
}
