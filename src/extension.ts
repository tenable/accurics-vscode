import * as vscode from 'vscode';
import { configureCommand as accuricsIACConfigure } from './commands/configureCommand';
import { modeCommand as accuricsIACMode } from './commands/modeCommand';
import { scanCommand as accuricsIACScan } from './commands/scanCommand';
import { ACCURICS_TOOLS_DOWNLOAD_FAILURE, ACCURICS_TOOLS_DOWNLOAD_SUCCESS, PROGRESS_MESSAGE } from './constants';
import { AccuricsCliDownloader } from './utils/accuricsCliDownloader';
import { LogUtils } from './utils/accuricsExtLogger';
import { TerrascanDownloader } from './utils/terrascanDownloader';
import { Utils } from './utils/utils';

//This method is called when the extension is activated.
export async function activate(context: vscode.ExtensionContext) {

    Utils.setLoggerObject(new LogUtils(context));
    Utils.logMessage('accurics-iac activated!');

    if (!Utils.isTerrascanBinaryPresent(context) && !Utils.isAccuricsCliBinaryPresent(context)) {
        downloadTools(context);
    }

    //This command would be used for configuration of the integrated mode
    let configureCommand: vscode.Disposable = vscode.commands.registerCommand('accurics-iac.configure', async () => accuricsIACConfigure(context));
    context.subscriptions.push(configureCommand);

    //This command will be used to store the global configuration for the extension
    let modeCommand: vscode.Disposable = vscode.commands.registerCommand('accurics-iac.mode', async () => accuricsIACMode(context));
    context.subscriptions.push(modeCommand);

    //This command starts the scanning process based on the mode
    let configureCommandScan: vscode.Disposable = vscode.commands.registerCommand('accurics-iac.scan', async (uri: vscode.Uri) => accuricsIACScan(context, uri));
    context.subscriptions.push(configureCommandScan);
}

//This method is called when the extension is de-activated.
export function deactivate() { }

/**
 * If both binaries are not present, then download them.
 * If for some reason, one of the binary is not present,
 * it would be downloaded when user starts a scan.
 */

function downloadTools(context: vscode.ExtensionContext) {

    let progressOptions: vscode.ProgressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: PROGRESS_MESSAGE,
        cancellable: false
    };

    return vscode.window.withProgress(progressOptions, async (progress) => {

        progress.report({ increment: 10 });
        let terrascanDownload = new TerrascanDownloader(context).downloadBinary(progress, true);
        let accuricsCliDownload = new AccuricsCliDownloader(context).downloadBinary(progress, true);

        return Promise.all([terrascanDownload, accuricsCliDownload])
            .then(([isTerrascanDownloaded, isAccuricsCliDownloaded]) => {
                vscode.window.showInformationMessage(ACCURICS_TOOLS_DOWNLOAD_SUCCESS);
            })
            .catch((error) => {
                vscode.window.showErrorMessage(ACCURICS_TOOLS_DOWNLOAD_FAILURE + error);
            });
    });
}