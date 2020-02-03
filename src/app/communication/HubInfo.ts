import { Observable } from 'rxjs';

export class HubInfo {
    public constructor(
        public readonly hubName: string,
        public readonly listeners: string[],
        public readonly triggers: string[]
    ) {
        // traceInfo(this, `constructor: ${this.hubName}`);
    }

    public hubProxy: signalR.HubConnection;
    public readonly listenerObservables: Map<string, Observable<any>> = new Map<string, Observable<any>>();

    public readonly triggerObservables: Map<string, (...args: any[]) => Observable<any>>
        = new Map<string, (...args: any[]) => Observable<any>>();
}
