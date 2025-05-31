// tailwind.config.js
export const content = [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/webview/**/*.{js,jsx,ts,tsx}'
];
export const darkMode = 'class';
export const theme = {
    extend: {
        colors: {
            'vscode-bg': '#1e1e1e',
            'card-bg': '#252526',
            'input-bg': '#333333',
            'input-border': '#3c3c3c',
            'primary': '#3a6ea7',
            'primary-hover': '#4e82bb',
        },
        boxShadow: {
            'card': '0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)',
        },
        backgroundImage: {
            'matte-texture': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.03), transparent), radial-gradient(ellipse at top left, rgba(60, 60, 80, 0.2), transparent 70%), radial-gradient(ellipse at bottom right, rgba(60, 80, 100, 0.2), transparent 70%)'
        }
    },
};
export const plugins = [];