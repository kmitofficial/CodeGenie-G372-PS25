def format_prompt(prompt, file_content, cursor_line, language_id):
    return f"""You are a code completion assistant for the language: {language_id}.
Based on the following code context and the user's request, generate the appropriate code.
Only respond with the code - no explanations, comments, or markdown formatting.

CODE CONTEXT:
{language_id}
{file_content}

The cursor is at line {cursor_line + 1}.
User request: {prompt}

Respond only with the code to insert:
"""

def format_conversion_prompt(code, source_language, target_language):
    return f"""You are a code conversion assistant.
Convert the following {source_language} code to {target_language}.
Only respond with the converted code - no explanations, comments, or markdown formatting.

SOURCE CODE ({source_language}):
{code}

CONVERTED CODE ({target_language}):
"""

def format_bug_detection_prompt(code, language_id):
    return f"""You are a code analysis assistant specializing in identifying bugs, vulnerabilities, and edge cases.
Analyze the following {language_id} code for potential issues.

Your response MUST follow this exact JSON format:
{{
  "issues": [
    {{
      "type": "bug|edge_case|vulnerability|performance|logic",
      "line": line_number,
      "description": "Brief description of the issue",
      "fix": "Complete line or block of code that fixes the issue"
    }}
  ],
  "summary": "Brief clear summary of all found issues, including their types and line numbers"
}}

If no issues are found, return an empty issues array but still provide a summary.

CODE TO ANALYZE ({language_id}):
{code}

JSON RESPONSE:
"""

def format_optimization_prompt(code, language_id):
    return f"""You are a code optimization assistant specializing in improving code performance, readability, and efficiency.
Analyze the following {language_id} code and suggest optimizations.

Your response MUST follow this exact JSON format:
{{
  "optimizations": [
    {{
      "type": "performance|readability|memory|complexity|structure",
      "line": line_number,
      "description": "Brief description of the optimization",
      "original": "The original code line or block",
      "optimized": "The optimized code"
    }}
  ],
  "summary": "Brief summary of all optimizations and their expected benefits"
}}

CODE TO OPTIMIZE ({language_id}):
{code}

JSON RESPONSE:
"""

def format_project_analysis_prompt(project_files):
    return f"""You are a project analysis assistant specializing in code review, architecture analysis, and documentation.
Analyze the following project files and provide a comprehensive report.

PROJECT FILES:
{project_files}

Your response MUST follow this exact JSON format:
{{
  "project_summary": {{
    "title": "Brief descriptive title for the project",
    "description": "Detailed description of what the project does, its purpose, and its main features",
    "technology_stack": ["List of technologies, languages, and frameworks used in the project"],
    "architecture": "Analysis of the project's architecture, including how components interact"
  }},
  "issues": [
    {{
      "file": "path/to/file",
      "type": "bug|vulnerability|architecture|performance|logic",
      "description": "Detailed description of the issue",
      "severity": "high|medium|low",
      "fix": "Suggested fix or approach to resolve the issue"
    }}
  ],
  "readme": {{
    "title": "Project Title",
    "description": "Brief project description",
    "installation": "Steps to install and set up the project",
    "usage": "Instructions on how to use the project",
    "workflow": "Detailed workflow of how the project operates",
    "components": [
      {{
        "name": "Component Name",
        "description": "Description of what this component does",
        "files": ["List of files that make up this component"]
      }}
    ]
  }},
  "summary": "Overall assessment of the project, including strengths, weaknesses, and recommendations for improvement"
}}

JSON RESPONSE:
"""
























