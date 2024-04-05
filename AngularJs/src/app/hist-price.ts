export interface HistChart {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results: Result[];
    status: string;
    request_id: string;
    count: number;
  }
  
  export interface Result {
    v: number;
    vw: number;
    o: number;
    c: number;
    h: number;
    l: number;
    t: number;
    n: number;
  }