import { exec, ExecException, ExecOptions } from 'child_process';
import { lstatSync } from 'fs';
import { ExtensionContext, OutputChannel, Uri, window, workspace } from 'vscode';
import { Utils } from '../utils/utils';
import { ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER, TERRASCAN_IAC_TYPES, ACCURICS_CLI_SCAN_OPTIONS, IAC_TYPE_QUICK_PICK_PLACEHOLDER, WORKSPACE_CONFIG_FILE_KEY } from '../constants';
import {TerrascanScanReport} from '../report/terrascanReportData';
import { ReportGenerator } from '../report/generateReport';
import {sep} from 'path';

export async function scanCommand(context: ExtensionContext, uri: Uri) {

	let workspaceLocation: string = '';
	let workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders === undefined || workspaceFolders.length === 0) {
		window.showErrorMessage('AccuricsIAC: No Workspace Open to scan');
		return;
	}

	workspaceLocation = workspaceFolders[0].uri.toString();

	//when command is run from command palette, run scan against the workspace root.
	let isRunFromCommandPalette: boolean = false;

	//uri is 'undefined' when command is run from command palette.
	if (uri === undefined) {
		isRunFromCommandPalette = true;
	}

	if (!Utils.isIntegratedMode(context)) {

		let userInput = await window.showQuickPick(TERRASCAN_IAC_TYPES, { placeHolder: IAC_TYPE_QUICK_PICK_PLACEHOLDER });
		if (userInput !== undefined) {
			window.showInformationMessage('AccuricsIAC: Started Scanning');
			standaloneScan(context, workspaceLocation, userInput, isRunFromCommandPalette, uri);
		} else {
			Utils.showScanAbortedMessage();
		}
	} else {

		if (!Utils.validateWorkspaceState(context)) {
			window.showErrorMessage('AccuricsIAC: Integrated mode configuration not done. Please run AccuricsIAC configure command');
			return;
		}
		//scan mode is integrated mode, use accurics-cli
		let userInput = await window.showQuickPick(ACCURICS_CLI_SCAN_OPTIONS, { placeHolder: ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER });
		if (userInput !== undefined) {
			integratedScan(context, workspaceLocation, userInput, uri, isRunFromCommandPalette);
		} else {
			Utils.showScanAbortedMessage();
		}
	}
}

function integratedScan(context: ExtensionContext, workspaceLocation: string, userInput: string, source: Uri, isRunFromCommandPalette: boolean) {
	let accuricsOutputChannel: OutputChannel = window.createOutputChannel('accurics');
	accuricsOutputChannel.appendLine(`Running AccuricsIAC ${userInput}...`);
	accuricsOutputChannel.show();

	workspaceLocation = workspaceLocation.replace('file://', '');

	let workDirectory: string;
	if (isRunFromCommandPalette) {
		workDirectory = workspaceLocation;
	} else {
		if (lstatSync(source.path).isDirectory()) {
			workDirectory = source.path;
		} else {
			workDirectory = source.path.substring(0, source.path.lastIndexOf(sep));
		}
	}

	let execOptions: ExecOptions = {
		cwd: workDirectory
	};

	let accuricsCliLocation: string = context.extensionPath + sep + 'executables' + sep + 'accurics' + sep + 'accurics';

	console.log(`${accuricsCliLocation} ${userInput} -config=` + context.workspaceState.get(WORKSPACE_CONFIG_FILE_KEY));
	exec(`${accuricsCliLocation} ${userInput} -config=` + context.workspaceState.get(WORKSPACE_CONFIG_FILE_KEY),
		execOptions,
		(err: ExecException | null, stdout: any, stderr: any) => {
			// accuricsOutputChannel.appendLine('stdout: ' + stdout);
			if (err) {
				window.showErrorMessage(`AccuricsIAC: ${userInput} error. Please check output.`);
				accuricsOutputChannel.appendLine(stderr);
				accuricsOutputChannel.appendLine(stdout);
			} else {
				window.showInformationMessage(`AccuricsIAC: ${userInput} complete. Please check output.`);
				accuricsOutputChannel.appendLine(`${userInput} Complete.`);

				accuricsOutputChannel.appendLine(stderr);
				accuricsOutputChannel.appendLine(stdout);

				// print report to output.
				if (userInput === 'plan') {

					exec('cat accurics_report.json', execOptions,
						(err: any, stdout: any, stderr: any) => {
							accuricsOutputChannel.appendLine(stdout);
							if (err) {
								accuricsOutputChannel.appendLine(stderr);
							}
						});
				} else {
					accuricsOutputChannel.appendLine(stderr);
					accuricsOutputChannel.appendLine(stdout);
				}
			}
		});
}

