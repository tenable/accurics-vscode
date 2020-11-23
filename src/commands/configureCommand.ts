import { workspace, window, ExtensionContext, OpenDialogOptions, Uri } from 'vscode';
import { Utils } from '../utils/utils';
import { WORKSPACE_CONFIG_FILE_KEY, CONFIGURATION_OVERRIDE_OPTIONS, CONFIGURATION_QUICK_PICK_PLACE_HOLDER, CONFIGURATION_OPEN_DIALOG_LABEL } from '../constants';

export async function configureCommand(context: ExtensionContext) {

    /*
    *	Configure command will applicable only when mode is 'integrated'.
    *	In the 'integrated' mode, workspace is scanned using accurics-cli.
    *	Command will abort if no workspace is open
    */

    let workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders === undefined || workspaceFolders.length === 0) {
        window.showErrorMessage('AccuricsIAC: No Workspace open to configure');
        return;
    }

    if (Utils.isIntegratedMode(context)) {
        if (Utils.validateWorkspaceState(context)) {
            let userInput = await window.showQuickPick(CONFIGURATION_OVERRIDE_OPTIONS, { placeHolder: CONFIGURATION_QUICK_PICK_PLACE_HOLDER });
            if (userInput === 'Yes') {
                chooseConfigFileFunction(context);
            } else {
                window.showInformationMessage('AccuricsIAC: Using old configuration');
            }
        } else {
            chooseConfigFileFunction(context);
        }
    } else {
        window.showErrorMessage('AccuricsIAC: Use "Integrated" mode');
    }
}


async function chooseConfigFileFunction(context: ExtensionContext) {
    let openDialogOptions: OpenDialogOptions = {
        openLabel: CONFIGURATION_OPEN_DIALOG_LABEL,
        canSelectFolders: false,
        canSelectMany: false
    };

    let configFile: Uri[] | undefined = await window.showOpenDialog(openDialogOptions);

    if (configFile === undefined) {
        if (Utils.validateWorkspaceState(context)) {
            window.showInformationMessage('AccuricsIAC: Using old configuration');
            return;
        }
        window.showErrorMessage('Config file not selected. AccuricsIAC configuration incomplete.');
        return;
    }

    let configFilePath: string = configFile[0].path;
    context.workspaceState.update(WORKSPACE_CONFIG_FILE_KEY, configFilePath);
    console.log(configFilePath);

    window.showInformationMessage('Configuration for workspace "' + workspace.name + '" done.');
}