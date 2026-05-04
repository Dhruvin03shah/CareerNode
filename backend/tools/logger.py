import datetime
import sys

# ANSI Color codes
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def _get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_agent(agent_name: str, message: str = "Executing..."):
    print(f"{Colors.OKCYAN}[{_get_timestamp()}] 🤖 [AGENT: {agent_name}] {message}{Colors.ENDC}", flush=True)

def log_api(api_name: str, details: str):
    print(f"{Colors.OKGREEN}[{_get_timestamp()}] 🌐 [API CALL: {api_name}] {details}{Colors.ENDC}", flush=True)

def log_info(module: str, message: str):
    print(f"{Colors.OKBLUE}[{_get_timestamp()}] ℹ️  [{module}] {message}{Colors.ENDC}", flush=True)

def log_warn(module: str, message: str):
    print(f"{Colors.WARNING}[{_get_timestamp()}] ⚠️  [{module}] {message}{Colors.ENDC}", flush=True)

def log_error(module: str, error: str):
    print(f"{Colors.FAIL}[{_get_timestamp()}] ❌ [{module}] ERROR: {error}{Colors.ENDC}", file=sys.stderr, flush=True)
