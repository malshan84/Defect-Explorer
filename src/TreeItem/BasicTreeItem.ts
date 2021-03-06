import * as vscode from 'vscode';
import * as path from 'path';
import { Defect } from '../defects';

export class BasicTreeItem extends vscode.TreeItem {
  children: BasicTreeItem[]|undefined;

  constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }

  addChildren(treeItem: BasicTreeItem) {
    if (this.children === undefined) {
      this.children = new Array<BasicTreeItem>();
    }
    this.children.push(treeItem);
  }

  getChildren(): BasicTreeItem[] | undefined {
    return this.children;
  }

  setDescription(desc:string) {
    this.description = desc;
  }
}

export class GroupByRuleItem extends BasicTreeItem {
  size: number = 0;
  constructor(
    private ruleName: string
  ) {
    super(ruleName, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `(${this.size})`;
  }

  pushDefect(defect: BasicTreeItem) {
    this.addChildren(defect);
    this.size++;
    this.description = `(${this.size})`;
  }
}


export interface DefectResource {
  uri: vscode.Uri;
  column: number;
  line: number;
}

export class DefectItem extends BasicTreeItem {
  constructor(
    private defect: Defect,
  ) {
    super(defect.message, vscode.TreeItemCollapsibleState.None);
    const uri: vscode.Uri = vscode.Uri.file(defect.path);
    const defectResource: DefectResource = {
      uri: uri,
      column: defect.startColumn,
      line: defect.startLine -1
    };
    this.command = { command: 'defectExplorer.openFile', title: "Open File", arguments: [defectResource], };
    this.contextValue = 'file';
    this.description = `${this.defect.path} (${this.defect.startLine})`;
    this.tooltip = `${this.defect.rule}-${this.defect.message}`;
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