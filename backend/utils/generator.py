import torch # type: ignore
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import logging

MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"
MAX_LENGTH = 2048
TEMPERATURE = 0.2
TOP_P = 0.95
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Using device: {DEVICE}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
    device_map="auto" if DEVICE == "cuda" else None,
    trust_remote_code=True
)

generator = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_length=MAX_LENGTH,
    temperature=TEMPERATURE,
    top_p=TOP_P,
    pad_token_id=tokenizer.eos_token_id
)
