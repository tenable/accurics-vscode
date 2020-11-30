# Accurics for Visual Studio Code

Accurics detects and mitigates risks in Infrastructure as Code (IAC) and reduces your attack surface before infrastructure is provisioned.

This extension seamlessly enables scanning of your IAC files and folders through [Visual Studio Code](https://code.visualstudio.com/).

## Overview

Accurics for Visual Studio Code extension supports Terraform, Kustomize, Helm & Kubernetes YAML. It uses Accurics CLI and Terrascan for scanning the IaC files and reports violations in the output window.

Accurics Extension operates has 2 modes

1. `Standalone`: Iac scans are performed locally within the VS Code environment. Results are displayed in the output window.

2. `Integrated`: Scan results are visible in [Accurics Cloud Console](https://app.accurics.com). The Accurics Console offers rich capabilities of viewing various KPIs, Policy Violations and Drifts. It also offers seamless integration with various Developer Tools like Jira and Slack.

## Installation

Launch Visual Studio Code and search for Accurics in the Extension Marketplace Workspace. Install the extension by selecting install option.

During the installation, Accurics Extension downloads other dependent components and configures them locally.

For Integrated mode, Follow the steps

- [ ] Create your free [Accurics account](https://app.accurics.com)
- [ ] Login to the Accurics Console.
- [ ] Create an environment and download config file for that Environment.

To remove the extension, select uninstall.

## Usage

### Standalone Mode

- Launch the extension and select Mode as Standalone.
- Once the mode is selected, right-mouse-click on any IAC file
- Select `Accurics Scan`. Select from the list of IaC types. Options available are  `Yaml`/`Helm`/`Kustomize`/`Terraform`.
- Accurics extension performs the IaC scan and reports results in the output window of VS Code.

### Integrated Mode

Launch the extension, select mode as Integrated and do the following steps

- Create an [Accurics account](https://app.accurics.com).
- Login to the Accurics Console and create an Environment by following the steps in Environment creation wizard.
- Select Environment name and Download the configuration file.
- Place the configuration file in local folder for the extension.
- Once the config file has ben downloaded, Run `Accurics Configure` command & select the downloaded file.
- right-mouse-click on any IAC file within VS Code workspace.
- Select `Accurics Scan`.

Extension will perform the scan and report the results in output window as well as in [Accurics Cloud Console](https://app.accurics.com)

Currently, integrated scan is supported only for terraform file.
