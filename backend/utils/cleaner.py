import re
import json
import logging

logger = logging.getLogger(__name__)

def clean_response(response, language_id):
    code_pattern = re.compile(r"```(?:\w+)?\s*\n([\s\S]+?)\n```")
    match = code_pattern.search(response)
    if match:
        response = match.group(1)

    lines = response.split('\n')
    cleaned_lines = []
    comment_pattern = {
        'python': r'^\s*#',
        'javascript': r'^\s*//',
        'c': r'^\s*//',
        'cpp': r'^\s*//',
        'java': r'^\s*//',
    }.get(language_id.lower(), r'^\s*#')

    for line in lines:
        if not re.match(comment_pattern, line) and not re.match(r"^(Here's|This is|The code|Note:)", line):
            cleaned_lines.append(line)

    return '\n'.join(cleaned_lines).strip()

def extract_json_from_response(text):
    try:
        json_pattern = re.compile(r'({[\s\S]*})')
        match = json_pattern.search(text)
        if match:
            return json.loads(match.group(1))
    except Exception as e:
        logger.error(f"JSON extraction failed: {str(e)}")
    return None
<<<<<<< HEAD




















=======
>>>>>>> origin/main
