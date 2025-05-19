import * as vscode from "vscode";
import { CodeSnippet } from "../snippetManager";

// Get the HTML content for the snippet library webview
export function getSnippetLibraryContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    snippets: CodeSnippet[]
): string {
    // Get the local path for specific resources
    const toolkitUri = getUri(webview, extensionUri, [
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js",
    ]);
    const stylesUri = getUri(webview, extensionUri, ["media", "styles.css"]);
    const codiconsUri = getUri(webview, extensionUri, [
        "node_modules",
        "@vscode",
        "codicons",
        "dist",
        "codicon.css",
    ]);

    // Generate the HTML for all snippets
    const snippetsHtml = snippets.length > 0
        ? snippets
            .sort((a, b) => b.usage - a.usage) // Sort by usage count
            .map(snippet => createSnippetCard(snippet))
            .join("")
        : `<div class="empty-state">
            <vscode-button appearance="primary" id="create-snippet-btn">Create New Snippet</vscode-button>
            <p>No snippets found. Create a new snippet to get started!</p>
          </div>`;

    // Generate all unique tags for filtering
    const allTags = [...new Set(snippets.flatMap(s => s.tags))].sort();
    
    // Generate all unique languages for filtering
    const allLanguages = [...new Set(snippets.map(s => s.language))].sort();

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <link rel="stylesheet" href="${codiconsUri}">
        <title>CodeGenie Snippet Library</title>
        <style>
            body {
                padding: 20px;
                color: var(--vscode-foreground);
                font-family: var(--vscode-font-family);
                background-color: var(--vscode-editor-background);
            }
            .controls {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 10px;
            }
            .search-container {
                display: flex;
                gap: 10px;
                flex: 1;
                max-width: 500px;
            }
            .filter-container {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .snippets-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            .snippet-card {
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                position: relative;
            }
            .snippet-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                align-items: flex-start;
            }
            .snippet-title {
                font-size: 16px;
                font-weight: bold;
                margin: 0;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .snippet-actions {
                display: flex;
                gap: 5px;
            }
            .snippet-meta {
                margin-bottom: 10px;
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
            }
            .snippet-description {
                margin-bottom: 10px;
                font-size: 14px;
            }
            .snippet-preview {
                background-color: var(--vscode-editor-background);
                border-radius: 3px;
                padding: 10px;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                max-height: 200px;
                overflow-y: auto;
                margin-bottom: 10px;
                position: relative;
            }
            .snippet-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            .tag {
                background-color: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                cursor: pointer;
            }
            .usage-badge {
                display: flex;
                align-items: center;
                gap: 3px;
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
            }
            .empty-state {
                text-align: center;
                padding: 40px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.5);
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background-color: var(--vscode-editor-background);
                padding: 20px;
                border-radius: 5px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            .copy-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .snippet-preview:hover .copy-badge {
                opacity: 1;
            }
        </style>
    </head>
    <body>
        <div class="controls">
            <div class="search-container">
                <vscode-text-field id="search-field" placeholder="Search snippets...">
                    <span slot="start" class="codicon codicon-search"></span>
                </vscode-text-field>
                <vscode-button appearance="secondary" id="create-btn">
                    <span class="codicon codicon-add"></span>
                    New
                </vscode-button>
            </div>
            <div class="filter-container">
                <vscode-dropdown id="language-filter">
                    <vscode-option value="">All Languages</vscode-option>
                    ${allLanguages.map(lang => `<vscode-option value="${lang}">${lang}</vscode-option>`).join('')}
                </vscode-dropdown>
                <vscode-dropdown id="sort-by">
                    <vscode-option value="usage">Most Used</vscode-option>
                    <vscode-option value="name">A-Z</vscode-option>
                    <vscode-option value="date">Newest</vscode-option>
                </vscode-dropdown>
                <vscode-button appearance="icon" id="refresh-btn" title="Refresh">
                    <span class="codicon codicon-refresh"></span>
                </vscode-button>
            </div>
        </div>

        <vscode-panels>
            <vscode-panel-tab id="all-tab">All Snippets</vscode-panel-tab>
            <vscode-panel-tab id="tags-tab">By Tags</vscode-panel-tab>
            
            <vscode-panel-view id="all-view">
                <div class="snippets-container">
                    ${snippetsHtml}
                </div>
            </vscode-panel-view>
            
            <vscode-panel-view id="tags-view">
                <div style="margin-bottom: 20px">
                    <div class="tag-list">
                        ${allTags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
                    </div>
                </div>
                <div id="tag-filtered-snippets" class="snippets-container">
                    <!-- Will be populated by JavaScript -->
                </div>
            </vscode-panel-view>
        </vscode-panels>

        <!-- Edit/Create Snippet Modal -->
        <div class="modal" id="edit-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Edit Snippet</h2>
                    <vscode-button appearance="icon" id="close-modal">
                        <span class="codicon codicon-close"></span>
                    </vscode-button>
                </div>
                <div class="form-group">
                    <label for="snippet-name">Name</label>
                    <vscode-text-field id="snippet-name" placeholder="Enter snippet name"></vscode-text-field>
                </div>
                <div class="form-group">
                    <label for="snippet-description">Description</label>
                    <vscode-text-area id="snippet-description" placeholder="Enter snippet description" rows="2"></vscode-text-area>
                </div>
                <div class="form-group">
                    <label for="snippet-code">Code</label>
                    <vscode-text-area id="snippet-code" placeholder="Enter code" rows="10"></vscode-text-area>
                </div>
                <div class="form-group">
                    <label for="snippet-language">Language</label>
                    <vscode-dropdown id="snippet-language">
                        ${allLanguages.length ? allLanguages.map(lang => `<vscode-option value="${lang}">${lang}</vscode-option>`).join('') : 
                        `<vscode-option value="javascript">javascript</vscode-option>
                         <vscode-option value="typescript">typescript</vscode-option>
                         <vscode-option value="python">python</vscode-option>
                         <vscode-option value="html">html</vscode-option>
                         <vscode-option value="css">css</vscode-option>`}
                    </vscode-dropdown>
                </div>
                <div class="form-group">
                    <label for="snippet-tags">Tags (comma separated)</label>
                    <vscode-text-field id="snippet-tags" placeholder="Enter tags separated by commas"></vscode-text-field>
                </div>
                <input type="hidden" id="snippet-id">
                <input type="hidden" id="snippet-date-created">
                <input type="hidden" id="snippet-usage">
                <vscode-button appearance="primary" id="save-snippet">Save Snippet</vscode-button>
            </div>
        </div>

        <script>
            (function() {
                // Initialize variables
                const vscode = acquireVsCodeApi();
                let snippets = ${JSON.stringify(snippets)};
                
                // UI Elements
                const searchField = document.getElementById('search-field');
                const languageFilter = document.getElementById('language-filter');
                const sortBy = document.getElementById('sort-by');
                const refreshBtn = document.getElementById('refresh-btn');
                const createBtn = document.getElementById('create-btn');
                const createSnippetBtn = document.getElementById('create-snippet-btn');
                const editModal = document.getElementById('edit-modal');
                const closeModal = document.getElementById('close-modal');
                const saveSnippetBtn = document.getElementById('save-snippet');
                const allTags = document.querySelectorAll('.tag');
                
                // Handle click on tags for filtering
                allTags.forEach(tag => {
                    tag.addEventListener('click', () => {
                        const tagValue = tag.dataset.tag;
                        const filteredSnippets = snippets.filter(s => s.tags.includes(tagValue));
                        renderFilteredSnippets(filteredSnippets);
                        document.getElementById('tags-tab').click();
                    });
                });
                
                // Render snippets filtered by tag
                function renderFilteredSnippets(filteredSnippets) {
                    const container = document.getElementById('tag-filtered-snippets');
                    container.innerHTML = filteredSnippets.length > 0 
                        ? filteredSnippets.map(snippet => createSnippetCardHTML(snippet)).join('')
                        : '<div class="empty-state"><p>No snippets found with the selected tag.</p></div>';
                    
                    // Add event listeners to newly rendered snippets
                    addSnippetEventListeners();
                }
                
                // Filter and sort snippets
                function filterAndSortSnippets() {
                    const searchTerm = searchField.value.toLowerCase();
                    const languageValue = languageFilter.value;
                    const sortValue = sortBy.value;
                    
                    // Filter
                    let filtered = snippets;
                    if (searchTerm) {
                        filtered = filtered.filter(s => 
                            s.name.toLowerCase().includes(searchTerm) ||
                            s.description.toLowerCase().includes(searchTerm) ||
                            s.code.toLowerCase().includes(searchTerm) ||
                            s.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                        );
                    }
                    
                    if (languageValue) {
                        filtered = filtered.filter(s => s.language === languageValue);
                    }
                    
                    // Sort
                    switch (sortValue) {
                        case 'usage':
                            filtered.sort((a, b) => b.usage - a.usage);
                            break;
                        case 'name':
                            filtered.sort((a, b) => a.name.localeCompare(b.name));
                            break;
                        case 'date':
                            filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
                            break;
                    }
                    
                    // Render
                    const container = document.querySelector('#all-view .snippets-container');
                    container.innerHTML = filtered.length > 0 
                        ? filtered.map(snippet => createSnippetCardHTML(snippet)).join('')
                        : '<div class="empty-state"><p>No snippets match your filters.</p></div>';
                    
                    // Add event listeners to newly rendered snippets
                    addSnippetEventListeners();
                }
                
                // Add event listeners
                searchField.addEventListener('input', filterAndSortSnippets);
                languageFilter.addEventListener('change', filterAndSortSnippets);
                sortBy.addEventListener('change', filterAndSortSnippets);
                
                refreshBtn.addEventListener('click', () => {
                    vscode.postMessage({ command: 'refresh' });
                });
                
                if (createSnippetBtn) {
                    createSnippetBtn.addEventListener('click', openCreateModal);
                }
                
                createBtn.addEventListener('click', openCreateModal);
                
                closeModal.addEventListener('click', () => {
                    editModal.style.display = 'none';
                });
                
                saveSnippetBtn.addEventListener('click', saveSnippet);
                
                // Handle snippet actions
                function addSnippetEventListeners() {
                    // Insert snippet buttons
                    document.querySelectorAll('.insert-snippet').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const snippetId = e.target.closest('.snippet-card').dataset.id;
                            const snippet = snippets.find(s => s.id === snippetId);
                            vscode.postMessage({ 
                                command: 'insert',
                                id: snippet.id,
                                code: snippet.code
                            });
                        });
                    });
                    
                    // Edit snippet buttons
                    document.querySelectorAll('.edit-snippet').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const snippetId = e.target.closest('.snippet-card').dataset.id;
                            openEditModal(snippetId);
                        });
                    });
                    
                    // Delete snippet buttons
                    document.querySelectorAll('.delete-snippet').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const snippetId = e.target.closest('.snippet-card').dataset.id;
                            const snippetName = snippets.find(s => s.id === snippetId).name;
                            
                            if (confirm(\`Are you sure you want to delete "\${snippetName}"?\`)) {
                                vscode.postMessage({ 
                                    command: 'delete',
                                    id: snippetId
                                });
                            }
                        });
                    });
                    
                    // Copy code buttons
                    document.querySelectorAll('.snippet-preview').forEach(preview => {
                        preview.addEventListener('click', (e) => {
                            const snippetId = e.target.closest('.snippet-card').dataset.id;
                            const snippet = snippets.find(s => s.id === snippetId);
                            
                            // Copy to clipboard
                            navigator.clipboard.writeText(snippet.code);
                            
                            // Show copied message
                            const copyBadge = e.target.closest('.snippet-preview').querySelector('.copy-badge');
                            copyBadge.textContent = 'Copied!';
                            copyBadge.style.opacity = '1';
                            
                            setTimeout(() => {
                                copyBadge.textContent = 'Click to copy';
                                copyBadge.style.opacity = '0';
                            }, 1500);
                        });
                    });
                    
                    // Tag clicks for filtering
                    document.querySelectorAll('.tag').forEach(tag => {
                        tag.addEventListener('click', (e) => {
                            const tagValue = e.target.textContent;
                            const filteredSnippets = snippets.filter(s => s.tags.includes(tagValue));
                            renderFilteredSnippets(filteredSnippets);
                            document.getElementById('tags-tab').click();
                        });
                    });
                }
                
                // Open modal to create a new snippet
                function openCreateModal() {
                    // Reset form fields
                    document.getElementById('modal-title').textContent = 'Create New Snippet';
                    document.getElementById('snippet-name').value = '';
                    document.getElementById('snippet-description').value = '';
                    document.getElementById('snippet-code').value = '';
                    document.getElementById('snippet-language').value = '';
                    document.getElementById('snippet-tags').value = '';
                    document.getElementById('snippet-id').value = '';
                    document.getElementById('snippet-date-created').value = '';
                    document.getElementById('snippet-usage').value = '0';
                    
                    // Show modal
                    editModal.style.display = 'flex';
                }
                
                // Open modal to edit an existing snippet
                function openEditModal(snippetId) {
                    const snippet = snippets.find(s => s.id === snippetId);
                    
                    // Fill form fields
                    document.getElementById('modal-title').textContent = 'Edit Snippet';
                    document.getElementById('snippet-name').value = snippet.name;
                    document.getElementById('snippet-description').value = snippet.description;
                    document.getElementById('snippet-code').value = snippet.code;
                    document.getElementById('snippet-language').value = snippet.language;
                    document.getElementById('snippet-tags').value = snippet.tags.join(', ');
                    document.getElementById('snippet-id').value = snippet.id;
                    document.getElementById('snippet-date-created').value = snippet.dateCreated;
                    document.getElementById('snippet-usage').value = snippet.usage;
                    
                    // Show modal
                    editModal.style.display = 'flex';
                }
                
                // Save snippet (create or update)
                function saveSnippet() {
                    const id = document.getElementById('snippet-id').value;
                    const name = document.getElementById('snippet-name').value;
                    const description = document.getElementById('snippet-description').value;
                    const code = document.getElementById('snippet-code').value;
                    const language = document.getElementById('snippet-language').value;
                    const tags = document.getElementById('snippet-tags').value;
                    const dateCreated = document.getElementById('snippet-date-created').value || new Date().toISOString();
                    const usage = document.getElementById('snippet-usage').value;
                    
                    if (!name) {
                        alert('Please enter a name for the snippet');
                        return;
                    }
                    
                    if (!code) {
                        alert('Please enter code for the snippet');
                        return;
                    }
                    
                    // Create message object
                    const message = {
                        command: 'edit',
                        id: id || Date.now().toString(),
                        name,
                        description,
                        code,
                        language,
                        tags,
                        dateCreated,
                        usage
                    };
                    
                    // Send to extension
                    vscode.postMessage(message);
                    
                    // Close modal
                    editModal.style.display = 'none';
                }
                
                // Initialize
                addSnippetEventListeners();
            })();
            
            // Helper function to create snippet card HTML
            function createSnippetCardHTML(snippet) {
                return \`
                <div class="snippet-card" data-id="\${snippet.id}">
                    <div class="snippet-header">
                        <h3 class="snippet-title">\${snippet.name}</h3>
                        <div class="snippet-actions">
                            <vscode-button appearance="icon" class="insert-snippet" title="Insert Snippet">
                                <span class="codicon codicon-insert"></span>
                            </vscode-button>
                            <vscode-button appearance="icon" class="edit-snippet" title="Edit Snippet">
                                <span class="codicon codicon-edit"></span>
                            </vscode-button>
                            <vscode-button appearance="icon" class="delete-snippet" title="Delete Snippet">
                                <span class="codicon codicon-trash"></span>
                            </vscode-button>
                        </div>
                    </div>
                    <div class="snippet-meta">
                        <span>\${snippet.language}</span> • 
                        <span>\${new Date(snippet.dateCreated).toLocaleDateString()}</span>
                    </div>
                    <p class="snippet-description">\${snippet.description || 'No description provided'}</p>
                    <div class="snippet-preview">
                        <span class="copy-badge">Click to copy</span>
                        <pre><code>\${escapeHtml(truncate(snippet.code, 300))}</code></pre>
                    </div>
                    <div class="snippet-footer">
                        <div class="tag-list">
                            \${snippet.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
                        </div>
                        <div class="usage-badge">
                            <span class="codicon codicon-history"></span>
                            <span>\${snippet.usage} uses</span>
                        </div>
                    </div>
                </div>
                \`;
            }
            
            // Helper function to escape HTML characters
            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            
            // Helper function to truncate text with ellipsis
            function truncate(text, maxLength) {
                return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
            }
        </script>
    </body>
    </html>
    `;
}

// Helper function to create a snippet card
function createSnippetCard(snippet: CodeSnippet): string {
    return `
    <div class="snippet-card" data-id="${snippet.id}">
        <div class="snippet-header">
            <h3 class="snippet-title">${snippet.name}</h3>
            <div class="snippet-actions">
                <vscode-button appearance="icon" class="insert-snippet" title="Insert Snippet">
                    <span class="codicon codicon-insert"></span>
                </vscode-button>
                <vscode-button appearance="icon" class="edit-snippet" title="Edit Snippet">
                    <span class="codicon codicon-edit"></span>
                </vscode-button>
                <vscode-button appearance="icon" class="delete-snippet" title="Delete Snippet">
                    <span class="codicon codicon-trash"></span>
                </vscode-button>
            </div>
        </div>
        <div class="snippet-meta">
            <span>${snippet.language}</span> • 
            <span>${new Date(snippet.dateCreated).toLocaleDateString()}</span>
        </div>
        <p class="snippet-description">${snippet.description || 'No description provided'}</p>
        <div class="snippet-preview">
            <span class="copy-badge">Click to copy</span>
            <pre><code>${escapeHtml(truncate(snippet.code, 300))}</code></pre>
        </div>
        <div class="snippet-footer">
            <div class="tag-list">
                ${snippet.tags.map((tag: any) => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="usage-badge">
                <span class="codicon codicon-history"></span>
                <span>${snippet.usage} uses</span>
            </div>
        </div>
    </div>
    `;
}

// Helper function to get webview URIs
function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]): string {
    return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList)).toString();
}

// Helper function to escape HTML for display
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper function to truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}