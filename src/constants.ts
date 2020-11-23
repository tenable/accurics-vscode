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
export const ACCURICS_CLI_SCAN_OPTIONS: string[] = ['init', 'plan'];
export const ACCRUICS_CLI_SCAN_QUICK_PICK_PLACEHOLDER: string = 'Scan options?';

//extension mode constants
export const MODE_QUICK_PICK_OPTIONS: string[] = [STANDALONE_MODE, INTEGRATED_MODE];
export const MODE_QUICK_PICK_PLACE_HOLDER: string = 'Choose mode for AccuricsIAC Scans';

//configure command constants
export const CONFIGURATION_OVERRIDE_OPTIONS: string[] = ['Yes', 'No'];
export const CONFIGURATION_QUICK_PICK_PLACE_HOLDER: string = 'Override existing configuration?';
export const CONFIGURATION_OPEN_DIALOG_LABEL: string = 'Select config file downloaded from accurics cloud';