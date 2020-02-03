import { IHubConfigInfo } from '../communication/signalr-hub-config-info';

export const ChartHubInfo: IHubConfigInfo = {
    hubName: 'chartHub',
    listeners: [
        'notifyChartDataUpdated'
    ],
    triggers: [
        'getChartData',
        'pause'
    ]
};
