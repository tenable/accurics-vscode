//extension's global state keys
export const ACCURICS_IAC_MODE: string = 'AccuricsIACMode';
export const STANDALONE_MODE: string = 'Standalone';
export const INTEGRATED_MODE: string = 'Integrated';

//extension's workspace state keys
export const WORKSPACE_CONFIG_FILE_KEY = 'configFilePath';

//terrascan scan option constants
export const TERRASCAN_IAC_TYPES: string[] = ['helm', 'k8s', 'kustomize', 'terraform'];
export const IAC_TYPE_QUICK_PICK_PLACEHOLDER: string = 'Pick iac type';

//accurics-cli scan option constants
export const ACCURICS_INIT_COMMAND = 'init';
export const ACCURICS_PLAN_COMMAND = 'plan';
export const ACCURICS_PLAN_ALL_COMMAND = 'plan-all';
export const ACCURICS_PLAN_CF_COMMAND = 'plan cf';
export const ACCURICS_TG_PLAN_COMMAND = 'tgplan';
export const ACCURICS_TG_PLAN_ALL_COMMAND = 'tgplanall';
export const ACCURICS_WORKSPACE_COMMAND = 'workspace';
export const ACCURICS_CLI_SCAN_OPTIONS: string[] = [ACCURICS_INIT_COMMAND, ACCURICS_PLAN_COMMAND, ACCURICS_PLAN_ALL_COMMAND, ACCURICS_PLAN_CF_COMMAND, ACCURICS_TG_PLAN_COMMAND, ACCURICS_TG_PLAN_ALL_COMMAND, ACCURICS_WORKSPACE_COMMAND];
export const ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER: string = 'Scan options?';

//extension mode constants
export const MODE_QUICK_PICK_OPTIONS: string[] = [STANDALONE_MODE, INTEGRATED_MODE];
export const MODE_QUICK_PICK_PLACE_HOLDER: string = 'Choose mode for Accurics Scan';

//configure command constants
export const CONFIGURATION_OVERRIDE_OPTIONS: string[] = ['Yes', 'No'];
export const CONFIGURATION_QUICK_PICK_PLACE_HOLDER: string = 'Override existing configuration?';
export const CONFIGURATION_OPEN_DIALOG_LABEL: string = 'Select config file downloaded from accurics cloud';

//download progress and error related constants
export const ACCURICS_TOOLS_DOWNLOAD_SUCCESS = 'Downloaded Accurics tools';
export const ACCURICS_TOOLS_DOWNLOAD_FAILURE = 'Accurics tools download failed. ';
export const ACCURICS_TOOLS_NOT_INSTALLED = 'Accurics tools not installed';
export const INSTALL_OPTION = "Install";
export const PROGRESS_MESSAGE = 'Downloading Accurics tools';

//interface to define the type for vscode progress notification
export interface ProgressType {
    message?: string | undefined;
    increment?: number | undefined;
};