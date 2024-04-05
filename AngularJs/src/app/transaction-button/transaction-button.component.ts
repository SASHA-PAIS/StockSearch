import { BackendService } from './../backend.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Wallet field will also be there

// stockItem in localStorage: {
//   ticker: string,
//   name: string,
//   quantity: number, // positive
//   totalCost: number  // no need for avgCost = totalCost / quantity
// }

@Component({
  selector: 'app-transaction-button',
  templateUrl: './transaction-button.component.html',
  styleUrl: './transaction-button.component.css'
})
export class TransactionButtonComponent implements OnInit{
  @Input() public ticker: string = '';
  @Input() public name: string = '';
  @Input() public currentPrice: number = 0;
  @Input() public opt: string = ''; // 'Buy' or 'Sell'

  inputQuantity: number = 0;
  purchasedQuantity: number = 0;
  stockItem: any;
  portfolio: any;
  wallet: number = 0;

  constructor(
    public transModalService: NgbActiveModal,
    public backendService: BackendService) {}

  ngOnInit(): void {
    this.getTickerStorage();
  }

  getTickerStorage(){
    // let portfolio = localStorage.getItem('Portfolio')
    //   ? JSON.parse(localStorage.getItem('Portfolio') || '{}') : {};

      this.backendService.fetchPortfolio('sasha21sp').subscribe(portfolio => {
        this.portfolio = portfolio.portfolio;
        this.wallet = this.portfolio.wallet;
        if(this.opt === 'Sell'){
          this.stockItem = this.portfolio.stockItems.filter(
            (data:any) => data.ticker == this.ticker
          )[0];
          this.purchasedQuantity = this.stockItem.quantity;
  
        } else if (this.opt === 'Buy') {
          this.stockItem = this.portfolio.stockItems.filter(
            (data:any) => data.ticker == this.ticker
          ).length ? this.portfolio.stockItems.filter((data:any) => data.ticker == this.ticker)[0]
          : { ticker: this.ticker, name: this.name, quantity: 0, totalCost: 0}; 
        }
      }); 
  }

  public executeOpt(){
    if(this.opt === 'Sell'){
      this.stockItem.quantity -= this.inputQuantity;
      this.stockItem.totalCost -= this.currentPrice * this.inputQuantity;    //This or this.avgCost * this.inputQuanity?
      this.wallet += this.currentPrice * this.inputQuantity;
      console.log(
        `Sold ${this.inputQuantity} ${this.ticker} , ${this.stockItem.quantity} left, totalCost ${this.stockItem.totalCost}, wallet ${this.wallet}`
      );
    } else if (this.opt === 'Buy') {
      this.stockItem.quantity += this.inputQuantity;
      this.stockItem.totalCost += this.currentPrice * this.inputQuantity;
      this.wallet -= this.currentPrice * this.inputQuantity;
      console.log(
        `Bought ${this.inputQuantity} ${this.ticker}, ${this.stockItem.quantity} now, totalCost ${this.stockItem.totalCost}, wallet ${this.wallet}`
      );
    }

    // let portfolio = localStorage.getItem('Portfolio')
    //   ? JSON.parse(localStorage.getItem('Portfolio') || '{}')
    //   : {};

    this.backendService.fetchPortfolio('sasha21sp').subscribe(portfolio => {
      this.portfolio = portfolio.portfolio; 
      this.portfolio.wallet = this.wallet;
      if (!this.stockItem.quantity) {
        // delete stockItem from localStorage

        this.portfolio.stockItems = this.portfolio.stockItems.filter(
          (data: any) => data.ticker != this.ticker
        );
        //localStorage.setItem('Portfolio', JSON.stringify(portfolio));

        this.backendService.updatePortfolio('sasha21sp', this.portfolio);
      } else {
        // replace stockItem from localStorage
          if (this.portfolio.stockItems.filter((item: any) => item.ticker == this.ticker).length) {
            this.portfolio.stockItems.forEach((item: any, i: number) => {
              if (item.ticker == this.stockItem.ticker) {
                this.portfolio.stockItems[i] = this.stockItem;
              }
            });
          } else {
              this.portfolio.stockItems.push(this.stockItem);
          }
          //localStorage.setItem('Portfolio', JSON.stringify(portfolio));
          this.backendService.updatePortfolio('sasha21sp', this.portfolio);
      }

      this.transModalService.close(this.stockItem);
    });
  }
}
