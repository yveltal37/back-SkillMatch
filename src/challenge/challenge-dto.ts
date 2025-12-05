export interface CreateChallengeDto {
  name: string;
  description: string;
  expirationDate: string;
  categoryIds: number[];
}

export interface ChallengeDto extends CreateChallengeDto{
  categories: string[];
  id: number;
  isComplete: boolean;
}
