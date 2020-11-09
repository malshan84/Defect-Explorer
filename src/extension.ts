// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StaticDefectsProvider, DefectExplorer } from './DefectTreeDataProvider';
import { FileExplorer } from './FileTree';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "static-defect-list" is now active!'
  );

  // const staticDefectTreeViewProvider: StaticDefectsProvider = new StaticDefectsProvider();
  // let disposable1 = vscode.window.registerTreeDataProvider(
  //   'static-defect-list', staticDefectTreeViewProvider
  // );

  // let disposable2 = vscode.commands.registerCommand(
  //   'static-defect-list.refreshEntry', () => staticDefectTreeViewProvider.refresh()
  // );

  new FileExplorer(context);
  new DefectExplorer();


  // context.subscriptions.push(disposable1);
  // context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
