import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HubInfo } from './HubInfo';
import { IHubConfigInfo } from './signalr-hub-config-info';
import { ChartHubInfo } from '../HubConfigs/chartHub-info.model';
import * as signalR from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';

export interface ISignalRConnectionManager {
    // connectionStateSubject: BehaviorSubject<ConnectionState>;
    // startConnection(hubName: string, bindTarget: any): void;
    // setReconnect(isReconnect: boolean): void;
    setupConnection(hubName: string, bindTarget: any): void
}

export class HubProxy {

}

///centralized multi-hub & 1 connection management
export class SignalRConnectionManager implements ISignalRConnectionManager {
    private _isConnected: boolean;
    private _hubConnection: signalR.HubConnection;
    private hubProxy: HubProxy;
    private readonly _callbackQueue: Array<() => void> = [];

    public constructor() {

    }

    private getHubInfo(hubName: string): HubInfo {
        //todo: this has to be injected instead of direct import!!
        const hubConfig: IHubConfigInfo = ChartHubInfo;
        const hubinfo = new HubInfo(hubConfig.hubName, hubConfig.listeners, hubConfig.triggers);

        //todo: extract to seperate method.
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:5001/chart')
            .withAutomaticReconnect()
            .build();


        hubinfo.hubProxy = this._hubConnection;

        this._hubConnection.onreconnecting((error) => {
            console.assert(this._hubConnection.state === signalR.HubConnectionState.Reconnecting);
            console.error(`Connection lost due to error "${error}". Reconnecting.`);
        });

        return hubinfo;
    }

    //note: setup and start connection shall be called inside hubproxy constructor ?
    public setupConnection(hubName: string, bindTarget: any): void {
        const hubinfo = this.getHubInfo(hubName);

        this.registerListeners(hubinfo);
        this.buildTriggers(hubinfo);

        this.bindToTarget(hubinfo, bindTarget);

        this.startConnection();
    }


    private bindToTarget(hubInfo: HubInfo, bindTarget: any): void {
        hubInfo.listenerObservables.forEach((value: Observable<any>, key: string) => {
            bindTarget[key] = value;
        });
        hubInfo.triggerObservables.forEach((value: () => Observable<any>, key: string) => {
            bindTarget[key] = value;
        });
    }

    private registerListeners(hubInfo: HubInfo) {
        hubInfo.listeners.forEach((listener) => {
            const result = new Subject<any>();
            hubInfo.hubProxy.on(listener, (resultData) => {
                // if (this._connectionStateSubject.getValue() === ConnectionState.Connected) {
                // traceInfo(this, `listener ${hubInfo.hubName}.${listener} is called.`);
                result.next(resultData);
                // }
            });
            hubInfo.listenerObservables.set(listener, result.asObservable());
        });
    }

    private buildTriggers(hubinfo: HubInfo) {
        hubinfo.triggers.forEach((method) => {
            const observableFunc = (...args: any[]) => {
                const result = new Subject<any>();
                const invokeCall = () => {
                    hubinfo.hubProxy
                        .invoke(method, ...args)
                        .then((ret: any) => {
                            // traceInfo(this, `trigger ${hubinfo.hubName}.${method} is done.`);
                            result.next(ret);
                        }, (error: any) => {
                            // this.log.error(error);
                            result.error(error);
                        })
                        .finally(() => result.complete());
                };
                if (this._hubConnection.state !== HubConnectionState.Connected) {
                    this._callbackQueue.push(invokeCall);
                } else {
                    invokeCall();
                }

                return result.asObservable();
            };
            hubinfo.triggerObservables.set(method, observableFunc);
        });
    }


    //2. start connection(if no started)
    private startConnection(): void {
        this._hubConnection
            .start()
            .then(() => {
                console.log('Connection started');
                if (this._hubConnection.state == HubConnectionState.Connected) {
                    while (this._callbackQueue.length > 0) {
                        const callback = this._callbackQueue.pop();
                        if (callback instanceof Function) {
                            callback();
                        }
                    }
                }
            })
            .catch(this.onConnectionError);
    }

    private onConnectionError(error: any) {
        console.log('Error while starting connection: ' + error)
    }


}