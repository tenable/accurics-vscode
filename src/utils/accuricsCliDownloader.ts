import { ExtensionContext, Progress } from "vscode";
import { Utils } from "./utils";
import { unlinkSync } from "fs";
import decompress = require('decompress');
import { ProgressType } from "../constants";
import { BinaryDownloader } from "./binaryDownloader";

export class AccuricsCliDownloader extends BinaryDownloader {
    private downloadedFilePath: string = '';

    // For this release use accurics cli 1.0.8
    private host: string = 'https://accuricspublic.s3-us-west-2.amazonaws.com';
    private path: string = '/Accurics-cli/1.0.8/';

    constructor(public context: ExtensionContext) {
        super(context);
        if (Utils.isDarwinPlatform()) {
            this.path += 'Mac/accurics.zip';
        } else if (Utils.isWindowsPlatform()) {
            this.path += 'Windows/accurics.zip';
        } else {
            this.path += 'Linux/accurics.zip';
        }
    }

    downloadBinary(progress: Progress<ProgressType>, isActivateCall: boolean): Promise<boolean> {
        Utils.logMessage('Downloading Accurics CLI');
        return new Promise<boolean>((resolve, reject) => {
            this.download(this.context.extensionPath, this.host + this.path)
                .then((downloadedFilePath) => {
                    this.downloadedFilePath = downloadedFilePath;
                    if (isActivateCall) {
                        progress.report({ increment: 25 });
                    } else {
                        progress.report({ increment: 60 });
                    }
                    Utils.logMessage('Extracting Accurics CLI');
                    return this.extractTarFile(downloadedFilePath, 'accurics');
                })
                .then((files: decompress.File[]) => {
                    // delete the downloaded tar file
                    unlinkSync(this.downloadedFilePath);
                    resolve(true);
                })
                .catch((reason: any) => {
                    Utils.logMessage('Accurics CLI download error: ' + reason.message);
                    reject(reason);
                });
        });
    }
}