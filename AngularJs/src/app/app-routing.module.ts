import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { StockDetailsComponent } from './search/stock-details/stock-details.component';
import { CustomRouteReuseStrategy } from './custom-route-reuse';
import { RouteReuseStrategy } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'search/home', pathMatch: 'full' }, // Redirect to search/home on empty path
  { path: 'search/home', component: SearchComponent},
  { path: 'search/:symbol', component: StockDetailsComponent},
  { path: 'watchlist', component: WatchlistComponent},
  { path: 'portfolio', component: PortfolioComponent}
];

@NgModule({
  // providers: [{ provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
