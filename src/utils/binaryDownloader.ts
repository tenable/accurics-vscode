import decompress = require("decompress");
import { createWriteStream } from "fs";
import { arch, platform } from "os";
import { sep } from "path";
import { HttpClient } from "typed-rest-client/HttpClient";
import { ExtensionContext, Progress, ProgressLocation, ProgressOptions, window } from "vscode";
import { ProgressType } from "../constants";
import { LatestReleaseResponse } from "../interface/terrascanMetadata";
import { Utils } from "./utils";

export abstract class BinaryDownloader {

    constructor(public context: ExtensionContext) { }

    // This method will download the dependency with a progress bar.
    downloadWithProgress(isActivateCall: boolean) {
        let progressOptions: ProgressOptions = {
            location: ProgressLocation.Notification,
            title: 'Downloading Accurics tools',
            cancellable: false
        };

        return window.withProgress(progressOptions, (progress) => {
            /**
             * progress report is hardcoded for now.
             * increase to 10 percent when release metdata is received.
             * increase to 60 percent when the binary is downloaded.
             * increase to 100 percent when decompress is finished.
             */
            progress.report({ increment: 0 });
            return new Promise<boolean>((resolve, reject) => {
                this.downloadBinary(progress, isActivateCall)
                    .then((downloadComplete: boolean) => {
                        // console.log('downloaded dependencies');
                        progress.report({ increment: 100 });
                        resolve(downloadComplete);
                    })
                    .catch((reason: any) => {
                        // console.log('download terrascan failed.');
                        reject(reason);
                    });
            });
        });
    }

    protected async download(extensionPath: string, browserDownloadUrl: string, githubResponse?: LatestReleaseResponse): Promise<string> {

        if (githubResponse !== undefined) {
            for (let i = 0; i < githubResponse.assets.length; i++) {
                let assetName: string = githubResponse.assets[i].name.toLowerCase();

                let currentPlatform: string = platform();
                if (Utils.isWindowsPlatform()) {
                    currentPlatform = 'windows';
                }

                //contains os name and correct arch
                if (assetName.includes(currentPlatform) && assetName.includes(arch().substring(1))) {
                    browserDownloadUrl = githubResponse.assets[i].browser_download_url;
                    break;
                }
            }
        }

        let client = new HttpClient("accurics-iac-vscode");
        Utils.logMessage('Making http call: ' + browserDownloadUrl);
        let response = await client.get(browserDownloadUrl);
        Utils.logMessage('Received response: ' + response.message.statusCode);
        let downloadTarFileName: string = browserDownloadUrl.substring(browserDownloadUrl.lastIndexOf('/') + 1);
        let filePath = extensionPath + sep + 'executables' + sep + downloadTarFileName;
        let file: NodeJS.WritableStream = createWriteStream(filePath);

        if (response.message.statusCode !== 200) {
            const err: Error = new Error(`Unexpected HTTP response: ${response.message.statusCode}`);
            throw err;
        }
        return new Promise((resolve, reject) => {
            file.on("error", (err) => reject(err));
            const stream = response.message.pipe(file);
            stream.on("close", () => {
                try {
                    resolve(filePath);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    abstract async downloadBinary(progress: Progress<ProgressType>, isActivateCall: boolean): Promise<boolean>;

    async extractTarFile(downloadedFilePath: string, binaryFolderName: string) {
        return decompress(downloadedFilePath, this.context.extensionPath + sep + 'executables' + sep + binaryFolderName, {
            map: file => {
                return file;
            }
        });
    }
}