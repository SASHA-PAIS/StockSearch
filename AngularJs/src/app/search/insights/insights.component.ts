import { Recommendation } from './../../recommendation';
import { Earnings } from './../../earnings';
import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { InsiderSentiment } from '../../insider';
import { InsiderSentimentData } from '../../insider';
import { left } from '@popperjs/core';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css'
})
export class InsightsComponent implements OnInit{
  chartConstructor = 'stockChart';
  Highcharts: typeof Highcharts = Highcharts; // required
  recommendationChartOptions!: Highcharts.Options | any;
  earningsChartOptions!: Highcharts.Options | any;

  ticker: string = '';
  totalMSPR: number = 0;
  positiveMSPR: number = 0;
  negativeMSPR: number = 0;
  totalChange: number = 0;
  positiveChange: number = 0;
  negativeChange: number = 0;
  @Input() recommendationChart!: Recommendation[];
  @Input() insider!: InsiderSentiment;
  @Input() earningsChart!: Earnings[];
  @Input() name: string = '';

  ngOnInit(): void {
  }

  ngOnChanges(){
    if (this.recommendationChart){
      this.createRecommendationChart();
    }

    if(this.insider){
      this.createTable();
    }

    if(this.earningsChart){
      this.createEarningsChart();
    }
  }

  createRecommendationChart(){
    const categories = this.recommendationChart.map(item => item.period);
    const strongBuyData = this.recommendationChart.map(item => item.strongBuy);
    const buyData = this.recommendationChart.map(item => item.buy);
    const holdData = this.recommendationChart.map(item => item.hold);
    const sellData = this.recommendationChart.map(item => item.sell);
    const strongSellData = this.recommendationChart.map(item => item.strongSell);

    this.recommendationChartOptions = {
      chart: {
        type: 'column',
        backgroundColor: '#f8f8f8'
      },
      title: {
        text:'Recommendation Trends',
        align: 'center'
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        min: 0,
        title: {
          text: '# Analysis'
        },
        stackLabels:{
          enabled: true
        }
      },

      legend:{
        align: 'center',
        verticalAlign: 'bottom',
        shadow: false
      },

      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },

      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },

      series: [
        {
          name: "strong buy",
          data: strongBuyData, 
          color: '#1e5f33' 
        }, 
        {
          name: 'Buy',
          data: buyData,
          color: '#31af51'
        }, 
        {
          name: 'Hold',
          data: holdData,
          color: '#ae7a22'
        },
        {
          name: 'Sell',
          data: sellData,
          color: '#ed484a'
        }, 
        {
          name: 'Strong Sell',
          data: strongSellData,
          color: '#722526'
        }
      ]

    }
  }

  createTable(){
    this.insider.data.forEach(item => {
      this.totalMSPR += item.mspr;
      this.totalChange += item.change;

      if (item.mspr > 0) {
        this.positiveMSPR += item.mspr;
      } else if (item.mspr < 0) {
        this.negativeMSPR += item.mspr;
      }
    
      if (item.change > 0) {
        this.positiveChange += item.change;
      } else if (item.change < 0) {
        this.negativeChange += item.change;
      }

    });
  }

  createEarningsChart(){

    let x_labels = this.earningsChart.map((x: any) => [x.period, `Surprise: ${x.surprise}`])

    this.earningsChartOptions = {
      chart: {
        type: 'spline',
        backgroundColor: '#f8f8f8',
        style: {
          fontSize: 'small'
        }
      },

      title: {
        text: 'Historical EPS Surprises',
        align: 'center'
      },

      xAxis: [{
        categories: x_labels,
        reversed: false,
        title: {
          enabled: true,
          text: ''
        },

        labels: {
          formatter: function(this:any) {
            return `<span>${this.value[0]}</span><br><span>${this.value[1]}</span>`
          },
          ticklength: 10,
        }, 
   
      },{}],

      yAxis:{
        title:{
          text: 'Quaterly EPS'
        },

        labels: {
          format: '{value}'
        },
      },

      legend: {

      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: 'Q{point.x}: {point.y}'
      },

      plotOptions: {
        spline: {
          marker: {
            enable: false
          }
        }
      },  

      series: [
        {
          name: 'Actual',
          data: this.earningsChart.map((x: any) => x.actual),
          color: '#30b8fd'
        }, {
          name: 'Estimate',
          data: this.earningsChart.map((x: any) => x.estimate),
          color: '#625ac8'
        }
      ]
    }
    }
  }
