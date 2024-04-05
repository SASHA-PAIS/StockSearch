import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchComponent } from './search/search.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { FooterComponent } from './footer/footer.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';

import { BackendService } from './backend.service';
import { SummaryComponent } from './search/summary/summary.component';
import { NewsComponent } from './search/news/news.component';
import { ChartsComponent } from './search/charts/charts.component';
import { InsightsComponent } from './search/insights/insights.component';
import { StockDetailsComponent } from './search/stock-details/stock-details.component';
import { StateService } from './state.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { NewsDetailComponent } from './search/news-detail/news-detail.component';
import { TransactionButtonComponent } from './transaction-button/transaction-button.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SearchComponent,
    PortfolioComponent,
    WatchlistComponent,
    FooterComponent,
    SummaryComponent,
    NewsComponent,
    ChartsComponent,
    InsightsComponent,
    StockDetailsComponent,
    NewsDetailComponent,
    TransactionButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatInputModule,
    HttpClientModule,
    HighchartsChartModule
  ],
  providers: [
    provideAnimationsAsync(),
    BackendService,
    StateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }