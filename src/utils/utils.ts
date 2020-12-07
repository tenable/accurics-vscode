import { ExtensionContext, window, workspace } from 'vscode';
import { ACCURICS_IAC_MODE, INTEGRATED_MODE, WORKSPACE_CONFIG_FILE_KEY } from '../constants';
import { lstatSync, existsSync } from 'fs';
import { sep } from 'path';
import { platform } from 'os';
import { LogUtils } from './accuricsExtLogger';
import {ACCURICS_INIT_COMMAND, ACCURICS_WORKSPACE_COMMAND} from '../constants';

export class Utils {

    private static logger: LogUtils;

    static isIntegratedMode(context: ExtensionContext): boolean {
        let mode: string | undefined = context.globalState.get(ACCURICS_IAC_MODE);
        if (mode !== undefined && mode === INTEGRATED_MODE) {
            return true;
        }
        return false;
    }

    static validateWorkspaceState(context: ExtensionContext): boolean {

        if (context.workspaceState.get(WORKSPACE_CONFIG_FILE_KEY)) {
            return true;
        }
        return false;
    }

    //Show a message to user if user escapes scan options
    static showScanAbortedMessage() {
        window.showInformationMessage('Scan aborted');
    }

    static getWorkspaceLocation(): string | undefined {
        let workspaceLocation: string = '';
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0) {
            return undefined;
        }

        workspaceLocation = workspaceFolders[0].uri.fsPath;
        return workspaceLocation;
    }

    static getReportFilePath(fileType: any, sourceName: string): string {

        let filePath: string = '';
        if (lstatSync(sourceName).isDirectory()) {
            filePath += sourceName + sep + 'accurics_report_terrascan' + '.' + fileType;
        } else {
            let folderPath: string = sourceName.substring(0, sourceName.lastIndexOf(sep));
            filePath += folderPath + sep + 'accurics_report_terrascan' + '.' + fileType;
        }

        return filePath;
    }

    static isWindowsPlatform(): boolean {
        return platform().includes('win32');
    }

    static isDarwinPlatform(): boolean {
        return platform().includes('darwin');
    }

    static isTerrascanBinaryPresent(context: ExtensionContext): boolean {
        let terrascanLocation: string = context.extensionUri.fsPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
        if (this.isWindowsPlatform()) {
            terrascanLocation += '.exe';
        }
        return existsSync(terrascanLocation);
    }

    static isAccuricsCliBinaryPresent(context: ExtensionContext): boolean {
        let accuricsCliLocation: string = context.extensionUri.fsPath + sep + 'executables' + sep + 'accurics' + sep + 'accurics';
        if (this.isWindowsPlatform()) {
            accuricsCliLocation += '.exe';
        }
        return existsSync(accuricsCliLocation);
    }

    static setLoggerObject(logUtils: LogUtils) {
        this.logger = logUtils;
    }

    static logMessage(message: string) {
        this.logger.log(message);
    }

    static nonAccuricsPlanCommands(command: string): boolean {
        return command === ACCURICS_INIT_COMMAND || command === ACCURICS_WORKSPACE_COMMAND;
    }
}