# from flask import Flask, request, jsonify
# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import logging
# import traceback
# import os

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler("codegenie_server.log"),
#         logging.StreamHandler()
#     ]
# )
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # Initialize the model and tokenizer
# MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"
# MAX_LENGTH = 2048
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# logger.info(f"Using device: {DEVICE}")
# logger.info(f"Loading model: {MODEL_NAME}")

# try:
#     tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
#     model = AutoModelForCausalLM.from_pretrained(
#         MODEL_NAME, 
#         torch_dtype=torch.bfloat16 if DEVICE == "cuda" else torch.float32
#     ).to(DEVICE)
#     logger.info("Model and tokenizer loaded successfully")
# except Exception as e:
#     logger.error(f"Error loading model: {str(e)}")
#     logger.error(traceback.format_exc())
#     raise

# def format_prompt(user_prompt, file_content, cursor_line, language):
#     """Format the prompt for the model to better understand the context and requirement."""
    
#     # Extract context around the cursor
#     file_lines = file_content.split('\n')
    
#     # Get 10 lines before and after the cursor for context
#     start_line = max(0, cursor_line - 10)
#     end_line = min(len(file_lines), cursor_line + 10)
#     context_lines = file_lines[start_line:end_line]
#     context = '\n'.join(context_lines)
    
#     language_name = language
#     # Map VS Code language IDs to more readable names
#     language_map = {
#         "javascript": "JavaScript",
#         "typescript": "TypeScript",
#         "python": "Python",
#         "java": "Java",
#         "csharp": "C#",
#         "cpp": "C++",
#         "go": "Go",
#         "ruby": "Ruby",
#         "php": "PHP",
#         "rust": "Rust",
#         "html": "HTML",
#         "css": "CSS",
#     }
    
#     if language in language_map:
#         language_name = language_map[language]
    
#     # Format the prompt in the style Deepseek-Coder expects
#     formatted_prompt = f"""<|im_start|>user
# I'm working on some code in {language_name}. Here's the surrounding context:

# ```{language}
# {context}
# ```

# At line {cursor_line + 1}, I have this comment/instruction:
# "{user_prompt}"

# Please generate the code that should follow this comment. The code should be well-structured, efficient, and follow best practices for {language_name}.
# <|im_end|>
# <|im_start|>assistant
# """
    
#     logger.debug(f"Formatted prompt: {formatted_prompt}")
#     return formatted_prompt

# def generate_code(prompt):
#     """Generate code using the deepseek-coder model."""
#     try:
#         logger.info("Generating code...")
#         inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
        
#         # Generate with appropriate parameters
#         with torch.no_grad():
#             generated_ids = model.generate(
#                 inputs.input_ids,
#                 max_length=MAX_LENGTH,
#                 do_sample=True,
#                 temperature=0.2,
#                 top_p=0.95,
#                 top_k=50,
#                 pad_token_id=tokenizer.eos_token_id
#             )
        
#         # Decode the generated tokens
#         generated_text = tokenizer.decode(generated_ids[0], skip_special_tokens=False)
        
#         # Extract only the assistant's response
#         assistant_response = generated_text.split("<|im_start|>assistant")[-1]
        
#         # Clean up the response
#         assistant_response = assistant_response.replace("<|im_end|>", "").strip()
        
#         logger.info("Code generation successful")
#         return assistant_response
#     except Exception as e:
#         logger.error(f"Error generating code: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# @app.route('/generate', methods=['POST'])
# def process_request():
#     """Process requests from the VS Code extension."""
#     try:
#         logger.info("Received request from extension")
#         data = request.json
        
#         if not data:
#             logger.error("No data received in request")
#             return jsonify({"status": "error", "error": "No data provided"}), 400
        
#         # Log the received data for debugging
#         logger.info(f"Received prompt: {data.get('prompt', 'None')}")
#         logger.info(f"Language: {data.get('language_id', 'None')}")
#         logger.info(f"Cursor line: {data.get('cursor_line', 'None')}")
        
#         # Extract required fields
#         prompt = data.get('prompt')
#         file_content = data.get('file_content', '')
#         cursor_line = data.get('cursor_line', 0)
#         language_id = data.get('language_id', 'text')
        
#         # Validate required fields
#         if not prompt:
#             logger.error("No prompt provided")
#             return jsonify({"status": "error", "error": "No prompt provided"}), 400
        
#         # Format the prompt for the model
#         formatted_prompt = format_prompt(prompt, file_content, cursor_line, language_id)
        
#         # Generate code
#         generated_code = generate_code(formatted_prompt)
        
#         # Extract code from the response
#         # Look for code blocks in markdown format if they exist
#         if "```" in generated_code:
#             code_blocks = []
#             lines = generated_code.split('\n')
#             in_code_block = False
#             current_block = []
            
#             for line in lines:
#                 if line.startswith('```'):
#                     if in_code_block:
#                         code_blocks.append('\n'.join(current_block))
#                         current_block = []
#                     in_code_block = not in_code_block
#                     continue
#                 if in_code_block:
#                     current_block.append(line)
            
#             if code_blocks:
#                 refined_code = code_blocks[0]  # Use the first code block
#             else:
#                 refined_code = generated_code
#         else:
#             refined_code = generated_code
        
#         logger.info("Successfully processed request and generated code")
        
#         return jsonify({
#             "status": "success",
#             "response": generated_code,
#             "refined_code": refined_code
#         })
        
#     except Exception as e:
#         error_msg = str(e)
#         logger.error(f"Error processing request: {error_msg}")
#         logger.error(traceback.format_exc())
#         return jsonify({"status": "error", "error": error_msg}), 500

# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 3000))
#     logger.info(f"Starting server on port {port}")
#     app.run(host='0.0.0.0', port=port, debug=True)


























