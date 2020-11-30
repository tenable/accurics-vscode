import { request, RequestOptions } from "https";
import { ExtensionContext, Progress } from "vscode";
import { LatestReleaseResponse } from "../interface/terrascanMetadata";
import { unlinkSync } from "fs";
import decompress = require('decompress');
import { ProgressType } from "../constants";
import { BinaryDownloader } from "./binaryDownloader";
import { Utils } from "./utils";

export class TerrascanDownloader extends BinaryDownloader {

    private downloadedFilePath: string = '';

    // For this release use terrascan 1.2.0
    private host: string = 'api.github.com';
    private path: string = '/repos/accurics/terrascan/releases/34044277';

    constructor(public context: ExtensionContext) {
        super(context);
    }

    downloadBinary(progress: Progress<ProgressType>, isActivateCall: boolean): Promise<boolean> {
        Utils.logMessage('Downloading Terrascan');
        return new Promise<boolean>((resolve, reject) => {
            this.getLatestReleaseData(progress)
                .then((latestReleaseResponse: LatestReleaseResponse) => {
                    return this.download(this.context.extensionPath, '', latestReleaseResponse);
                })
                .then((downloadedFilePath) => {
                    this.downloadedFilePath = downloadedFilePath;
                    if (isActivateCall) {
                        progress.report({ increment: 25 });
                    } else {
                        progress.report({ increment: 60 });
                    }
                    Utils.logMessage('Extracting Terrascan');
                    return this.extractTarFile(downloadedFilePath, 'terrascan');
                })
                .then((files: decompress.File[]) => {
                    // delete the downloaded tar file
                    unlinkSync(this.downloadedFilePath);
                    resolve(true);
                })
                .catch((reason: any) => {
                    Utils.logMessage('Terrascan download error: ' + reason.message);
                    reject(reason);
                });
        });
    }

    private async getLatestReleaseData(progress: Progress<ProgressType>): Promise<LatestReleaseResponse> {

        return new Promise<LatestReleaseResponse>((resolve, reject) => {
            let options: RequestOptions = {
                host: this.host,
                port: 443,
                path: this.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'accurics-iac-vscode'
                }
            };

            let req = request(options, (res) => {
                let data: string = '';
                res.on('data', (d) => {
                    data += String(d);
                });
                res.on('end', () => {
                    let jsonData = <LatestReleaseResponse>JSON.parse(data);
                    progress.report({ increment: 10 });
                    resolve(jsonData);
                });
            });
            req.end();
            req.on('error', reject);
        });
    }
}