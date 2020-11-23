import { ExtensionContext, window, workspace } from 'vscode';
import { ACCURICS_IAC_MODE, INTEGRATED_MODE, WORKSPACE_CONFIG_FILE_KEY } from '../constants';
import {lstatSync} from 'fs';
import {sep} from 'path';

export class Utils {

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
        window.showInformationMessage('AccuricsIAC: Scan aborted');
    }

    static getWorkspaceLocation(): string | undefined {
        let workspaceLocation: string = '';
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0) {
            return undefined;
        }

        workspaceLocation = workspaceFolders[0].uri.toString().replace('file://', '');
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
}