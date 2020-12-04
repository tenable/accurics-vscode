import { exec, ExecException, ExecOptions } from 'child_process';
import { lstatSync } from 'fs';
import { ExtensionContext, OutputChannel, Uri, window, workspace } from 'vscode';
import { Utils } from '../utils/utils';
import { ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER, TERRASCAN_IAC_TYPES, ACCURICS_CLI_SCAN_OPTIONS, IAC_TYPE_QUICK_PICK_PLACEHOLDER, WORKSPACE_CONFIG_FILE_KEY, ACCURICS_TOOLS_NOT_INSTALLED, ACCURICS_TOOLS_DOWNLOAD_SUCCESS, ACCURICS_TOOLS_DOWNLOAD_FAILURE, INSTALL_OPTION } from '../constants';
import { TerrascanScanReport } from '../report/terrascanReportData';
import { ReportGenerator } from '../report/generateReport';
import { sep } from 'path';
import stripAnsi = require('strip-ansi');
import { TerrascanDownloader } from '../utils/terrascanDownloader';
import { AccuricsCliDownloader } from '../utils/accuricsCliDownloader';

export async function scanCommand(context: ExtensionContext, uri: Uri) {

	let workspaceLocation: string = '';
	let workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders === undefined || workspaceFolders.length === 0) {
		window.showErrorMessage('No Workspace Open to scan');
		return;
	}

	workspaceLocation = workspaceFolders[0].uri.fsPath;

	//when command is run from command palette, run scan against the workspace root.
	let isRunFromCommandPalette: boolean = false;

	//uri is 'undefined' when command is run from command palette.
	if (uri === undefined) {
		isRunFromCommandPalette = true;
	}

	if (!Utils.isIntegratedMode(context)) {

		let userInput = await window.showQuickPick(TERRASCAN_IAC_TYPES, { placeHolder: IAC_TYPE_QUICK_PICK_PLACEHOLDER });
		if (userInput !== undefined) {
			window.showInformationMessage('Scanning in progress');
			standaloneScan(context, workspaceLocation, userInput, isRunFromCommandPalette, uri);
		} else {
			Utils.showScanAbortedMessage();
		}
	} else {

		if (!Utils.validateWorkspaceState(context)) {
			window.showErrorMessage('Looks like this mode has not been enabled yet, please run "Accurics Configure" command to enable this mode');
			return;
		}
		//scan mode is integrated mode, use accurics-cli
		let userInput = await window.showQuickPick(ACCURICS_CLI_SCAN_OPTIONS, { placeHolder: ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER });
		if (userInput !== undefined) {
			window.showInformationMessage('Scanning in progress');
			integratedScan(context, workspaceLocation, userInput, uri, isRunFromCommandPalette);
		} else {
			Utils.showScanAbortedMessage();
		}
	}
}

async function integratedScan(context: ExtensionContext, workspaceLocation: string, userInput: string, source: Uri, isRunFromCommandPalette: boolean) {
	Utils.logMessage('Integrated scan started.');
	if (!Utils.isAccuricsCliBinaryPresent(context)) {
		let userAction = await window.showInformationMessage(ACCURICS_TOOLS_NOT_INSTALLED, INSTALL_OPTION);
		if (userAction !== undefined) {
			try {
				await new AccuricsCliDownloader(context).downloadWithProgress(false);
				window.showInformationMessage(ACCURICS_TOOLS_DOWNLOAD_SUCCESS);
			} catch (error: any) {
				window.showErrorMessage(ACCURICS_TOOLS_DOWNLOAD_FAILURE + error.message);
				return;
			}
		}
	}

	let accuricsOutputChannel: OutputChannel = window.createOutputChannel('accurics');
	accuricsOutputChannel.appendLine(`Running Accurics ${userInput}...`);
	accuricsOutputChannel.show();

	let workDirectory: string;
	if (isRunFromCommandPalette) {
		workDirectory = workspaceLocation;
	} else {
		if (lstatSync(source.fsPath).isDirectory()) {
			workDirectory = source.fsPath;
		} else {
			workDirectory = source.fsPath.substring(0, source.fsPath.lastIndexOf(sep));
		}
	}

	let execOptions: ExecOptions = {
		cwd: workDirectory
	};

	let accuricsCliLocation: string = context.extensionPath + sep + 'executables' + sep + 'accurics' + sep + 'accurics';
	if (Utils.isWindowsPlatform()) {
		accuricsCliLocation += '.exe';
	}

	Utils.logMessage(`accurics ${userInput} -config= ` + context.workspaceState.get(WORKSPACE_CONFIG_FILE_KEY));
	exec(`${accuricsCliLocation} ${userInput} -config=` + context.workspaceState.get(WORKSPACE_CONFIG_FILE_KEY),
		execOptions,
		(err: ExecException | null, stdout: any, stderr: any) => {

			/*
				The stdout and stderr output from accurics cli sometimes
				contains ANSI characters (due to color codes), stripAnsi 
				removes those color codes.
			*/
			if (err) {
				Utils.logMessage(`${userInput} error.`);
				window.showErrorMessage(`${userInput} has resulted in an error. Please check output tab for details.`);
				accuricsOutputChannel.appendLine(stripAnsi(stderr));
				accuricsOutputChannel.appendLine(stripAnsi(stdout));
			} else {
				Utils.logMessage(`${userInput} complete.`);
				window.showInformationMessage(`${userInput} has been completed, please check the output tab for the result`);
				accuricsOutputChannel.appendLine(`${userInput} Complete.`);

				accuricsOutputChannel.appendLine(stripAnsi(stderr));
				accuricsOutputChannel.appendLine(stripAnsi(stdout));

				// print report to output.
				if (userInput === 'plan') {
					Utils.logMessage('Print json report to output channel.');
					let displayJsonReportCommand: string = 'cat accurics_report.json';
					if (Utils.isWindowsPlatform()) {
						displayJsonReportCommand = 'type accurics_report.json';
					}
					exec(`${displayJsonReportCommand}`, execOptions,
						(err: any, stdout: any, stderr: any) => {
							accuricsOutputChannel.appendLine(stdout);
							if (err) {
								accuricsOutputChannel.appendLine(stderr);
							}
						});
				} else {
					accuricsOutputChannel.appendLine(stripAnsi(stderr));
					accuricsOutputChannel.appendLine(stripAnsi(stdout));
				}
			}
		});
}

