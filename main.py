import base64
import os
import subprocess
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Red Bull Quantum-Twin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).parent
BLENDER_PATH = os.environ.get(
    "BLENDER_PATH",
    r"C:\Program Files\Blender Foundation\Blender 4.4\blender.exe",
)
RENDER_OUTPUT = str(ROOT / "blender" / "render_output.png")
RENDER_SCRIPT = str(ROOT / "blender" / "render.py")


@app.get("/api/render")
def get_render(ers_status: str = "NORMAL"):
    """Generate Blender render of F1 car with ERS color."""
    try:
        os.makedirs(ROOT / "blender", exist_ok=True)

        result = subprocess.run(
            [
                BLENDER_PATH,
                "--background",
                "--python",
                RENDER_SCRIPT,
                "--",
                ers_status,
                RENDER_OUTPUT,
            ],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(ROOT),
        )

        if result.returncode != 0:
            return {"error": "Render failed", "details": result.stderr}

        with open(RENDER_OUTPUT, "rb") as f:
            img_data = base64.b64encode(f.read()).decode()

        return {
            "image": f"data:image/png;base64,{img_data}",
            "ers_status": ers_status,
            "timestamp": time.time(),
        }
    except subprocess.TimeoutExpired:
        return {"error": "Render timeout"}
    except Exception as e:
        return {"error": str(e)}
