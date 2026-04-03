import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCropDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsIn(['Short term', 'Mid term', 'Long term'])
  horizon: string;

  @IsString()
  @IsIn(['active', 'planned'], { message: 'Status must be either active or planned' })
  status: string;

  @IsString()
  @IsNotEmpty({ message: 'Cycle is required' })
  cycle: string;

  @IsString()
  @IsNotEmpty({ message: 'Market use is required' })
  marketUse: string;
}