import { StateService } from './../state.service';
import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router , ActivatedRoute} from '@angular/router';
import { BackendService } from '../backend.service';
import { debounceTime, switchMap, tap, finalize} from 'rxjs';
import { SearchResult, Company } from '../search-result';
import { ChangeDetectorRef } from '@angular/core';
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit{
  companiesFiltered: SearchResult = {count: 0, result: []};
  isLoading = false;
  ticker: string = '';
  inputTicker: FormControl = new FormControl('');
  presentTicker: string = '';
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private backendService: BackendService,
    private state: StateService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ){
     //console.log("Constructor");
     this.route.params.subscribe(params => {
      if(params){
        //console.log("Params: ", params);
        this.ticker = params['symbol']?.toUpperCase() || '';
        if(this.ticker !== 'home'){
          this.inputTicker.setValue(this.ticker);
          this.state.setTicker(this.ticker);
          this.state.setTickerVariable(this.ticker);
          this.presentTicker =this.ticker;
        }
        else{
          this.inputTicker = new FormControl('');
          this.state.setTicker('');
          this.state.setTickerVariable('');
        }
      }
     });
  }

  ngOnChanges(){


  }

  // @Input() set searchTerm(value: string){
  //   if (value && this.searchForm){
  //     console.log("Inside Input", value);
  //     this.searchForm.get("inputTicker")?.setValue(value, {emitEvent: false});
  //     console.log(this.searchForm.get("inputTicker")?.value);
  //   }
  // }
  ngOnInit(){
    //console.log("Inside ngOnInit");

    this.inputTicker.valueChanges.pipe(
        debounceTime(300), tap(() => (this.isLoading = true)), switchMap((value) => 
          this.backendService.fetchAutoComplete(value).pipe(finalize(() => (this.isLoading = false)))

        )
      )
      .subscribe((companies) => (this.companiesFiltered = companies))
  }



  onSubmit(){
    this.ticker = this.inputTicker.value.toUpperCase();
    //console.log("Inside onSubmit", this.ticker);
    this.autocompleteTrigger.closePanel();
    this.router.navigateByUrl('/search/' + this.ticker);
  }

  clearForm(){
    //console.log("Clear Form")
    this.router.navigateByUrl('/search/home');
    this.state.metadataDict.clear();
  }

  displayTicker(company : Company): string{
    return company && company.displaySymbol ? company.displaySymbol : '';
  }
}