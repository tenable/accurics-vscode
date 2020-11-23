import * as vscode from 'vscode';
import { configureCommand as accuricsIACConfigure } from './commands/configureCommand';
import { modeCommand as accuricsIACMode } from './commands/modeCommand';
import { scanCommand as accuricsIACScan } from './commands/scanCommand';

//This method is called when the extension is activated.
export function activate(context: vscode.ExtensionContext) {

	console.log('AccuricsIAC is activated!');

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