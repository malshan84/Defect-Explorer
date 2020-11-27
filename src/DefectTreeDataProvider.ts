import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Defect, Defects } from './defects';
import * as sqlite3 from 'sqlite3';
import { GroupByRuleTreeItem } from './TreeItem/GruopByRuleTreeItem';
import { DefectTreeItem } from './TreeItem/defectTreeItem';//


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

  // private _onDidChangeTreeData: vscode.EventEmitter<BasicTreeItem | undefined> = new vscode.EventEmitter<BasicTreeItem | undefined>();
  // readonly onDidChangeTreeData: vscode.Event<BasicTreeItem | undefined> = this._onDidChangeTreeData.event;

  // refresh(): void {
  //   this._onDidChangeTreeData.fire(undefined);
  // }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GroupByRuleTreeItem): Thenable<vscode.TreeItem[]> {

    if(element) {
      return element.getChildren(this.defectResourcePath);
    } else {
      return new Promise((resolve, reject) =>{      
        let groupByRuleItems: GroupByRuleTreeItem[] = [];
        let db = new sqlite3.Database(this.defectResourcePath);
  
        db.serialize(()=>{
          db.each("SELECT  ruleName, count(ruleName) as c FROM violation GROUP BY ruleName", (err, row) =>{
            groupByRuleItems.push(new GroupByRuleTreeItem(row.ruleName, row.c));
          },(err, n) => {
            resolve(groupByRuleItems);
          });
          db.close();
        });
      });
    }  
  }

  // private getDefects(defectsJsonPath: string): BasicTreeItem[] {
  //   if (!this.pathExists(defectsJsonPath)) {
  //     return [];
  //   }

  //   const defectsJsons: Defects = this.getDefectListFromJson(defectsJsonPath);
    // let defectsJsons: Defects = {
    //   numberOfDefects: 0,
    //   defects: []
    // };
    // defectsJsons = this.getDefectListFromDB(defectsJsonPath);

  //   const makeDefectItem = (defect: Defect): DefectItem => {
  //     return new DefectItem(defect);
  //   };

  //   const makeGroupByRuleItem = (defect: Defect): GroupByRuleItem => {
  //     return new GroupByRuleItem(
  //       defect.rule
  //     );
  //   };

  //   let mapOfDefect = new Map<string, GroupByRuleItem>();
  //   let arrayOfDefect: BasicTreeItem[] = new Array();

  //   mapOfDefect = defectsJsons.defects.reduce(
  //     (x: Map<string, GroupByRuleItem>, y: Defect) => {
  //       if (x.has(y.rule)) {
  //         x.get(y.rule)?.pushDefect(makeDefectItem(y));
  //       } else {
  //         let groupByRuleItem: GroupByRuleItem = makeGroupByRuleItem(y);
  //         groupByRuleItem.pushDefect(makeDefectItem(y));
  //         x.set(y.rule, groupByRuleItem);
  //         arrayOfDefect.push(groupByRuleItem);
  //       }
  //       return x;
  //     },
  //     mapOfDefect
  //   );

  //   return arrayOfDefect;
  // }

  // private getDefectListFromDB(defectsJsonPath: string) : Defects{
  //   let defects: Defects = {
  //     numberOfDefects:0,
  //     defects:[]
  //   };

  //   let db = new sqlite3.Database(defectsJsonPath);

  //   db.serialize(()=>{
  //     db.each("SELECT * FROM violation", (err, row) =>{
  //       let defect: Defect = row;
  //       defects.defects.push(defect);
  //       defects.numberOfDefects++;
  //     });
  //   });

  //   db.close();
  //   return defects;
  // }

  // private getDefectListFromJson(defectsJsonPath: string): Defects {
  //   return JSON.parse(
  //     fs.readFileSync(defectsJsonPath, 'utf-8')
  //   );
  // }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

interface DefectResource {
  uri: vscode.Uri;
  column: number;
  line: number;
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
      selection: new vscode.Range(resource.line, 0, resource.line, 0),
      preview: false
    };

    const textEditor = vscode.window.showTextDocument(resource.uri, options);

    const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
      borderWidth: '1px',
      borderStyle: 'solid',
      overviewRulerColor: 'blue',
      overviewRulerLane: vscode.OverviewRulerLane.Full,
      light: {
        // this color will be used in light color themes
        borderColor: 'darkblue'
      },
      dark: {
        // this color will be used in dark color themes
        borderColor: 'lightblue'
      }
    });

    textEditor.then(e => {
      e.setDecorations(smallNumberDecorationType, [new vscode.Range(resource.line, 0, resource.line, 100)]);
    });
	}
}


