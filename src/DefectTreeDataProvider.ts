import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { GroupByRuleTreeItem } from './TreeItem/GruopByRuleTreeItem';
import { MessageUtils } from './utils/messageUtils';
import { DefectResource } from './TreeItem/defectTreeItem';


export class StaticDefectsProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  
  defectResourcePath: string = '';

  constructor() { 
    const workspaceRoot = vscode.workspace.rootPath ? vscode.workspace.rootPath : '';
    if (!workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return;
    }

    this.defectResourcePath = path.join(
      workspaceRoot,
      'resources',
      'sample.ci'
    );
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GroupByRuleTreeItem): Thenable<vscode.TreeItem[]> {
    if (!this.pathExists(this.defectResourcePath)) {
      MessageUtils.warning("not found db file. : '"+this.defectResourcePath+"'");
      return Promise.resolve([]);
    }

    if(element) {
      return element.getChildren(this.defectResourcePath);
    } else {
      return new Promise((resolve, reject) =>{      
        let groupByRuleItems: GroupByRuleTreeItem[] = [];
        let db = new sqlite3.Database(this.defectResourcePath);
  
        db.serialize(()=>{
          db.each("SELECT  ruleName, count(ruleName) as c FROM (SELECT DISTINCT ruleName, idsourcefile, message, idcitemplate, line, scol, ecol, eline FROM violation) GROUP BY ruleName", (err, row) =>{
            groupByRuleItems.push(new GroupByRuleTreeItem(row.ruleName, row.c));
          },(err, n) => {
            resolve(groupByRuleItems);
            reject(err);
          });
          db.close();
        });
      });
    }  
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
  constructor() {
    const staticDefectTreeViewProvider: StaticDefectsProvider = new StaticDefectsProvider();
    vscode.window.registerTreeDataProvider(
    'defectExplorer', staticDefectTreeViewProvider
    );
    vscode.commands.registerCommand('defectExplorer.openFile', (resource) => this.openResource(resource));
	}

	private openResource(resource: DefectResource): void {
    const options: vscode.TextDocumentShowOptions = {
      selection: new vscode.Range(resource.startLine, resource.startColumn, resource.endLine, resource.endColumn),
      preview: true,
      preserveFocus: false
    };
    
    const textEditor = vscode.window.showTextDocument(resource.uri, options);
    const color = "rgba(255, 0, 0, 0.4)";
    const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({ 
      // borderWidth: '1px',
      borderStyle: 'none',
      backgroundColor: color,
      overviewRulerColor: color,
      overviewRulerLane: vscode.OverviewRulerLane.Full,
      light: {
        // this color will be used in light color themes
        borderColor: color
      },
      dark: {
        // this color will be used in dark color themes
        borderColor: color
      }
    });

    textEditor.then(e => {
      e.setDecorations(smallNumberDecorationType, [new vscode.Range(resource.startLine, resource.startColumn, resource.endLine, resource.endColumn)]);
    });
	}
}


