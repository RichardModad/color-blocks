import * as vscode from 'vscode';

let decorationMappings: Map<vscode.TextEditorDecorationType, vscode.Range[]> = new Map();
let fileDecorationMappings: Map<string, { color: string, ranges: vscode.Range[] }> = new Map();
let colorsHidden: boolean = false;
    
export function activate(context: vscode.ExtensionContext) {

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const filePath = editor.document.uri.fsPath;
            const savedDecorations = fileDecorationMappings.get(filePath);
            if (savedDecorations) {
                // Dispose old decorations
                decorationMappings.forEach((_, decoration) => decoration.dispose());
                decorationMappings.clear();

                // Apply the saved decorations
                const decoration = vscode.window.createTextEditorDecorationType({
                    backgroundColor: savedDecorations.color
                });
                editor.setDecorations(decoration, savedDecorations.ranges);
                decorationMappings.set(decoration, savedDecorations.ranges);
            }
        }
    });

    let showColorPicker = vscode.commands.registerCommand('extension.changeBackgroundColor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const colors = ['black', 'gray', 'darkgray', 'navy', 'slategray', 'darkgreen', 'darkred', 'darkblue', 'darkmagenta', 'darkcyan', 'darkslategray', 'darkorange'];
        const selectedColor = await vscode.window.showQuickPick(colors, {
            placeHolder: 'Select a color'
        });

        let fileDecorationMappings: Map<string, {color: string, ranges: vscode.Range[]}> = new Map();

        // Modify the 'showColorPicker' command to also store the selected color in the new map
        if (selectedColor) {
            const decoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: selectedColor
            });
            editor.setDecorations(decoration, [editor.selection]);
            decorationMappings.set(decoration, [editor.selection]);
            fileDecorationMappings.set(editor.document.uri.fsPath, { color: selectedColor, ranges: [editor.selection] });
        }

        // Use the 'onDidChangeActiveTextEditor' event to restore decorations
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                const filePath = editor.document.uri.fsPath;
                const savedDecorations = fileDecorationMappings.get(filePath);
                if (savedDecorations) {
                    const decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: savedDecorations.color
                    });
                    editor.setDecorations(decoration, savedDecorations.ranges);
                    decorationMappings.set(decoration, savedDecorations.ranges);
                }
            }
        });
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

