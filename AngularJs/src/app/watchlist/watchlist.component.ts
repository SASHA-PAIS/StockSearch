import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { Quote } from '../quote';
import { StateService } from '../state.service';

let mockInfoArr = [
  {
    ticker: 'AAPL',
    name: 'Apple company',
    currentPrice: 122.5,
    change: 23.4,
    changePercent: 2.34,
    timestamp: '125456',
  },
  {
    ticker: 'AAA',
    name: 'AAA Cor',
    currentPrice: 121.34,
    change: -2.4,
    changePercent: -0.34,
    timestamp: '125456',
  },
  {
    ticker: 'ADDDY',
    name: 'Adidas Cor',
    currentPrice: 227.12,
    change: -44.4,
    changePercent: -1.54,
    timestamp: '125456',
  },
  {
    ticker: 'PUMA',
    name: 'PUMA Sports',
    currentPrice: 11.34,
    change: 2.4,
    changePercent: 1.34,
    timestamp: '125456',
  },
];

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent implements OnInit{
  watchlist: any;
  isEmpty: boolean = true;
  tickerInfoArray: any;
  fetchFinish : boolean = false;
  quoteArr: Observable<Quote>[] = [];
  infoArr:any;
  error: boolean = false;
  
  constructor(
    private backendService: BackendService,
    private router: Router,
    private state: StateService
  ){}

  async ngOnInit(): Promise<void> {
    console.log('Portfolio');

    // TESTING ---- Start

    //this.addLocalStorage();
    await this.checkEmpty();
    //console.log(this.watchlist);
    //this.tickerInfoArray = mockInfoArr;
    this.fetchAllTickers();
    this.fetchFinish = true;

    // TESTING ----- End
  }

  async fetchAllTickers(){
    this.tickerInfoArray = [];
    this.quoteArr = [];
    this.infoArr = [];
    //console.log('Start fetch ' + Date());
    await this.checkEmpty();
    this.watchlist.forEach((item: any) => {
      this.quoteArr.push(this.backendService.fetchQuote(item.ticker));
    });
    let i = 0;
    forkJoin(this.quoteArr).subscribe((responses) => {
      responses.forEach((quote: Quote) => {
        let temp = this.watchlist[i];

        let info = {
          ticker: temp.ticker,
          name: temp.name,
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp
        };
        this.infoArr.push(info);
        i+=1;
      });
      this.tickerInfoArray = this.infoArr;
      this.fetchFinish = true;
      //console.log(this.tickerInfoArray);
    });
  }

  checkEmpty(): Promise<void> {
    return new Promise((resolve, reject) => {
      // this.watchlist = localStorage.getItem('Watchlist')
      // ? JSON.parse(localStorage.getItem('Watchlist') || '[]')
      // : [];

      this.backendService.fetchWatchlist('sasha21sp').subscribe(watchlist => {
        this.watchlist = watchlist.watchlist;

        //console.log("Watchlist: ",this.watchlist);
        this.isEmpty = this.watchlist.length === 0;
        if(this.isEmpty){
          this.error = true;
        }
        else{
          this.error = false;
        }
        // Resolve the promise at the end of the function
        resolve();
      });

    });
  }

  removeFromWatchlist(item:any) {
    console.log("Remove function")
    this.tickerInfoArray.splice(this.tickerInfoArray.indexOf(item), 1);
    //let watchlistArrOld = JSON.parse(localStorage.getItem('Watchlist') || '[]');
    console.log("Ticker Info Array", this.tickerInfoArray);
    this.backendService.fetchWatchlist('sasha21sp').subscribe(watchlist => {
      this.watchlist = watchlist.watchlist;
      let watchlistArrNew = this.watchlist.filter(
        (data: any) => data.ticker != item.ticker.toUpperCase()
      );

      // localStorage.setItem('Watchlist', JSON.stringify(watchlistArrNew));
      console.log("Watchlist new array: ", watchlistArrNew);
      this.backendService.updateWatchlist('sasha21sp', watchlistArrNew)
      this.checkEmpty();
    });
    
  }

  public linkToDetails(event: Event, ticker: string){
    event.stopPropagation();
    this.router.navigateByUrl('/search/' + ticker);
  }

  addLocalStorage() {
    let watchedItems = [
      { ticker: 'AAPL', name: 'Apple company' },
      { ticker: 'AAA', name: 'AAA Cor' },
      { ticker: 'ADDDY', name: 'Adidas Cor' },
      { ticker: 'PUMA', name: 'PUMA Sports' },
    ];
    localStorage.setItem('Watchlist', JSON.stringify(watchedItems));
  }
}
