import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  ticker: any;
  activeLink: string = '';

  constructor(private router: Router,
              private state: StateService) {}

  ngOnInit(): void {
      this.state.getTicker().subscribe(ticker => {
        this.ticker = ticker;

        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
          this.activeLink = event.urlAfterRedirects;
        });
      });
  }

  navigateWithRefresh(route: string): void {
    this.router.navigate([route], { queryParams: { refresh: new Date().getTime() } });
  }

}
