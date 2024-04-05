import { Recommendation } from './../../recommendation';
import { Earnings } from './../../earnings';
import { InsiderSentiment } from '../../insider';
import { InsiderSentimentData } from '../../insider';
import { HistChart } from './../../hist-price';
import { HourlyChart } from './../../hourly-chart';
import { StateService } from './../../state.service';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../backend.service';
import { Subscription, interval, Subject, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { News } from '../../news';
import { TransactionButtonComponent } from '../../transaction-button/transaction-button.component';
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrl: './stock-details.component.css'
})

export class StockDetailsComponent implements OnInit, OnDestroy{
  private _StarAlertSuccess = new Subject<string>();
  private _buyAlertSuccess = new Subject<string>();
  private _sellAlertSuccess = new Subject<string>();
  starSuccessMessage = '';
  buySuccessMessage = '';
  sellSucessMessage = '';
  ticker: string = '';
  metadata: any;
  quote: any;
  peers: any;
  tickerExists = false;
  convertedDate: any;
  private intervalSubscription: Subscription | null = null;
  marketOpen: boolean = false; 
  histChart: any;
  histChartFinish = false;
  histChartOptions: any
  toDate: any;
  fromDate: any;
  hourlyChart: any;
  hourlyChartColor: string = '';
  hourlyChartFinish = false;
  hourlyChartOptions: any;
  change: any;
  enabled: boolean = false;
  inWatchlist: boolean = false;
  paramSubscription: any;
  fetchQuoteforMarketSubscription: any;
  portfolio: any;
  watchlist: any;
  recommendationChart: any;
  insider: any;
  earningsChart: any;
  name: string = '';
  error1: boolean = false;
  error2: boolean = false;

  // News Parameter
  allNews: News[] = [];

  constructor(
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private backendService: BackendService,
    private state: StateService,
    private transModalService: NgbModal
  ){}