function standaloneScan(context: ExtensionContext, workspaceLocation: string, userInput: string, isRunFromCommandPalette: boolean, source: Uri) {
	let accuricsOutputChannel: OutputChannel = window.createOutputChannel('accurics');
	accuricsOutputChannel.appendLine(`Running AccuricsIAC scan for iac-type ${userInput}`);
	accuricsOutputChannel.show();

	workspaceLocation = workspaceLocation.replace('file://', '');
	// console.log('workspaceLocation: ', workspaceLocation);

	// console.log('process env', process.env);

	let scanOptions: string;
	if (isRunFromCommandPalette) {
		scanOptions = `-d ${workspaceLocation} -o json`;
	} else {
		if (lstatSync(source.path).isDirectory()) {
			scanOptions = `-d ${source.path} -o json`;
		} else {
			scanOptions = `-f ${source.path} -o json`;
		}
	}

	let execOptions: ExecOptions = {
		cwd: workspaceLocation
	};

	let terrascanLocation: string = context.extensionPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';

	console.log(`${terrascanLocation} scan -i ${userInput} ${scanOptions}`);
	exec(`${terrascanLocation} scan -i ${userInput} ${scanOptions}`,
		execOptions,
		(err: ExecException | null, stdout: any, stderr: any) => {
			if (err) {
				// terrascan exits with exit code 3 when there are violations.
				if (err !== null && err.code === 3) {
					// console.log('error code is: ', err.code);
					window.showInformationMessage(`AccuricsIAC: Scan complete. Please check output.`);
					// accuricsOutputChannel.appendLine('error, stderr: ' + stderr);
					accuricsOutputChannel.appendLine(stdout);

					let output: TerrascanScanReport = <TerrascanScanReport>JSON.parse(stdout);
					if (isRunFromCommandPalette) {
						generateReports(stdout, workspaceLocation, userInput, output);
					} else {
						generateReports(stdout, source.path, userInput, output);
					}
				} else {
					window.showErrorMessage(`AccuricsIAC: Scan error. Please check output.`);
					accuricsOutputChannel.appendLine(stderr);
					accuricsOutputChannel.appendLine(stdout);
				}
			} else {
				if (stderr) {
					window.showErrorMessage(`AccuricsIAC: Scan error. Please check output.`);
					accuricsOutputChannel.appendLine(stderr);
				} else {
					window.showInformationMessage(`AccuricsIAC: Scan complete. Please check output.`);
					accuricsOutputChannel.appendLine(stdout);

					let output: TerrascanScanReport = <TerrascanScanReport>JSON.parse(stdout);
					if (isRunFromCommandPalette) {
						generateReports(stdout, workspaceLocation, userInput, output);
					} else {
						generateReports(stdout, source.path, userInput, output);
					}
				}
			}
		});
}

function generateReports(stdout: any, sourcePath: string, iacType: string, output: TerrascanScanReport) {
	let reportGenerator = new ReportGenerator();
	reportGenerator.generateJsonFile(stdout, sourcePath);
	reportGenerator.generateHtmlFile(sourcePath, iacType, output);
}