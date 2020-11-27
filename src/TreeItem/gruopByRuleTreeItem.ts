import * as vscode from 'vscode';
import { DefectTreeItem } from './defectTreeItem';
import * as sqlite3 from 'sqlite3';
import { Defect } from '../defects';

export class GroupByRuleTreeItem extends vscode.TreeItem {
  size: number = 0;
  constructor(
    private ruleName: string,
    numberOfDefect: number
  ) {
    super(ruleName, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `(${numberOfDefect})`;
  }

  public getChildren(dbpath: string): Thenable<DefectTreeItem[]> {
    return new Promise((resolve, reject) =>{      
      let defects: DefectTreeItem[] = [];
      let db = new sqlite3.Database(dbpath);
      db.serialize(()=>{
        db.each("SELECT message, scol, line, path, ruleName FROM violation as v, sourcefile as s WHERE v.idSourceFile = s.idSourceFile and v.ruleName = '"+this.ruleName+"'", (err, row) =>{
          defects.push(new DefectTreeItem(row.message, row.scol, row.line, row.path, row.ruleName));
        },(err,n) =>{
          resolve(defects);
        });
        db.close();        
      });
    });        
  };
}