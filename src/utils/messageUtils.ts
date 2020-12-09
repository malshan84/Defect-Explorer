import * as vscode from 'vscode';

export class MessageUtils {
    public static info(message: string) {
        vscode.window.showInformationMessage(message);
    }

    public static warning(message: string) {
        vscode.window.showWarningMessage(message);
    }
}