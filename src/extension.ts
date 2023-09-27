import * as vscode from 'vscode';

let decorationMappings: Map<vscode.TextEditorDecorationType, vscode.Range[]> = new Map();
let colorsHidden: boolean = false;

export function activate(context: vscode.ExtensionContext) {

    let showColorPicker = vscode.commands.registerCommand('extension.changeBackgroundColor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const colors = ['black', 'gray', 'darkgray', 'navy', 'slategray'];
        const selectedColor = await vscode.window.showQuickPick(colors, {
            placeHolder: 'Select a color'
        });

        if (selectedColor) {
            const decoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: selectedColor
            });
            editor.setDecorations(decoration, [editor.selection]);
            decorationMappings.set(decoration, [editor.selection]);
        }
    });

    let removeBackgroundColor = vscode.commands.registerCommand('extension.removeBackgroundColor', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;

        decorationMappings.forEach((ranges, decoration) => {
            for (const range of ranges) {
                if (range.intersection(selection)) {
                    decoration.dispose();
                    decorationMappings.delete(decoration);
                    break;
                }
            }
        });
    });

    let toggleColorsVisibility = vscode.commands.registerCommand('extension.toggleColorsVisibility', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        colorsHidden = !colorsHidden;

        decorationMappings.forEach((ranges, decoration) => {
            if (colorsHidden) {
                editor.setDecorations(decoration, []);
            } else {
                editor.setDecorations(decoration, ranges);
            }
        });
    });

    context.subscriptions.push(showColorPicker, removeBackgroundColor, toggleColorsVisibility);
}