from flask import Flask, request, jsonify # type: ignore
# from flask_cors import CORS
import torch # type: ignore
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import re
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# CORS(app)

# Model configuration
MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"
MAX_LENGTH = 2048
TEMPERATURE = 0.2
TOP_P = 0.95
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

logger.info(f"Using device: {DEVICE}")

# Load model and tokenizer
try:
    logger.info(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        device_map="auto" if DEVICE == "cuda" else None,
        trust_remote_code=True
    )
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    logger.error(traceback.format_exc())
    raise

# Create pipeline for text generation
try:
    generator = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_length=MAX_LENGTH,
        temperature=TEMPERATURE,
        top_p=TOP_P,
        pad_token_id=tokenizer.eos_token_id
        # Model is already on the appropriate device via device_map="auto"
    )
    logger.info("Generation pipeline created successfully")
except Exception as e:
    logger.error(f"Error creating generation pipeline: {str(e)}")
    logger.error(traceback.format_exc())
    raise

def format_prompt(prompt, file_content, cursor_line, language_id):
    """Format the prompt with the file context for the model."""
    
    # Get lines before and after cursor
    file_lines = file_content.split('\n')
    
    # Add context information to the prompt
    context_prompt = f"""You are a code completion assistant for the language: {language_id}.
Based on the following code context and the user's request, generate the appropriate code.
Only respond with the code - no explanations, comments, or markdown formatting.

CODE CONTEXT:
{language_id}
{file_content}


The cursor is at line {cursor_line + 1}.
User request: {prompt}

Respond only with the code to insert:
"""
    
    return context_prompt

def format_conversion_prompt(code, source_language, target_language):
    """Format the prompt for code language conversion."""
    
    context_prompt = f"""You are a code conversion assistant.
Convert the following {source_language} code to {target_language}.
Only respond with the converted code - no explanations, comments, or markdown formatting.

SOURCE CODE ({source_language}):
{code}

CONVERTED CODE ({target_language}):
"""
    
    return context_prompt

def clean_response(response, language_id):
    """Clean the response to remove any explanations or markdown formatting."""
    # Extract only the code part if it's wrapped in code blocks
    code_pattern = re.compile(r"```(?:\w+)?\s*\n([\s\S]+?)\n```")
    match = code_pattern.search(response)
    
    if match:
        response = match.group(1)
    
    # Remove any leading/trailing explanations
    lines = response.split('\n')
    cleaned_lines = []
    in_code_section = False
    
    for line in lines:
        # Skip lines that look like explanations or instructions
        if re.match(r"^(Here's|This is|I'll|Note:|Let me|The code|As requested|This code)", line):
            continue
        
        # Check if this is a comment line based on language
        comment_starters = {
            'python': r'^\s*#',
            'javascript': r'^\s*(/\*|\*/|//)',
            'typescript': r'^\s*(/\*|\*/|//)',
            'java': r'^\s*(/\*|\*/|//)',
            'c': r'^\s*(/\*|\*/|//)',
            'cpp': r'^\s*(/\*|\*/|//)',
            'csharp': r'^\s*(/\*|\*/|//)',
            'ruby': r'^\s*#',
            'go': r'^\s*(/\*|\*/|//)',
            'rust': r'^\s*(/\*|\*/|//)',
            'php': r'^\s*(/\*|\*/|//|#)',
            'swift': r'^\s*(/\*|\*/|//)',
            'kotlin': r'^\s*(/\*|\*/|//)',
            'sql': r'^\s*(--|/\*|\*/)',
            'r': r'^\s*#',
            'bash': r'^\s*#',
            'powershell': r'^\s*#',
        }
        
        comment_pattern = comment_starters.get(language_id.lower(), r'^\s*(#|//|/\*|\*/|--)')
        if re.match(comment_pattern, line):
            continue
            
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines).strip()

@app.route('/generate', methods=['POST'])
def generate_code():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        file_content = data.get('file_content', '')
        cursor_line = data.get('cursor_line', 0)
        language_id = data.get('language_id', 'python')
        
        logger.info(f"Received request for language: {language_id}")
        logger.info(f"Prompt: {prompt}")
        
        # Format the prompt with context
        formatted_prompt = format_prompt(prompt, file_content, cursor_line, language_id)
        
        # Generate response
        logger.info("Generating response...")
        result = generator(formatted_prompt, do_sample=True, max_new_tokens=MAX_LENGTH)
        generated_text = result[0]['generated_text']
        
        # Extract only the model's response (not including the prompt)
        response = generated_text[len(formatted_prompt):].strip()
        
        # Clean response
        refined_code = clean_response(response, language_id)
        
        logger.info("Response generated successfully")
        
        return jsonify({
            "status": "success",
            "response": response,
            "refined_code": refined_code
        })
        
    except Exception as e:
        logger.error(f"Error in generate_code: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/convert', methods=['POST'])
def convert_code():
    try:
        data = request.json
        code = data.get('code', '')
        source_language = data.get('source_language', '')
        target_language = data.get('target_language', '')
        
        logger.info(f"Received conversion request from {source_language} to {target_language}")
        
        # Format the prompt for conversion
        formatted_prompt = format_conversion_prompt(code, source_language, target_language)
        
        # Generate response
        logger.info("Converting code...")
        result = generator(formatted_prompt, do_sample=True, max_new_tokens=MAX_LENGTH)
        generated_text = result[0]['generated_text']
        
        # Extract only the model's response (not including the prompt)
        response = generated_text[len(formatted_prompt):].strip()
        
        # Clean response
        refined_code = clean_response(response, target_language)
        
        logger.info("Code conversion successful")
        
        return jsonify({
            "status": "success",
            "response": response,
            "refined_code": refined_code
        })
        
    except Exception as e:
        logger.error(f"Error in convert_code: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)