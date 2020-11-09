import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Defect, Defects } from './defects';
import { DefectItem, GroupByRuleItem, BasicTreeItem } from './TreeItem/BasicTreeItem';
import { FileSystemProvider } from './FileTree';


export class StaticDefectsProvider
  implements vscode.TreeDataProvider<BasicTreeItem> {
  
  groupByDefect: BasicTreeItem[] = new Array;

  constructor() { 
    const workspaceRoot = vscode.workspace.rootPath ? vscode.workspace.rootPath : '';
    if (!workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      this.groupByDefect = [];
      return;
    }

    let defectsJsonPath = path.join(
      workspaceRoot,
      'resources',
      'sample.json'
    );

    if (this.pathExists(defectsJsonPath)) {
      this.groupByDefect = this.getDefects(defectsJsonPath);
    } else {
      vscode.window.showInformationMessage('Workspace has no package.json');
      this.groupByDefect = [];
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<BasicTreeItem | undefined> = new vscode.EventEmitter<BasicTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<BasicTreeItem | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: BasicTreeItem): vscode.TreeItem|Thenable<BasicTreeItem> {
    return element;
  }

  public getChildren(element?: BasicTreeItem|undefined): vscode.ProviderResult<BasicTreeItem[]> {
    if (element === undefined) {
      return this.groupByDefect;
    }
    return element.getChildren();
  }

  private getDefects(defectsJsonPath: string): BasicTreeItem[] {
    if (!this.pathExists(defectsJsonPath)) {
      return [];
    }

    const defectsJsons: Defects = JSON.parse(
      fs.readFileSync(defectsJsonPath, 'utf-8')
    );

    const makeDefectItem = (defect: Defect): DefectItem => {
      return new DefectItem(defect);
    };

    const makeGroupByRuleItem = (defect: Defect): GroupByRuleItem => {
      return new GroupByRuleItem(
        defect.rule
      );
    };

    let mapOfDefect = new Map<string, GroupByRuleItem>();
    let arrayOfDefect: BasicTreeItem[] = new Array();

    mapOfDefect = defectsJsons.defects.reduce(
      (x: Map<string, GroupByRuleItem>, y: Defect) => {
        if (x.has(y.rule)) {
          x.get(y.rule)?.pushDefect(makeDefectItem(y));
        } else {
          let groupByRuleItem: GroupByRuleItem = makeGroupByRuleItem(y);
          groupByRuleItem.pushDefect(makeDefectItem(y));
          x.set(y.rule, groupByRuleItem);
          arrayOfDefect.push(groupByRuleItem);
        }
        return x;
      },
      mapOfDefect
    );

    return arrayOfDefect;
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export class DefectExplorer {
  constructor(context: vscode.ExtensionContext) {
    const staticDefectTreeViewProvider: StaticDefectsProvider = new StaticDefectsProvider();
    vscode.window.registerTreeDataProvider(
    'defectExplorer', staticDefectTreeViewProvider
    );
    vscode.commands.registerCommand('defectExplorer.openFile', (resource) => this.openResource(resource));
	}

	private openResource(resource: vscode.Uri): void {
		vscode.window.showTextDocument(resource);
	}
}


