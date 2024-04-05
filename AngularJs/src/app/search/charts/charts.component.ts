import { HistChart } from './../../hist-price';
import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { StateService } from '../../state.service';
import { BackendService } from '../../backend.service';

import IndicatorsCore from 'highcharts/indicators/indicators';
import VBPIndicator from 'highcharts/indicators/volume-by-price';

IndicatorsCore(Highcharts);
VBPIndicator(Highcharts);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent implements OnInit{

  chartConstructor = 'stockChart';
  Highcharts: typeof Highcharts = Highcharts; // required
  histChartOptions?: Highcharts.Options;
  updateFlag: boolean = false;
  ticker: string = '';
  @Input() histChart?: HistChart;

  constructor(
    private state: StateService,
  ){}

  ngOnInit(){
    // this.state.getHistChartOptions().subscribe(histChartOptions => {
    //   this.histChartOptions = histChartOptions;
    //   this.changeDetectorRef.detectChanges(); // Manually trigger change detection
    // });

  }

  ngOnChanges(){
    if (this.histChart){
      this.ticker = this.histChart.ticker;
      this.createHistChart(this.histChart);
    }
  }

  createHistChart(histChart: HistChart){
    console.log("HistChart: ", histChart);
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
      chart:{
        backgroundColor: '#f8f8f8'
      },
      series: [
        {
          type: 'candlestick',
          name: this.ticker.toUpperCase(),
          id: '',
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
          linkedTo: '',
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
          linkedTo: '',
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
}
