import { HistChart } from './hist-price';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Metadata } from './metadata';
import { Quote } from './quote';
import { News } from './news';
import { InsiderSentiment } from './insider';
import { Recommendation } from './recommendation';
import { Earnings } from './earnings';
import { HourlyChart } from './hourly-chart';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor() { }

  private tickerSubject = new BehaviorSubject<string>('');
  private martketStatusSubject = new BehaviorSubject<boolean>(false);
  private metadataSubject = new BehaviorSubject<Metadata>({} as Metadata);
  private quoteSubject = new BehaviorSubject<Quote>({} as Quote);
  private peersSubject = new BehaviorSubject<String[]>([]);
  private newsSubject = new BehaviorSubject<News[]>([]);
  //private histChartOptionsSubject = new BehaviorSubject<any>({});
  private histChartOptionsSubject = new BehaviorSubject<Highcharts.Options | null>(null);
  private hourlyChartOptionsSubject = new BehaviorSubject<Highcharts.Options | null>(null);
  private recommendationChartSubject = new BehaviorSubject<Recommendation[]>([]);
  private earningsChartSubject = new BehaviorSubject<Earnings[]>([]);
  private insiderSubject = new BehaviorSubject<InsiderSentiment>({} as InsiderSentiment);

  public metadataDict: Map<string, Metadata> = new Map<string, Metadata>();
  private hourlyChartDict: Map<string, HourlyChart> = new Map<string, HourlyChart>();
  private histChartDict: Map<string, HistChart> = new Map<string, HistChart>();
  private ticker = '';

  getTickerVariable(){
    return this.ticker;
  }

  setTickerVariable(ticker:any){
    this.ticker = ticker;
  }

  getMetadataVariable(){
    return this.metadataDict.get('metadata');
  }

  // Setter to update the metadata for a given ticker
  setMetadataVariable(metadata: Metadata) {
    this.metadataDict.set('metadata', metadata);
  }

  getHourlyChartVariable(){
    return this.hourlyChartDict.get('hourlyChart');
  }

  setHourlyChartVariable(hourlyChart: HourlyChart){
    this.hourlyChartDict.set('hourlyChart', hourlyChart);
  }

  getHistChartVariable(){
    return this.histChartDict.get('histChart');
  }

  setHistChartVariable(histChart: HistChart){
    this.histChartDict.set('histChart', histChart);
  }


  setTicker(ticker: string){
    console.log("State ticker: ", ticker);
    this.tickerSubject.next(ticker);
  }

  getTicker(){
    return this.tickerSubject.asObservable();
  }

  setMetadata(metadata: Metadata){
    this.metadataSubject.next(metadata);
  }

  getMetadata(){
    return this.metadataSubject.asObservable();
  }

  setQuote(quote: Quote){
    this.quoteSubject.next(quote);
  }

  getQuote(){
    return this.quoteSubject.asObservable();
  }

  setPeers(peers: String[]){
    this.peersSubject.next(peers);
  }

  getPeers(){
    return this.peersSubject.asObservable();
  }

  setNews(news: News[]){
    this.newsSubject.next(news);
  }

  getNews(){
    return this.newsSubject.asObservable();
  }

  setMarketStatus(marketStatus: boolean){
    this.martketStatusSubject.next(marketStatus);
  }

  getMarketStatus(){
    return this.martketStatusSubject.asObservable();
  }

  // setHourlyChartOptions(hourlyChartOptions: Highcharts.Options){
  //   this.hourlyChartOptionsSubject.next(hourlyChartOptions);
  // }

  // getHourlyChartOptions(){
  //   return this.hourlyChartOptionsSubject.asObservable();
  // }

  // setHistChartOptions(histChartOptions: Highcharts.Options){
  //   this.histChartOptionsSubject.next(histChartOptions);
  // }

  // getHistChartOptions(){
  //   return this.histChartOptionsSubject.asObservable();
  // }

  setRecommendationChart(recommendationChart: Recommendation[]){
    this.recommendationChartSubject.next(recommendationChart);
  }

  getRecommendationChart(){
    return this.recommendationChartSubject.asObservable();
  }

  setEarningsChart(earningsChart: Earnings[]){
    this.earningsChartSubject.next(earningsChart);
  }

  getEarningsChart(){
    return this.earningsChartSubject.asObservable();
  }

  setInsider(insider: InsiderSentiment){
    this.insiderSubject.next(insider);
  }

  getInsider(){
    return this.insiderSubject.asObservable();
  }

}