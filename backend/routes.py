from flask import request, jsonify # type: ignore
from utils.generator import generator
from utils.prompts import (
    format_prompt,
    format_conversion_prompt,
    format_bug_detection_prompt,
    format_optimization_prompt,
)
from utils.cleaner import clean_response, extract_json_from_response
import logging
import traceback

logger = logging.getLogger(__name__)

def register_routes(app):
    @app.route('/generate', methods=['POST'])
    def generate_code():
        try:
            data = request.json
            prompt = data.get('prompt', '')
            file_content = data.get('file_content', '')
            cursor_line = data.get('cursor_line', 0)
            language_id = data.get('language_id', 'python')
            
            formatted_prompt = format_prompt(prompt, file_content, cursor_line, language_id)
            result = generator(formatted_prompt, do_sample=True)
            generated_text = result[0]['generated_text']
            response = generated_text[len(formatted_prompt):].strip()
            refined_code = clean_response(response, language_id)
            
            return jsonify({"status": "success", "response": response, "refined_code": refined_code})
        except Exception as e:
            logger.error(traceback.format_exc())
            return jsonify({"status": "error", "error": str(e)}), 500

    @app.route('/convert', methods=['POST'])
    def convert_code():
        try:
            data = request.json
            code = data.get('code', '')
            source_language = data.get('source_language', '')
            target_language = data.get('target_language', '')
            
            formatted_prompt = format_conversion_prompt(code, source_language, target_language)
            result = generator(formatted_prompt, do_sample=True)
            generated_text = result[0]['generated_text']
            response = generated_text[len(formatted_prompt):].strip()
            refined_code = clean_response(response, target_language)
            
            return jsonify({"status": "success", "response": response, "refined_code": refined_code})
        except Exception as e:
            logger.error(traceback.format_exc())
            return jsonify({"status": "error", "error": str(e)}), 500

    @app.route('/analyze', methods=['POST'])
    def analyze_code():
        try:
            data = request.json
            code = data.get('code', '')
            language_id = data.get('language_id', 'python')
            prompt = format_bug_detection_prompt(code, language_id)
            
            result = generator(prompt, do_sample=True)
            response = result[0]['generated_text'][len(prompt):].strip()
            analysis_json = extract_json_from_response(response) or {
                "issues": [],
                "summary": "Analysis failed to produce properly structured results."
            }

            return jsonify({"status": "success", "analysis": analysis_json})
        except Exception as e:
            logger.error(traceback.format_exc())
            return jsonify({"status": "error", "error": str(e)}), 500

    @app.route('/optimize', methods=['POST'])
    def optimize_code():
        try:
            data = request.json
            code = data.get('code', '')
            language_id = data.get('language_id', 'python')
            prompt = format_optimization_prompt(code, language_id)

            result = generator(prompt, do_sample=True)
            response = result[0]['generated_text'][len(prompt):].strip()
            optimization_json = extract_json_from_response(response) or {
                "optimizations": [],
                "summary": "Optimization analysis failed to produce properly structured results."
            }

            return jsonify({"status": "success", "optimizations": optimization_json})
        except Exception as e:
            logger.error(traceback.format_exc())
            return jsonify({"status": "error", "error": str(e)}), 500
