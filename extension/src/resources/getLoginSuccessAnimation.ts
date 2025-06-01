export function getLoginSuccessAnimation(title: string, username: string): string {
    // return `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>${title}</title>
    //         <style>
    //             :root {
    //                 color-scheme: light dark;
    //             }
    //             html, body {
    //                 height: 100%;
    //                 margin: 0;
    //                 padding: 0;
    //                 font-family: var(--vscode-font-family, sans-serif);
    //                 background-color: var(--vscode-editor-background, #1e1e1e);
    //                 color: var(--vscode-editor-foreground, #cccccc);
    //                 display: flex;
    //                 align-items: center;
    //                 justify-content: center;
    //             }
    //             .container {
    //                 display: flex;
    //                 flex-direction: column;
    //                 align-items: center;
    //                 justify-content: center;
    //                 text-align: center;
    //                 padding: 1rem;
    //             }
    //             .success-circle {
    //                 width: 80px;
    //                 height: 80px;
    //                 background-color: #4CAF50;
    //                 border-radius: 50%;
    //                 display: flex;
    //                 align-items: center;
    //                 justify-content: center;
    //                 margin-bottom: 20px;
    //                 position: relative;
    //                 animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    //                 transform-origin: center;
    //                 transform: scale(0);
    //             }
    //             .checkmark {
    //                 stroke-dasharray: 180;
    //                 stroke-dashoffset: 180;
    //                 transform: translateY(3px);
    //                 animation: draw 0.6s 0.2s forwards ease-in-out;
    //                 stroke-linecap: round;
    //                 stroke-linejoin: round;
    //             }
    //             @keyframes popIn {
    //                 0% { transform: scale(0); }
    //                 70% { transform: scale(1.1); }
    //                 100% { transform: scale(1); }
    //             }
    //             @keyframes draw {
    //                 to { stroke-dashoffset: 0; }
    //             }
    //             .success-card {
    //                 background-color: var(--vscode-editor-background, #252526);
    //                 border: 1px solid #383838;
    //                 color: var(--vscode-editor-foreground, #cccccc);
    //                 padding: 1.5rem 2rem;
    //                 border-radius: 8px;
    //                 max-width: 90%;
    //                 width: 100%;
    //                 max-width: 400px;
    //                 box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    //                 animation: fadeIn 0.3s ease-in-out;
    //                 position: relative;
    //                 overflow: hidden;
    //             }
    //             .success-card::before {
    //                 content: '';
    //                 position: absolute;
    //                 top: 0;
    //                 left: 0;
    //                 width: 100%;
    //                 height: 100%;
    //                 pointer-events: none;
    //                 background: linear-gradient(90deg, transparent, transparent, transparent, #4CAF50, transparent, transparent, transparent);
    //                 background-size: 200% 100%;
    //                 clip-path: polygon(
    //                     0 0,
    //                     100% 0,
    //                     100% 100%,
    //                     0 100%
    //                 );
    //                 animation: borderHighlight 1.5s linear forwards;
    //             }
    //             @keyframes borderHighlight {
    //                 0% {
    //                     background-position: 100% 0;
    //                     clip-path: polygon(
    //                         0 0,
    //                         0 0,
    //                         0 0,
    //                         0 0
    //                     );
    //                 }
    //                 25% {
    //                     clip-path: polygon(
    //                         0 0,
    //                         100% 0,
    //                         100% 0,
    //                         0 0
    //                     );
    //                 }
    //                 50% {
    //                     clip-path: polygon(
    //                         0 0,
    //                         100% 0,
    //                         100% 100%,
    //                         0 0
    //                     );
    //                 }
    //                 75% {
    //                     clip-path: polygon(
    //                         0 0,
    //                         100% 0,
    //                         100% 100%,
    //                         0 100%
    //                     );
    //                 }
    //                 100% {
    //                     background-position: 0% 0;
    //                     clip-path: polygon(
    //                         0 0,
    //                         0 0,
    //                         0 0,
    //                         0 0
    //                     );
    //                 }
    //             }
    //             .success-card h2 {
    //                 margin-top: 0;
    //                 margin-bottom: 0.5rem;
    //                 font-size: 1.5rem;
    //                 color: #4CAF50;
    //             }
    //             .success-card p {
    //                 margin: 0;
    //                 font-size: 1.1rem;
    //                 line-height: 1.5;
    //             }
    //             @keyframes fadeIn {
    //                 from { opacity: 0; transform: translateY(10px); }
    //                 to { opacity: 1; transform: translateY(0); }
    //             }
    //         </style>
    //     </head>
    //     <body>
    //         <div class="container">
    //             <div class="success-circle">
    //                 <svg width="48" height="48" viewBox="0 0 48 48">
    //                     <path class="checkmark" fill="none" stroke="#FFFFFF" stroke-width="6" d="M12,24 L20,34 L36,16" />
    //                 </svg>
    //             </div>
    //             <div class="success-card">
    //                 <div class="border-line"></div>
    //                 <h2>Login Successful</h2>
    //                 <p>Logged in as: <strong>${username}</strong></p>
    //             </div>
    //         </div>
    //     </body>
    //     </html>
    // `;
















    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root {
            /* Define color scheme for light and dark modes */
            color-scheme: light dark;
        }
        html, body {
            height: 100%; /* Ensure html and body take full height */
            margin: 0; /* Remove default margin */
            padding: 0; /* Remove default padding */
            font-family: var(--vscode-font-family, Arial, sans-serif); /* Use VSCode font or fallback */
            background-color: var(--vscode-editor-background, #1e1e1e); /* VSCode editor background or fallback */
            color: var(--vscode-editor-foreground, #cccccc); /* VSCode editor foreground or fallback */
            display: flex; /* Enable flexbox for centering */
            align-items: center; /* Vertically center content */
            justify-content: center; /* Horizontally center content */
        }
        .container {
            display: flex; /* Enable flexbox for child elements */
            flex-direction: column; /* Stack children vertically */
            align-items: center; /* Horizontally center children */
            justify-content: center; /* Vertically center children (if container has fixed height) */
            text-align: center; /* Center text within children */
            padding: 1rem; /* Add some padding around the container */
        }
        .success-circle {
            width: 100px; /* Increased size of the circle */
            height: 100px; /* Increased size of the circle */
            background-color: #4CAF50; /* Green background for success */
            border-radius: 50%; /* Make it a perfect circle */
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 25px; /* Increased space between circle and card */
            position: relative;
            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Pop-in animation */
            transform-origin: center; /* Animation origin */
            transform: scale(0); /* Initial state for animation (scaled down) */
        }
        .checkmark {
            stroke-dasharray: 220; /* Adjusted for potentially larger path */
            stroke-dashoffset: 220; /* Initial state for drawing animation */
            transform: translateY(4px); /* Fine-tune vertical position */
            animation: draw 0.7s 0.2s forwards ease-in-out; /* Drawing animation with slight delay */
            stroke-linecap: round; /* Rounded line caps */
            stroke-linejoin: round; /* Rounded line joins */
        }
        @keyframes popIn {
            0% { transform: scale(0); } /* Start scaled down */
            70% { transform: scale(1.1); } /* Overshoot slightly */
            100% { transform: scale(1); } /* Settle at normal size */
        }
        @keyframes draw {
            to { stroke-dashoffset: 0; } /* Animate to fully drawn */
        }
        .success-card {
            background-color: var(--vscode-editor-background, #252526); /* Card background */
            border: 2px solid #4CAF50; /* Added solid green border */
            color: var(--vscode-editor-foreground, #cccccc); /* Card text color */
            padding: 2.5rem 3rem; /* Increased padding for more space */
            border-radius: 12px; /* Slightly more rounded corners */
            max-width: 90%; /* Max width relative to parent */
            width: 100%; /* Try to use full available width up to max-width */
            max-width: 480px; /* Increased max-width for a larger card */
            box-shadow: 0 6px 18px rgba(0,0,0,0.25); /* Enhanced box shadow */
            animation: fadeIn 0.4s 0.1s ease-in-out forwards; /* Fade-in animation, slight delay, and 'forwards' to keep final state */
            opacity: 0; /* Start transparent for fadeIn animation */
            position: relative;
            overflow: hidden; /* Ensure content stays within rounded borders */
        }

        .success-card h2 {
            margin-top: 0;
            margin-bottom: 1rem; /* Increased space below heading */
            font-size: 1.8rem; /* Increased font size for heading */
            color: #4CAF50; /* Green color for heading */
        }
        .success-card p {
            margin: 0;
            font-size: 1.2rem; /* Increased font size for paragraph */
            line-height: 1.6; /* Increased line height for readability */
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); } /* Start transparent and slightly down */
            to { opacity: 1; transform: translateY(0); } /* Fade in and move to original position */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-circle">
            <svg width="60" height="60" viewBox="0 0 48 48">
                <path class="checkmark" fill="none" stroke="#FFFFFF" stroke-width="8" d="M10,24 L20,34 L38,14" />
            </svg>
        </div>
        <div class="success-card">
            <h2>Login Successful</h2>
<<<<<<< HEAD
            <p>Logged in as: <strong>kmit</strong></p>
=======
            <p>Logged in as: <strong>${username}</strong></p>
>>>>>>> origin/main
        </div>
    </div>
    <script>
        // This script is just to demonstrate how the title and username would be injected.
        // In a real scenario, these would be passed to the function that generates this HTML.
        // For example, if this HTML is generated by a JavaScript function:
        // function getLoginSuccessAnimation(title, username) { /* ... template string ... */ }
        // const dynamicTitle = "Authentication Complete";
        // const dynamicUsername = "exampleUser";
        // document.title = dynamicTitle; // This would be done by the template literal directly.
        // You'd replace ${title} and ${username} when calling the function.

        // Example of how you might dynamically set title if not using a template engine that does it server-side/build-time
        // This is not strictly necessary if the ${title} in the <title> tag is correctly replaced
        // when the HTML string is generated.
        // For the purpose of this snippet, we'll assume ${title} is replaced by the calling function.
    </script>
</body>
</html>
`;
}































