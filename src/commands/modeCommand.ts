import {window, ExtensionContext} from 'vscode';
import {MODE_QUICK_PICK_OPTIONS, MODE_QUICK_PICK_PLACE_HOLDER, ACCURICS_IAC_MODE, STANDALONE_MODE} from '../constants';

export async function modeCommand(context: ExtensionContext) {

    let userInput = await window.showQuickPick(MODE_QUICK_PICK_OPTIONS, { placeHolder: MODE_QUICK_PICK_PLACE_HOLDER });
    if (userInput !== undefined) {
        context.globalState.update(ACCURICS_IAC_MODE, userInput);
        let message: string = `Accurics will run in ${userInput} mode`;
        window.showInformationMessage(message);
    } else {
        if (context.globalState.get(ACCURICS_IAC_MODE, userInput) === undefined) {
            context.globalState.update(ACCURICS_IAC_MODE, STANDALONE_MODE);
            let message: string = 'Accurics will run in Standalone mode';
            window.showInformationMessage(message);
        }
    }
}