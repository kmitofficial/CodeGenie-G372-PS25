// media/main.js
(function () {
    // Acquire the VS Code API object. This is how the webview communicates with the extension.
    const vscode = acquireVsCodeApi();

    // Get all elements with the class 'card'. These are our clickable command items.
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // Add a click event listener to each card.
        card.addEventListener('click', () => {
            const command = card.getAttribute('data-command');
            if (command) {
                // Send a message to the extension with the command to execute.
                vscode.postMessage({
                    command: command
                });
            }
        });

        // Add keyboard accessibility: allow triggering the card with Enter or Space.
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                // Prevent default space bar scroll
                event.preventDefault();
                const command = card.getAttribute('data-command');
                if (command) {
                    vscode.postMessage({
                        command: command
                    });
                }
            }
        });
    });

    // Optional: Restore any saved state if you were using it.
    // const oldState = vscode.getState();
    // if (oldState) {
    //     // Do something with oldState
    // }

}());
