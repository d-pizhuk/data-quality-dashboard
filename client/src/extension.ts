/* -------------------------------------------------------------------------
 * Original work Copyright (c) Microsoft Corporation. All rights reserved.
 * Original work licensed under the MIT License.
 * See ThirdPartyNotices.txt in the project root for license information.
 * All modifications Copyright (c) Open Law Library. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http: // www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------- */
"use strict";

import * as net from "net";
import * as path from "path";
import * as vscode from 'vscode';
import {ExtensionContext, ExtensionMode, workspace} from 'vscode';
import {spawn} from 'child_process';
import {LanguageClient, LanguageClientOptions, ServerOptions,} from "vscode-languageclient/node";

let client: LanguageClient;
const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
const CMD_STATUS_BAR_NOTIF_FROM_SERVER = 'status_bar_notification'

const dqDashboardCommands : { [key: string]: string } = {
    clientCommand: "dq_dashboard_client",
    serverCommand: "dq_dashboard_server"
};

function getClientOptions(): LanguageClientOptions {
    return {
        outputChannelName: "[pygls] JsonLanguageServer",
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
        },
    };
}

function startLangServerTCP(addr: number): LanguageClient {
    statusBarItem.text = "$(sync~spin) DQ Dashboard: Activating extension...";
    const serverOptions: ServerOptions = () => {
        return new Promise((resolve) => {
            const maxAttempts = 10;
            let attempt = 0;
    
            const connect = () => {
                const clientSocket = new net.Socket();
    
                clientSocket.on("error", (error) => {
                    attempt++;
                    if (attempt < maxAttempts) {
                        if (attempt == 1){
                            statusBarItem.show();
                        }
                        
                        setTimeout(connect, 3000); 
                    } else {
                        statusBarItem.hide()
                        vscode.window.showErrorMessage("DQ Dashboard: The number of connection attempts exceeded");
                    }
                });
    
                clientSocket.connect(addr, "127.0.0.1", () => {
                    if (attempt > 0) {
                        statusBarItem.hide()
                        vscode.window.showInformationMessage("DQ Dashboard: Extension is activated succesfully");
                    }
                    resolve({
                        reader: clientSocket,
                        writer: clientSocket,
                    });
                });
            };
    
            connect();
        });
    };

    return new LanguageClient(
        `tcp lang server (port ${addr})`,
        serverOptions,
        getClientOptions()
    );
}

async function getPythonPath(): Promise<string | undefined> {
    const pythonExtension = vscode.extensions.getExtension('ms-python.python');
    if (pythonExtension) {
        const api = await pythonExtension.activate();
        if (api && api.settings) {
            const envPath =  await api.environment.getActiveEnvironmentPath();
            return envPath.path;
        }
    }
    return undefined;
}

export async function activate(context: ExtensionContext): Promise<void> {
    if (context.extensionMode === ExtensionMode.Production) {
        const mainFolderPath = path.join(__dirname, "..", "..");
        const pythonPath = await getPythonPath();
        const args = ["-m", "server", "--tcp"];

        const serverProcess = spawn(pythonPath, [...args], {
            cwd: mainFolderPath
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`Server stdout: ${data}`);
        });
        
        serverProcess.stderr.on('data', (data) => {
            console.error(`Server stderr: ${data}`);
        });
        
        serverProcess.on('close', (code) => {
            console.log(`Server process exited with code ${code}`);
        });
    }

    client = startLangServerTCP(2087);

    vscode.workspace.getConfiguration().update('editor.quickSuggestions', true, vscode.ConfigurationTarget.Global);

    const dqDashboard = vscode.commands.registerCommand(dqDashboardCommands.clientCommand, async () => {
        await vscode.commands.executeCommand(dqDashboardCommands.serverCommand);
    });

    client.onReady().then(() => {
        client.onNotification(CMD_STATUS_BAR_NOTIF_FROM_SERVER, (params) => {
            if (params) {
                const { message, visibility } = params;
                statusBarItem.text = `$(sync~spin) ${message}`;
                if (visibility) {
                    statusBarItem.show();
                } else {
                    statusBarItem.hide()
                }
            }
        });
    });
    
    context.subscriptions.push(dqDashboard);
    context.subscriptions.push(client.start());
}

export function deactivate(): Thenable<void> {
    return client ? client.stop() : Promise.resolve();
}

