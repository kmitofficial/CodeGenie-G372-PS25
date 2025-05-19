import { Webview, Uri } from "vscode";

export function getLoginPageContent(webview: Webview, extensionUri: Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGenie Login</title>
    <style>
        :root {
            --border-radius: 6px;
            --animation-duration: 0.2s;
            --bg-color: #1e1e1e;
            --card-bg: #252526;
            --text-color: #e1e1e1;
            --input-bg: #333333;
            --input-border: #3c3c3c;
            --button-bg: #0e639c;
            --button-hover: #1177bb;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        
        .login-container {
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            padding: 2rem;
            width: 320px;
        }
        
        .logo-container {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .logo-icon {
            margin-right: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background-color: var(--button-bg);
            border-radius: 50%;
            color: #ffffff;
            font-weight: bold;
            font-size: 18px;
        }
        
        .form-group {
            margin-bottom: 1.2rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--input-border);
            background-color: var(--input-bg);
            color: var(--text-color);
            font-size: 0.9rem;
            box-sizing: border-box;
            transition: border-color var(--animation-duration) ease;
        }
        
        input:focus {
            outline: none;
            border-color: var(--button-bg);
        }
        
        .login-button {
            width: 100%;
            padding: 0.8rem;
            background-color: var(--button-bg);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color var(--animation-duration) ease, transform var(--animation-duration) ease;
        }
        
        .login-button:hover {
            background-color: var(--button-hover);
            transform: translateY(-1px);
        }
        
        .forgot-password {
            margin-top: 1rem;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .forgot-password a {
            color: #75bfff;
            text-decoration: none;
        }
        
        .forgot-password a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo-container">
            <div class="logo">
                <span class="logo-icon">✨</span>
                CodeGenie
            </div>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-button">Login</button>
        </form>
        
        <div class="forgot-password">
            <a href="#">Forgot password?</a>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                vscode.postMessage({
                    command: 'login',
                    username: username,
                    password: password
                });
            }
        });
    </script>
</body>
</html>`;
}