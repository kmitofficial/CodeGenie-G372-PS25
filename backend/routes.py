from flask import request, jsonify # type: ignore
<<<<<<< HEAD
import json
=======
>>>>>>> origin/main
from utils.generator import generator
from utils.prompts import (
    format_prompt,
    format_conversion_prompt,
    format_bug_detection_prompt,
    format_optimization_prompt,
<<<<<<< HEAD
    format_project_analysis_prompt,
)
from utils.cleaner import clean_response, extract_json_from_response, validate_and_fix_line_numbers, pre_analyze_code_structure
=======
)
from utils.cleaner import clean_response, extract_json_from_response
>>>>>>> origin/main
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
<<<<<<< HEAD
            print(response)
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
            
            if not code.strip():
                return jsonify({
                    "status": "error", 
                    "error": "No code provided for analysis"
                }), 400
            
            # Pre-analyze for obvious structural issues
            structural_issues = pre_analyze_code_structure(code, language_id)
            
            prompt = format_bug_detection_prompt(code, language_id)
            
            # Add more specific generation parameters for better results
            result = generator(
                prompt, 
                do_sample=True,
                repetition_penalty=1.1,
            )
            
            response = result[0]['generated_text'][len(prompt):].strip()
            logger.info(f"Raw LLM response: {response}")
            
            analysis_json = extract_json_from_response(response)
            
            if not analysis_json:
                # Fallback: try to parse the entire response as JSON
                try:
                    analysis_json = json.loads(response)
                except:
                    analysis_json = {
                        "issues": [],
                        "summary": "Analysis failed to produce properly structured results.",
                        "raw_response": response  # For debugging
                    }

            # Merge structural issues with LLM analysis
            if structural_issues:
                if 'issues' not in analysis_json:
                    analysis_json['issues'] = []
                
                # Add structural issues found by pre-analysis
                for issue in structural_issues:
                    analysis_json['issues'].append({
                        "type": issue['type'],
                        "line": issue['line'],
                        "description": issue['description'],
                        "severity": "high",
                        "fix": issue['fix']
                    })
                
                # Update summary to include structural issues
                structural_summary = f"Found {len(structural_issues)} structural issues. "
                if 'summary' in analysis_json:
                    analysis_json['summary'] = structural_summary + analysis_json['summary']
                else:
                    analysis_json['summary'] = structural_summary + "Pre-analysis detected critical structural problems."

            # Validate and fix line numbers
            analysis_json = validate_and_fix_line_numbers(analysis_json, code)
            
            return jsonify({"status": "success", "analysis": analysis_json})
            
        except Exception as e:
            logger.error(f"Analysis error: {traceback.format_exc()}")
=======
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
>>>>>>> origin/main
            return jsonify({"status": "error", "error": str(e)}), 500

    @app.route('/optimize', methods=['POST'])
    def optimize_code():
        try:
            data = request.json
            code = data.get('code', '')
            language_id = data.get('language_id', 'python')
<<<<<<< HEAD
            
            if not code.strip():
                return jsonify({
                    "status": "error", 
                    "error": "No code provided for optimization"
                }), 400
            
            prompt = format_optimization_prompt(code, language_id)
            
            result = generator(
                prompt, 
                do_sample=True,
                max_new_tokens=1000,
                temperature=0.3,
                top_p=0.9,
                pad_token_id=generator.tokenizer.eos_token_id
            )
            
            response = result[0]['generated_text'][len(prompt):].strip()
            logger.info(f"Raw optimization response: {response}")
            
            optimization_json = extract_json_from_response(response)
            
            if not optimization_json:
                try:
                    optimization_json = json.loads(response)
                except:
                    optimization_json = {
                        "optimizations": [],
                        "summary": "Optimization analysis failed to produce properly structured results.",
                        "raw_response": response
                    }

            # Validate and fix line numbers
            optimization_json = validate_and_fix_line_numbers(optimization_json, code, is_optimization=True)
            
            return jsonify({"status": "success", "optimizations": optimization_json})
            
        except Exception as e:
            logger.error(f"Optimization error: {traceback.format_exc()}")
            return jsonify({"status": "error", "error": str(e)}), 500
            
    @app.route('/analyze-project', methods=['POST'])
    def analyze_project():
        try:
            data = request.json
            project_files = data.get('project_files', {})
            
            # Format project files into a string representation
            project_files_str = ""
            for file_path, content in project_files.items():
                project_files_str += f"=== {file_path} ===\n{content}\n\n"
            
            prompt = format_project_analysis_prompt(project_files_str)
            
            result = generator(prompt, do_sample=True)
            response = result[0]['generated_text'][len(prompt):].strip()
            analysis_json = extract_json_from_response(response) or {
                "project_summary": {
                    "title": "Unknown Project",
                    "description": "Analysis failed to produce a description.",
                    "technology_stack": [],
                    "architecture": "Analysis failed to determine architecture."
                },
                "issues": [],
                "readme": {
                    "title": "Project Documentation",
                    "description": "Analysis failed to produce a description.",
                    "installation": "N/A",
                    "usage": "N/A",
                    "workflow": "Analysis failed to determine workflow.",
                    "components": []
                },
                "summary": "Analysis failed to produce properly structured results."
            }

            return jsonify({"status": "success", "analysis": analysis_json})
        except Exception as e:
            logger.error(traceback.format_exc())
            return jsonify({"status": "error", "error": str(e)}), 500
        
=======
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
>>>>>>> origin/main