  convertUnixTimeToReadable(unixTime: number): string {
    const date = new Date(unixTime * 1000); // Convert seconds to milliseconds

    // Leading zeros helper function
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth is 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours()); // getHours is in 24-hour format
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(){
    console.log("ngOninit()");
    if(this.fetchQuoteforMarketSubscription){
      this.fetchQuoteforMarketSubscription.unsubscribe();
    }

    //this.state.getTicker().subscribe(ticker => {

    this.paramSubscription = this.route.params.subscribe(params => {
      this.ticker = this.state.getTickerVariable();
      this.error1 = false;
      this.error2 = false;

      if(this.ticker){
        this.error1 = false;
        const metadataVariable = this.state.getMetadataVariable();
        if(metadataVariable && metadataVariable.ticker && metadataVariable.ticker === this.ticker){
          this.error2 = false;
          this.metadata = metadataVariable;
          this.name = this.metadata.name;
          this.tickerExists = true;

          this.state.getQuote().subscribe(quote => {
            this.quote = quote;
            this.convertedDate = this.convertUnixTimeToReadable(this.quote.t);
            this.hourlyChartFinish = false;
            this.hourlyChart = this.state.getHourlyChartVariable();
            this.hourlyChartFinish = true;

            this.histChartFinish = false;
            this.histChart = this.state.getHistChartVariable();
            this.histChartFinish = true;
          });

          this.state.getPeers().subscribe(peers => {
            this.peers = peers;
          });

          this.state.getNews().subscribe(news => {
            this.allNews = news;
          });

          this.state.getRecommendationChart().subscribe(recommendationChart => {
            this.recommendationChart = recommendationChart;
          });

          this.state.getEarningsChart().subscribe(earningsChart => {
            this.earningsChart = earningsChart;
          });

          this.state.getInsider().subscribe(insider => {
            this.insider = insider;
          });

          this.state.getMarketStatus().subscribe(marketOpen => {
            this.marketOpen = marketOpen;
          });

        }
        else{
          this.fetchMetadata();
          this.fetchQuote();
          this.fetchHistChart();
          this.fetchPeers();
          this.fetchNews();
          this.fetchRecommendationChart();
          this.fetchInsider();
          this.fetchEarningsChart();
        }
        this.fetchPortfolio();
        this.fetchWatchlist();
        this.startPeriodicUpdate();
        // this.subscribeToRouteParams();

        console.log('tickerExists', this.tickerExists)
        console.log('Metadata: ', metadataVariable);
      }
      else{
        console.log("Ticker:" ,this.ticker)
        console.log("Metadata: ", this.metadata);
        if(!this.metadata || (Object.keys(this.metadata).length === 0) || this.metadata && this.metadata.ticker != ''){
          this.error1 = true;
        }
      }
    //});
    

    // for star alert -------
    this._StarAlertSuccess.subscribe(
      (message) => (this.starSuccessMessage = message)
    );

    this._StarAlertSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.starSuccessMessage = ''));

    // for buy success alert -------
    this._buyAlertSuccess.subscribe(
      (message) => (this.buySuccessMessage = message)
    );

    this._buyAlertSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.buySuccessMessage = ''));

    // for sell success alert -------
    this._sellAlertSuccess.subscribe(
      (message) => (this.sellSucessMessage = message)
    );

    this._sellAlertSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.sellSucessMessage = ''));
    });
      
  }

  // onAttach(){
  //   // Called when the component is reattached to the view
  //   this.startPeriodicUpdate();
  //   this.subscribeToRouteParams();
  // }

  // onDetach(){
  //   // Called when the component is detached from the view
  //   if (this.paramSubscription) {
  //     this.paramSubscription.unsubscribe();
  //   }

  //   if(this.intervalSubscription){
  //     this.intervalSubscription.unsubscribe();
  //   }
  // }

  public onClickStar(){
    this.inWatchlist = !this.inWatchlist;
    
    this.backendService.fetchWatchlist('sasha21sp').subscribe(watchlist => {
      this.watchlist = watchlist.watchlist;

      if(this.inWatchlist){
        let newWatchlistItem = {
          ticker: this.ticker.toUpperCase(),
          name: this.metadata.name
        };
        this.watchlist.push(newWatchlistItem);
        this.backendService.updateWatchlist('sasha21sp', this.watchlist);
      } else{
        let watchlistNew = this.watchlist.filter(
          (data:any) => data.ticker != this.ticker.toUpperCase()
        );
        this.backendService.updateWatchlist('sasha21sp', watchlistNew);
      }

    });
    this._StarAlertSuccess.next('Message successfully changed.');
  }

  private subscribeToRouteParams() {
    this.paramSubscription = this.route.params.subscribe(params => {
      const ticker = params['ticker'];
      if (ticker){
        
      }
    });
  }

  fetchPortfolio(){
    this.backendService.fetchPortfolio('sasha21sp').subscribe(portfolio => {
      this.portfolio = portfolio.portfolio;

      this.enabled = this.portfolio.stockItems.filter(
        (data:any) => data.ticker === this.ticker.toUpperCase()
      ).length ? true : false;
    });
  }

  fetchWatchlist(){
    this.backendService.fetchWatchlist('sasha21sp').subscribe(watchlist => {
      this.watchlist = watchlist.watchlist;
      this.inWatchlist = this.watchlist.filter(
        (data: any) => data.ticker === this.ticker.toUpperCase()
      ).length ? true : false;

    });
  }

  fetchMetadata(){
    this.backendService.fetchCompanyMetadata(this.ticker).subscribe((metadata: any) => {
      this.metadata = metadata;
      // console.log(this.metadata);

      if (this.metadata.ticker){
        this.tickerExists = true;
        this.error2 = false;
      } else{
        this.tickerExists = false;
        if(this.ticker){
          this.error2 = true;
        }
      }
      //console.log("Metadata fetched");
      this.state.setMetadata(this.metadata);
      this.state.setMetadataVariable(this.metadata);
      this.name = this.metadata.name;
    });
  }

  fetchQuote(){
    this.backendService.fetchQuote(this.ticker).subscribe((quote: any) => {
      this.quote = quote;
      this.state.setQuote(this.quote);
      this.changeDetectorRef.detectChanges();
      console.log("Quote fetched");
      this.convertedDate = this.convertUnixTimeToReadable(this.quote.t);

      const currentTime = Math.floor(Date.now() / 1000);
      const difference = currentTime - quote.t;
      this.marketOpen = difference <= 300;
      this.state.setMarketStatus(this.marketOpen);
      console.log("Market Open: ", this.marketOpen);
    
      this.fetchHourlyChart();
    });
  }

  checkMarketStatus(){
    if(this.fetchQuoteforMarketSubscription){
      this.fetchQuoteforMarketSubscription.unsubscribe();
    }

    this.fetchQuoteforMarketSubscription = this.backendService.fetchQuote(this.ticker).subscribe((quote: any) => {
      const currentTime = Math.floor(Date.now() / 1000);
      const difference = currentTime - quote.t;
      this.marketOpen = difference <= 300;
      //console.log("Difference",difference);
      this.state.setMarketStatus(this.marketOpen);
      console.log("Market Open inside market status method: ", this.marketOpen);

      if (this.marketOpen){
        this.quote = quote;
        this.state.setQuote(this.quote);
        this.changeDetectorRef.detectChanges();
        //console.log("Quote Updated");
      }
    });

  }
  startPeriodicUpdate(){
      if(this.intervalSubscription){
        this.intervalSubscription.unsubscribe();
      }
      this.intervalSubscription = interval(15000).subscribe(() => {
        this.checkMarketStatus();
      });
  }

  fetchPeers(){
    this.backendService.fetchPeers(this.ticker).subscribe((peers: any) => {
      this.peers = peers;
      //console.log("Peers fetched");
      this.state.setPeers(this.peers);
    });
  }

  fetchNews(){
    this.backendService.fetchNews(this.ticker).subscribe((allNews: any) => {
      this.allNews = allNews;
      //console.log("News Fetched");
      this.state.setNews(this.allNews);
    });
  }

  createHistChart(histChart: HistChart){
    let i, ohlc = [], volume = [], n = histChart.results.length, results = histChart.results; 
    for(i = 0; i < n; i +=1){
      ohlc.push([
        results[i].t,
        results[i].o,
        results[i].h,
        results[i].l,
        results[i].c
      ]);

      volume.push([
        results[i].t,
        results[i].v
      ]);
    }
    this.histChartOptions = {
      series: [
        {
          type: 'candlestick',
          name: this.ticker.toUpperCase(),
          id: this.ticker,
          zIndex: 2,
          data: ohlc,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: this.ticker,
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: this.ticker,
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
      title: { text: this.ticker.toUpperCase() + ' Historical' },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },
      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
        },
      ],
      tooltip: {
        split: true,
      },
      plotOptions: {

      },
      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 2,
      },
    };
  }

  fetchHistChart(){
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let day = currentDate.getDate();

    let twoYearsAgo = new Date(year - 2, month, day);

    let histFromDate = twoYearsAgo.toISOString().slice(0, 10);
    let histToDate = currentDate.toISOString().slice(0, 10);

    //console.log("Hist from date: ", histFromDate);
    //console.log("Hist to date: ", histToDate);

    this.backendService.fetchHistChart(this.ticker, histFromDate, histToDate).subscribe((histChart) => {
      this.histChart = histChart;
      this.state.setHistChartVariable(this.histChart);
      // this.histChartFinish = false;
      // this.createHistChart(histChart);
      this.histChartFinish = true;
      //this.state.setHistChartOptions(this.histChartOptions);
      //this.changeDetectorRef.detectChanges();
    });
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createHourlyChart(hourlyChart: HourlyChart){
    let hourlyClose = [], n = hourlyChart.results.length, i, results = hourlyChart.results;
    for (i = 0; i < n; i+=1){
      results[i].t = results[i].t;
      hourlyClose.push([results[i].t, results[i].c])
    }
    //console.log("Hourly Close: ", hourlyClose);
    this.hourlyChartOptions = {
      series: [
        {
          data: hourlyClose,
          color: this.hourlyChartColor,
          showInNavigator: false,
          name: this.ticker.toUpperCase(),
          type: 'line',
          tooltip: {
            valueDecimals: 2,
          }
        }
      ],
      xAxis: {
        type: 'datetime',
        endOnTick: true,
        showLastLabel: true,
        labels: {
          formatter: function(this: Highcharts.AxisLabelsFormatterContextObject): string {

            const date = new Date(this.value as number);
            const day = date.getDate();
            const monthIndex = date.getMonth();
            const monthNames = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            if (this.isLast) {
              return `${day} ${monthNames[monthIndex]}`;
            } else {
              return Highcharts.dateFormat('%H:%M', this.value as number);
            }
          }
        }
      },
      yAxis: {
        title: {
          text: ''
        }
      },
      chart: {
        backgroundColor: '#f0f0f0', // Light grey color
      },

      title: {text: this.ticker.toUpperCase() + ' Hourly Price Variation'},
      rangeSelector: {
        enabled: false,
      },
      navigator: {
        enabled: false,
      },
    };
  }

  fetchHourlyChart(){
    const quoteDate = new Date(this.quote.t * 1000);    //Convert to seconds
    if (this.marketOpen){
      console.log("Chart for Market Open")
      this.toDate = new Date();
      this.fromDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate() - 1);
    } else{
      console.log("Chart for Market Closed")
      this.toDate = quoteDate;
      this.fromDate = new Date(quoteDate);
      this.fromDate.setDate(this.fromDate.getDate() - 1);
    }

    this.fromDate = this.formatDate(this.fromDate);
    this.toDate = this.formatDate(this.toDate);

    this.backendService.fetchHourlyChart(this.ticker, this.fromDate, this.toDate).subscribe((hourlyChart : any) => {
      //console.log("Hourly Chart", this.hourlyChart);
      this.hourlyChartFinish = false;
      this.hourlyChart = hourlyChart;
      this.state.setHourlyChartVariable(this.hourlyChart);
      //this.createHourlyChart(hourlyChart);
      this.hourlyChartFinish = true;
      //this.state.setHourlyChartOptions(this.hourlyChartOptions);
      //this.changeDetectorRef.detectChanges();
    });
  }

  fetchRecommendationChart(){
    this.backendService.fetchRecommendations(this.ticker).subscribe((recommendations : Recommendation) => {
      this.recommendationChart = recommendations;
      this.state.setRecommendationChart(this.recommendationChart);
    });
  }

  fetchInsider(){
    this.backendService.fetchInsider(this.ticker).subscribe((insider: InsiderSentiment) => {
      this.insider = insider;
      this.state.setInsider(this.insider);
    });
  }

  fetchEarningsChart(){
    this.backendService.fetchEarnings(this.ticker).subscribe((earnings: Earnings) => {
      this.earningsChart = earnings;
      this.state.setEarningsChart(this.earningsChart);
    });
  }

  openTransactionButton(ticker: string, name: string, currentPrice: any, opt: any) {
    const transModalRef = this.transModalService.open(
      TransactionButtonComponent
    );
    transModalRef.componentInstance.ticker = ticker;
    transModalRef.componentInstance.name = name;
    transModalRef.componentInstance.currentPrice = currentPrice;
    transModalRef.componentInstance.opt = opt;

    transModalRef.result.then((stockItem) => {
      if(stockItem){
        if(stockItem.quantity === 0){
          this.enabled = false;
        }else {
          this.enabled = true;
        }

        if(opt === 'Buy'){
          this._buyAlertSuccess.next('Message successfully changed.');
        } else {
          this._sellAlertSuccess.next('Message successfully changed.');
        }
        
      }
    });
  }

  ngOnDestroy(): void {
    console.log("ngOnDestroy()")
      if(this.intervalSubscription){
        this.intervalSubscription.unsubscribe();
      }

      // Unsubscribe from route params when the component is destroyed
      if (this.paramSubscription) {
        this.paramSubscription.unsubscribe();
      }

      if(this.fetchQuoteforMarketSubscription){
        this.fetchQuoteforMarketSubscription.unsubscribe();
      }
  }
}