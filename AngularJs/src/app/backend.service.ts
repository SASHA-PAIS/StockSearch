import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HOST } from './host';
import { SearchResult } from './search-result';
import { Metadata } from './metadata';
import { Quote } from './quote';
import { HourlyChart } from './hourly-chart';
import { HistChart } from './hist-price';
import { IsAny } from 'mongodb';
import { Recommendation } from './recommendation';
import { InsiderSentiment } from './insider';
import { Earnings } from './earnings';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  // private searchURL = HOST + '/autocomplete';
  // private metadataURL = HOST + '/company';
  // private quoteURL = HOST + '/quote';
  // private peersURL = HOST + '/peers';
  // private hourlyChartURL = HOST + '/hourlyChart';
  // private histChartURL = HOST + '/histChart';
  // private newsURL = HOST + '/news';
  // private recommendationURL = HOST + '/recommendation';
  // private insiderURL = HOST + '/insider';
  // private earningsURL = HOST + '/earnings';
  // private portfolioGetURL = HOST + '/get/portfolio';
  // private portfolioUpdateURL = HOST + '/update/portfolio';
  // private watchlistGetURL = HOST + '/get/watchlist';
  // private watchlistUpdateURL = HOST + '/update/watchlist';


  private searchURL = '/autocomplete';
  private metadataURL = '/company';
  private quoteURL = '/quote';
  private peersURL = '/peers';
  private hourlyChartURL = '/hourlyChart';
  private histChartURL = '/histChart';
  private newsURL = '/news';
  private recommendationURL = '/recommendation';
  private insiderURL = '/insider';
  private earningsURL = '/earnings';
  private portfolioGetURL = '/get/portfolio';
  private portfolioUpdateURL = '/update/portfolio';
  private watchlistGetURL = '/get/watchlist';
  private watchlistUpdateURL = '/update/watchlist';

  constructor(private http: HttpClient) { }

  // MongoDB functions

  fetchPortfolio(userId: string): Observable<any>{
    const portfolioGetUtilUrl = `${this.portfolioGetURL}?userId=${userId}`;
    return this.http.get<any>(portfolioGetUtilUrl);
  }

  updatePortfolio(userId: string, portfolio: any): Observable<any> {
    const portfolioUpdateUtilUrl = `${this.portfolioUpdateURL}`;
    console.log("update link", portfolioUpdateUtilUrl);
    console.log(this.http.put(portfolioUpdateUtilUrl, { userId: userId, portfolio: portfolio }).subscribe(response =>
      console.log(response)));
    return this.http.put(portfolioUpdateUtilUrl, { "userId": userId, "portfolio": portfolio });
  }

  fetchWatchlist(userId: string): Observable<any>{
    const watchlistGetUtilUrl = `${this.watchlistGetURL}?userId=${userId}`;
    //console.log('Fetch watchlist', watchlistGetUtilUrl);
    return this.http.get<any>(watchlistGetUtilUrl);
  }

  updateWatchlist(userId: string, watchlist: any): Observable<any> {
    const watchlistUpdateUtilUrl = `${this.watchlistUpdateURL}`;
    console.log("update link", watchlistUpdateUtilUrl);
    console.log(this.http.put(watchlistUpdateUtilUrl, { userId: userId, watchlist: watchlist }).subscribe(response =>
      console.log(response)));
    return this.http.put(watchlistUpdateUtilUrl, { "userId": userId, "watchlist": watchlist });
  }

  fetchAutoComplete(symbol: string): Observable<SearchResult>{  
    const searchUtilURL = `${this.searchURL}?symbol=${symbol}`;
    //console.log(searchUtilURL)
    return this.http.get<SearchResult>(searchUtilURL).pipe(
      catchError(this.handleError<any>('fetchAutoComplete'))
    );
  }

  fetchCompanyMetadata(ticker: string): Observable<Metadata>{
    const metadataUtilURL = `${this.metadataURL}?ticker=${ticker}`;
    //console.log(metadataUtilURL);
    return this.http.get<Metadata>(metadataUtilURL);
  }

  fetchQuote(ticker: string): Observable<Quote>{
    const quoteUtilURL = `${this.quoteURL}?ticker=${ticker}`;
    //console.log(quoteUtilURL);
    return this.http.get<Quote>(quoteUtilURL);
  }

  fetchPeers(ticker: string): Observable<String[]>{
    const peersUtilURL = `${this.peersURL}?ticker=${ticker}`;
    //console.log(peersUtilURL);
    return this.http.get<String[]>(peersUtilURL);
  }

  fetchNews(ticker: string): Observable<String[]>{
    const newsUtilURL = `${this.newsURL}?ticker=${ticker}`;
    //console.log(newsUtilURL);
    return this.http.get<String[]>(newsUtilURL);
  }
  
  fetchHourlyChart(ticker: string, fromDate: string, toDate: string): Observable<HourlyChart>{
    const hourlyChartUtilURL = `${this.hourlyChartURL}?ticker=${ticker}&fromDate=${fromDate}&toDate=${toDate}`;
    //console.log("URL:", hourlyChartUtilURL);
    return this.http.get<HourlyChart>(hourlyChartUtilURL);
  }

  fetchHistChart(ticker: string, fromDate: string, toDate: string): Observable<HistChart>{
    const histChartUtilURL = `${this.histChartURL}?ticker=${ticker}&fromDate=${fromDate}&toDate=${toDate}`;
    //console.log("URL:", histChartUtilURL);
    return this.http.get<HistChart>(histChartUtilURL);
  }

  fetchRecommendations(ticker: string):Observable<Recommendation>{
    const recommendationUtilURL =  `${this.recommendationURL}?ticker=${ticker}`;
    //console.log(recommendationUtilURL);
    return this.http.get<Recommendation>(recommendationUtilURL);
  }

  fetchInsider(ticker:string):Observable<InsiderSentiment>{
    const insiderUtilURL = `${this.insiderURL}?ticker=${ticker}`;
    //console.log(insiderUtilURL);
    return this.http.get<InsiderSentiment>(insiderUtilURL);
  }

  fetchEarnings(ticker:string): Observable<Earnings>{
    const earningsUtilURL = `${this.earningsURL}?ticker=${ticker}`;
    //console.log(earningsUtilURL);
    return this.http.get<Earnings>(earningsUtilURL);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
     // console.error(error); // log to console instead
     // console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}