async function standaloneScan(context: ExtensionContext, workspaceLocation: string, userInput: string, isRunFromCommandPalette: boolean, source: Uri) {
	Utils.logMessage('standalone scan started');
	if (!Utils.isTerrascanBinaryPresent(context)) {
		let userAction = await window.showInformationMessage(ACCURICS_TOOLS_NOT_INSTALLED, INSTALL_OPTION);
		if (userAction !== undefined) {
			try {
				await new TerrascanDownloader(context).downloadWithProgress(false);
				window.showInformationMessage(ACCURICS_TOOLS_DOWNLOAD_SUCCESS);
			} catch (error: any) {
				window.showErrorMessage(ACCURICS_TOOLS_DOWNLOAD_FAILURE + error.message);
				return;
			}
		}
	}

	let accuricsOutputChannel: OutputChannel = window.createOutputChannel('accurics');
	accuricsOutputChannel.appendLine(`Running Accurics scan for iac-type ${userInput}`);
	accuricsOutputChannel.show();

	let scanOptions: string;
	if (isRunFromCommandPalette) {
		scanOptions = `-d ${workspaceLocation} -o json`;
	} else {
		if (lstatSync(source.fsPath).isDirectory()) {
			scanOptions = `-d ${source.fsPath} -o json`;
		} else {
			scanOptions = `-f ${source.fsPath} -o json`;
		}
	}

	let execOptions: ExecOptions = {
		cwd: workspaceLocation
	};

	let terrascanLocation: string = context.extensionPath + sep + 'executables' + sep + 'terrascan' + sep + 'terrascan';
	if (Utils.isWindowsPlatform()) {
		terrascanLocation += '.exe';
	}

	Utils.logMessage(`${terrascanLocation} scan -i ${userInput} ${scanOptions}`);
	exec(`${terrascanLocation} scan -i ${userInput} ${scanOptions}`,
		execOptions,
		(err: ExecException | null, stdout: any, stderr: any) => {

			/*
				The stdout and stderr output from terrascan sometimes
				contains ANSI characters (due to color codes), stripAnsi 
				removes those color codes.
			*/

			if (err) {
				// terrascan exits with exit code 3 when there are violations.
				Utils.logMessage('Scan complete');
				if (err !== null && err.code === 3) {
					window.showInformationMessage(`Scan has been completed, please check the output tab for the result`);
					accuricsOutputChannel.appendLine(stdout);

					let output: TerrascanScanReport = <TerrascanScanReport>JSON.parse(stdout);
					if (isRunFromCommandPalette) {
						generateReports(stdout, workspaceLocation, userInput, output);
					} else {
						generateReports(stdout, source.fsPath, userInput, output);
					}
				} else {
					Utils.logMessage('Scan error');
					window.showErrorMessage('Scan has resulted in an error. Please check output tab for details.');
					accuricsOutputChannel.appendLine(stripAnsi(stderr));
					accuricsOutputChannel.appendLine(stripAnsi(stdout));
				}
			} else {
				if (stderr) {
					Utils.logMessage('Scan error');
					window.showErrorMessage('Scan has resulted in an error. Please check output tab for details.');
					accuricsOutputChannel.appendLine(stripAnsi(stderr));
				} else {
					Utils.logMessage('Scan complete');
					window.showInformationMessage('Scan has been completed, please check the output tab for the result');
					accuricsOutputChannel.appendLine(stdout);

					Utils.logMessage('Generate reports and print json report');
					let output: TerrascanScanReport = <TerrascanScanReport>JSON.parse(stdout);
					if (isRunFromCommandPalette) {
						generateReports(stdout, workspaceLocation, userInput, output);
					} else {
						generateReports(stdout, source.fsPath, userInput, output);
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