import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from './services/signal-r.service';
import { HttpClient } from '@angular/common/http';
import { ChartHubSignalrService } from './services/chartHub.proxy.signalr';
import { Subscription } from 'rxjs';
import { ChartModel } from './interfaces/ChartModel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  public data: ChartModel[];
  private subscriptions: Subscription[] = [];

  constructor(public signalRService: ChartHubSignalrService, private http: HttpClient) { }

  public chartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  public chartLabels: string[] = ['Real time data for the chart'];
  public chartType: string = 'bar';
  public chartLegend: boolean = true;
  public colors: any[] = [{ backgroundColor: '#5491DA' }, { backgroundColor: '#E74C3C' }, { backgroundColor: '#82E0AA' }, { backgroundColor: '#E5E7E9' }]

  ngOnInit() {
    // this.signalRService.startConnection();
    // this.signalRService.addTransferChartDataListener(); 
    // this.signalRService.addBroadcastChartDataListener();  
    this.startHttpRequest();

    this.registerSubscriptions();

    this.initProperties();

  }

  private initProperties() {
    this.signalRService.getChartData();
  }

  private registerSubscriptions() {
    this.subscriptions.push(this.signalRService.getChartData()
      .subscribe((chartData: ChartModel[]) => {
        console.log(chartData);
        this.data = chartData;
      }));

      this.subscriptions.push(this.signalRService.notifyChartDataUpdated
      .subscribe((chartData: ChartModel[]) => {
        console.log(chartData);
        this.data = chartData;
      }));
      
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  private startHttpRequest = () => {
    this.http.get('https://localhost:5001/api/chart')
      .subscribe(res => {
        console.log(res);
      })
  }

  public chartClicked = (event) => {
    console.log(event);
    this.signalRService.pause(5);
    // this.signalRService.broadcastChartData();
  }

  title = 'RealTimeCharts-Client';
}
