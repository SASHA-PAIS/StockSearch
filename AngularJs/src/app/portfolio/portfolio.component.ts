import { filter } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BackendService } from '../backend.service';
import { Quote } from '../quote';
import { Info } from '../info';
import { TransactionButtonComponent } from '../transaction-button/transaction-button.component';

// Both should have a wallet field as well outside the item in the dictionary.

// stockItem in localStorage: {
//   ticker: string,
//   name: string,
//   quantity: number, // positive
//   totalCost: number  // no need for avgCost = totalCost / quantity
// }

// inforItem for display: {
// ticker: string,
// name: string,
// quantity: number,
// totalCost: number,
// avgCost: number,  // totalCost / quantity
// change: number, // latestprice.last - totalCost / quantity
// currentPrice: number, // latestprice.last
// marketValue: number, // latestprice.last * quantity
// }

let mockInfoArr = {
  tickerInfo: [
    {
      ticker: 'AAPL',
      name: 'Apple company',
      quantity: 100,
      totalCost: 3541.23,
      avgCost: 3541.23 / 100,
      change: 123.2 - 3541.23 / 100,
      currentPrice: 123.2, // latestprice.last
      marketValue: 123.2 * 100,
    },
    {
      ticker: 'AAA',
      name: 'AAA Cor',
      quantity: 200,
      totalCost: 124.41,
      avgCost: 124.41 / 200,
      change: 52.624 - 124.41 / 200,
      currentPrice: 52.624, // latestprice.last
      marketValue: 52.624 * 200,
    },
    {
      ticker: 'ADDDY',
      name: 'Adidas Cor',
      quantity: 30,
      totalCost: 34.1,
      avgCost: 34.1 / 30,
      change: 34.12 - 34.1 / 30,
      currentPrice: 34.12,
      marketValue: 34.12 * 30,
    },
    {
      ticker: 'PUMA',
      name: 'PUMA Sports',
      quantity: 40,
      totalCost: 6504.34,
      avgCost: 6504.34 / 40,
      change: 34.131 - 6504.34 / 40,
      currentPrice: 34.131,
      marketValue: 34.131 * 40,
    },
  ]
}
  

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})


export class PortfolioComponent implements OnInit{
  portfolio:  any;
  isEmpty: boolean = true;
  tickerInfoArray: any;
  fetchFinish: boolean = false;
  quoteArr: Observable<Quote>[] = [];
  infoArr: Info[] = [];
  wallet: number = 0;
  ticker: boolean = false;

  private _buyAlertSuccess = new Subject<string>();
  private _sellAlertSuccess = new Subject<string>();
  buySuccessMessage = '';
  sellSucessMessage = '';
  error: boolean = false;

  constructor(
    private backendService: BackendService,
    private transModalService: NgbModal,
  ) {}

  async ngOnInit(): Promise<void> {
      console.log('Portfolio');

      // TESTING ---- Start
      //this.addLocalStorage();
      await this.checkEmpty();
      //console.log(this.portfolio);
      //this.tickerInfoArray = mockInfoArr;
      //let wallet = 12000;
      this.fetchAllTickers();
      // TESTING ----- End

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

  }

  async fetchAllTickers(){
    this.tickerInfoArray = [];
    this.quoteArr = [];
    this.infoArr = [];
    //console.log('Start fetch ' + Date());
    await this.checkEmpty();
    //console.log('Portfolio inside fetchAllTickers ', this.portfolio);
    this.portfolio.stockItems.forEach((item: any) => {
      this.quoteArr.push(this.backendService.fetchQuote(item.ticker));
    });
    let i = 0;
    forkJoin(this.quoteArr).subscribe((responses) => {
      //console.log("Responses: ", responses);
      responses.forEach((quote: Quote) => {
        //console.log("Portfolio i : ", this.portfolio.stockItems[i]);
        let temp = this.portfolio.stockItems[i];
        let avgCst = temp.totalCost / temp.quantity;

        let info = {
          ticker: temp.ticker,
          name: temp.name,
          quantity: temp.quantity,
          totalCost: temp.totalCost,
          avgCost: avgCst, 
          change: quote.c - avgCst,
          currentPrice: quote.c,
          marketValue: quote.c * temp.quantity
        };
        this.infoArr.push(info);
        i+=1;
      });
      this.tickerInfoArray = this.infoArr;
      this.fetchFinish = true;
      //console.log(this.tickerInfoArray);
    });
  }

  removeFromTickerInfoArr(tickerItem: any) {
    let tickerInfoArrNew = this.tickerInfoArray.filter(
      (data: any) => data.ticker != tickerItem.ticker
    );
    this.tickerInfoArray = tickerInfoArrNew;
  }

  checkEmpty(): Promise<void> {
    return new Promise((resolve, reject) => {
      // const portfolioString = localStorage.getItem('Portfolio') || '{}';
      // this.portfolio = JSON.parse(portfolioString);

      this.backendService.fetchPortfolio('sasha21sp').subscribe(portfolio => {
        this.portfolio = portfolio.portfolio;
        this.wallet = this.portfolio.wallet;
        //console.log("Portfoliooooo: ",this.portfolio);
        this.isEmpty = this.portfolio.stockItems.length === 0;
        if(this.isEmpty){
          this.error = true;
        } else {
          this.error = false;
        }
        // Resolve the promise at the end of the function
        resolve();
      });

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
        //console.log("Stock Item: ", stockItem);
        this.ticker = stockItem.ticker.toUpperCase();
        this.checkEmpty();
        if(stockItem.quantity === 0){
          this.removeFromTickerInfoArr(stockItem);
        } else {
          this.tickerInfoArray.forEach((item: any, i: number) => {
            if (item.ticker === stockItem.ticker){
              //this.tickerInfoArray[i] = stockItem;
              this.fetchAllTickers();
            }
          });
        }
        //console.log("TickerInfoArray: ", this.tickerInfoArray); 
        if(opt === 'Buy'){
          this._buyAlertSuccess.next('Message successfully changed.');
        } else {
          this._sellAlertSuccess.next('Message successfully changed.');
        }
      }
    });
  }

    // Testing
  //   addLocalStorage() {
  //   let purchasedItems = {
  //     wallet: 25000.00,
  //     stockItems: [
  //         {
  //           ticker: 'AAPL',
  //           name: 'Apple company',
  //           quantity: 100,
  //           totalCost: 3541.23,
  //         },
  //         { ticker: 'TSLA', name: 'Tesla Inc', quantity: 200, totalCost: 124.41 },
  //         { ticker: 'NVDA', name: 'Nvdia', quantity: 30, totalCost: 34.1 },
  //         { ticker: 'VEEV', name: 'Veeva Systems', quantity: 40, totalCost: 6504.34 },
  //     ]
  //   }
    
  //   localStorage.setItem('Portfolio', JSON.stringify(purchasedItems));
  // }

}
