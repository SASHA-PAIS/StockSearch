
import { BackendService } from './../../backend.service';
import { Component, OnInit, Input} from '@angular/core';
import { StateService } from '../../state.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts/highstock';
import { HourlyChart } from '../../hourly-chart';
import { Quote } from '../../quote';


@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})

export class SummaryComponent implements OnInit{
  metadata: any;
  peers: String[] = [];
  chartConstructor = 'stockChart';
  Highcharts: typeof Highcharts = Highcharts; // required
  hourlyChartOptions?: Highcharts.Options;
  change:any;
  hourlyChartColor: any;
  @Input() hourlyChart!: HourlyChart;
  @Input() quote!: Quote;
  @Input() ticker: any;

  constructor(
    private state: StateService, 
    private backendService: BackendService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(){
    this.state.getMetadata().subscribe(metadata => {
      this.metadata = metadata;
    });

    this.state.getPeers().subscribe(peers => {
      this.peers = peers;
    });

  }

  ngOnChanges(){
    if(this.hourlyChart){
      this.createHourlyChart();
    }
  }

  createHourlyChart(){
    this.change = this.quote.d;
    if(this.change > 0){
      this.hourlyChartColor = '#008000';
    }
    else if (this.change < 0){
      this.hourlyChartColor = '#FF0000';
    }
    else {
      this.hourlyChartColor = '#000000';
    }

    let hourlyClose = [], n = this.hourlyChart.results.length, i, results = this.hourlyChart.results;
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

  public linkToDetails(ticker: string){

    if (typeof ticker === 'string') {
      this.router.navigateByUrl('/search/' + ticker);
    }
  }

}
