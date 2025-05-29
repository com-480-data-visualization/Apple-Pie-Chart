// src/app/types/culture.ts

export type CultureId = 
  | 'france' 
  | 'usa-south' 
  | 'argentina-latin-america' 
  | 'caribbean' 
  | 'brazil' 
  | 'uk-scotland-ireland' 
  | 'germany' 
  | 'uk-england' 
  | 'mexico' 
  | 'spain' 
  | 'nordic' 
  | 'portugal' 
  | 'italy' 
  | 'japan';

export interface Culture {
  id: CultureId;
  name: string;
  flag: string;
}

export interface CultureText {
  description: string;
  features: string[];
}