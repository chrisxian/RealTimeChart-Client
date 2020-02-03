import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChartModel } from '../interfaces/ChartModel';
import { SignalRConnectionManager } from '../communication/signalrConnectionManager';

export interface IChartClient {
    notifyChartDataUpdated: Observable<ChartModel[]>;
}

export interface IChartRequest {
    getChartData: () => Observable<ChartModel[]>;
    pause: (second: number) => Observable<void>;
}

@Injectable({
    providedIn: 'root'
})
export class ChartHubSignalrService implements IChartClient, IChartRequest {
    private readonly _hubName: string = 'chartHub';
    private connectionManager: SignalRConnectionManager

    constructor() {
        this.connectionManager = new SignalRConnectionManager();
        this.connectionManager.setupConnection(this._hubName, this);
    }

    pause: (second: number) => Observable<void>;

    public get hubName(): string {
        return this._hubName;
    }

    getChartData: () => Observable<ChartModel[]>;

    notifyChartDataUpdated: Observable<ChartModel[]>;

}