import { OutputChannel, ExtensionContext, window } from 'vscode';

export class LogUtils {
    private accuricsLogsChannel: OutputChannel;
    constructor(private context: ExtensionContext) {
        this.accuricsLogsChannel = window.createOutputChannel('AccuricsExtLogs');
        this.context.subscriptions.push(this.accuricsLogsChannel);
    }

    log(logMessage: string) {
        this.accuricsLogsChannel.appendLine(new Date().toUTCString() + ': ' + logMessage);
    }
}