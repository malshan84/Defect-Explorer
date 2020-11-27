import * as vscode from 'vscode';
import { Defect } from '../defects';
import * as path from 'path';

export class DefectTreeItem extends vscode.TreeItem {
    constructor(
      private message: string,
      private startColumn: number,
      private startLine: number,
      private filePath: string,
      private rule: string
    ) {
      super(message, vscode.TreeItemCollapsibleState.None);
      const uri: vscode.Uri = vscode.Uri.file(this.filePath);
      const defectResource: DefectResource = {
        uri: uri,
        column: this.startColumn,
        line: this.startLine -1
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
    column: number;
    line: number;
  }