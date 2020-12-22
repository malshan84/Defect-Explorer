import * as vscode from 'vscode';
import * as path from 'path';

export class DefectTreeItem extends vscode.TreeItem {
    constructor(
      private message: string,
      private startLine: number,
      private startColumn: number,      
      private endLine: number,
      private endColumn: number,
      private filePath: string,
      private rule: string
    ) {
      super(message, vscode.TreeItemCollapsibleState.None);
      const uri: vscode.Uri = vscode.Uri.file(this.filePath);
      const defectResource: DefectResource = {
        uri: uri,
        startLine: this.startLine -1,
        startColumn: this.startColumn ? this.startColumn -1: 0,
        endLine: this.endLine? this.endLine -1: this.startLine -1,
        endColumn: this.endColumn? this.endColumn: Number.MAX_SAFE_INTEGER
      };
      this.command = { command: 'defectExplorer.openFile', title: "Open File", arguments: [defectResource], };
      this.contextValue = 'file';
      this.description = `${this.filePath} (${this.startLine})`;
      this.tooltip = `${this.rule}-${this.message}`;
    }
  
    iconPath = {
      light: path.join(
        __filename,
        '..',
        '..',
        'resources',
        'light',
        'dependency.svg'
      ),
      dark: path.join(
        __filename,
        '..',
        '..',
        'resources',
        'dark',
        'dependency.svg'
      ),
    };
  }
  
  export interface DefectResource {
    uri: vscode.Uri;  
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  }