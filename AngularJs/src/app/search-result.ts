export interface Company {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string; 
  }
  
  export interface SearchResult {
    count: number;
    result: Company[];
  }