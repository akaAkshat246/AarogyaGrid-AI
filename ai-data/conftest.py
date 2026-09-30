import sys
import os

# Ensure ai-data root is on python path
AI_DATA_DIR = os.path.dirname(os.path.abspath(__file__))
if AI_DATA_DIR not in sys.path:
    sys.path.insert(0, AI_DATA_DIR)
