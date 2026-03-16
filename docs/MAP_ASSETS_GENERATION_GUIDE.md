# Map Assets Generation Guide

## Overview

This script generates all 26 map assets for FableMap with multiple providers:
- **[`replicate`](scripts/generate_map_assets.py:116)** for hosted generation
- **[`a1111`](scripts/generate_map_assets.py:117)** for local [`AUTOMATIC1111`](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
- **[`comfyui`](scripts/generate_map_assets.py:118)** for local [`ComfyUI`](https://github.com/comfyanonymous/ComfyUI)

Asset output remains the same for all providers:
- **Pack A (Dream-Glade Night)**: 1 scene + 6 icons + 6 tiles
- **Pack B (Pastoral Storybook)**: 1 scene + 6 icons + 6 tiles

## Setup

### Option A: Replicate

#### 1. Install Dependencies
```bash
pip install replicate requests
```

#### 2. Set Environment Variable
```bash
# macOS/Linux
export REPLICATE_API_TOKEN=your-token-here

# Windows (PowerShell)
$env:REPLICATE_API_TOKEN="your-token-here"

# Windows (Command Prompt)
set REPLICATE_API_TOKEN=your-token-here
```

#### 3. Run the Script
```bash
python scripts/generate_map_assets.py --provider replicate
```

### Option B: Local ComfyUI

#### 1. Start ComfyUI
Recommended local stack on this machine:
- install [`ComfyUI`](https://github.com/comfyanonymous/ComfyUI)
- use a Python 3 virtual environment
- install PyTorch with CUDA support
- launch the server on `http://127.0.0.1:8188`

Current local install path used during development:
- [`tools/ComfyUI`](tools/ComfyUI)
- [`tools/ComfyUI/.venv`](tools/ComfyUI/.venv)

#### 2. Put a checkpoint into the checkpoints folder
Expected folder:
- [`tools/ComfyUI/models/checkpoints/`](tools/ComfyUI/models/checkpoints/)

Example model filename:
- `v1-5-pruned-emaonly.safetensors`
- or an SDXL checkpoint if VRAM allows

#### 3. Run the script with the ComfyUI provider
Use the same Python environment that has [`requests`](https://pypi.org/project/requests/) installed. On this machine the working command is:

```bash
tools/ComfyUI/.venv/Scripts/python.exe scripts/generate_map_assets.py --provider comfyui --base-url http://127.0.0.1:8188 --model v1-5-pruned-emaonly.safetensors
```

Dry run:

```bash
tools/ComfyUI/.venv/Scripts/python.exe scripts/generate_map_assets.py --provider comfyui --base-url http://127.0.0.1:8188 --model v1-5-pruned-emaonly.safetensors --dry-run
```

### Option C: Local AUTOMATIC1111

#### 1. Start the A1111 WebUI API
Make sure the API is enabled, typically with `--api`, and available at `http://127.0.0.1:7860`.

#### 2. Run the script with the A1111 provider
```bash
python scripts/generate_map_assets.py --provider a1111 --base-url http://127.0.0.1:7860 --model your-checkpoint-name.safetensors
```

## Provider Parameters

The script now supports these key flags:
- [`--provider`](scripts/generate_map_assets.py:116)
- [`--api-token`](scripts/generate_map_assets.py:122)
- [`--base-url`](scripts/generate_map_assets.py:127)
- [`--model`](scripts/generate_map_assets.py:136)
- [`--negative-prompt`](scripts/generate_map_assets.py:145)
- [`--steps-scene`](scripts/generate_map_assets.py:150)
- [`--steps-asset`](scripts/generate_map_assets.py:156)
- [`--cfg-scale`](scripts/generate_map_assets.py:162)
- [`--sampler-name`](scripts/generate_map_assets.py:168)
- [`--scheduler`](scripts/generate_map_assets.py:174)
- [`--seed`](scripts/generate_map_assets.py:180)
- [`--timeout`](scripts/generate_map_assets.py:186)
- [`--poll-interval`](scripts/generate_map_assets.py:192)
- [`--output-dir`](scripts/generate_map_assets.py:198)
- [`--comfyui-workflow-api`](scripts/generate_map_assets.py:204)
- [`--dry-run`](scripts/generate_map_assets.py:210)

You can also configure the script with environment variables such as:
- `FABLEMAP_IMAGE_PROVIDER`
- `LOCAL_SD_BASE_URL`
- `LOCAL_SD_MODEL`
- `LOCAL_SD_NEGATIVE_PROMPT`
- `LOCAL_SD_STEPS_SCENE`
- `LOCAL_SD_STEPS_ASSET`
- `LOCAL_SD_CFG_SCALE`
- `LOCAL_SD_SAMPLER`
- `LOCAL_SD_SCHEDULER`
- `LOCAL_SD_SEED`
- `LOCAL_SD_TIMEOUT`
- `LOCAL_SD_POLL_INTERVAL`
- `COMFYUI_WORKFLOW_API`
- `FABLEMAP_ASSET_OUTPUT_DIR`

## Current Local Machine Status

Local provider selected for development: **[`ComfyUI`](https://github.com/comfyanonymous/ComfyUI)**.

Current machine verification:
- local [`ComfyUI`](https://github.com/comfyanonymous/ComfyUI) server starts successfully on `http://127.0.0.1:8188`
- [`scripts/generate_map_assets.py`](scripts/generate_map_assets.py) dry run works with `--provider comfyui`
- no checkpoint is installed yet in [`tools/ComfyUI/models/checkpoints/`](tools/ComfyUI/models/checkpoints/), so real asset generation cannot start until a model file is added

## Output Structure

Assets will be generated in `fablemap/demo_assets/new_map_assets/`:

```
new_map_assets/
├── pack_a/
│   ├── scene_01.png (1024×1024)
│   ├── icons/
│   │   ├── quest.png
│   │   ├── shop.png
│   │   ├── boss.png
│   │   ├── home.png
│   │   ├── echo.png
│   │   └── event.png
│   └── tiles/
│       ├── road_01.png
│       ├── road_02.png
│       ├── ground_01.png
│       ├── ground_02.png
│       ├── water_01.png
│       └── magic_01.png
└── pack_b/
    ├── scene_01.png (1024×1024)
    ├── icons/
    │   ├── quest.png
    │   ├── shop.png
    │   ├── boss.png
    │   ├── home.png
    │   ├── echo.png
    │   └── event.png
    └── tiles/
        ├── road_01.png
        ├── road_02.png
        ├── ground_01.png
        ├── ground_02.png
        ├── water_01.png
        └── garden_01.png
```

## Generation Details

### Pack A: Dream-Glade Night
- **Palette**: Deep violet/indigo, cyan/magenta glow, warm gold, soft blue
- **Style**: Nocturne synth-fantasy, painterly vector hybrid
- **Scene**: Isometric night city with glowing river, grid roads, POI rings
- **Icons**: Cyan-magenta neon halos on dark background
- **Tiles**: Seamless nocturne textures with glow edges

### Pack B: Pastoral Storybook
- **Palette**: Soft mint/teal, warm terracotta, cream parchment, high-chroma accents
- **Style**: Pastel storybook, painterly vector hybrid
- **Scene**: Isometric sunny village with meadows, bridges, cottages
- **Icons**: Warm orange-gold rims on transparent background
- **Tiles**: Seamless pastel textures with soft appearance

## Timing

- Local generation speed depends on model size, VRAM, and provider backend
- On local GPU, icons and tiles should usually be faster than scenes
- The script polls [`ComfyUI`](https://github.com/comfyanonymous/ComfyUI) using [`--poll-interval`](scripts/generate_map_assets.py:192)
- Total time for all 26 assets can vary significantly depending on checkpoint and settings

## Troubleshooting

### `ModuleNotFoundError: No module named 'requests'`
Run the script with a Python environment that has dependencies installed, for example [`tools/ComfyUI/.venv/Scripts/python.exe`](tools/ComfyUI/.venv/Scripts/python.exe).

### `REPLICATE_API_TOKEN not set`
Make sure the environment variable is set when using provider `replicate`.

### Local ComfyUI server is up but generation fails immediately
- verify the base URL matches the running server, for example `http://127.0.0.1:8188`
- verify a checkpoint exists in [`tools/ComfyUI/models/checkpoints/`](tools/ComfyUI/models/checkpoints/)
- verify the model name passed to [`--model`](scripts/generate_map_assets.py:136) exactly matches the checkpoint filename

### Generation timeout
- local provider may still be loading models or waiting on VRAM
- increase [`--timeout`](scripts/generate_map_assets.py:186)
- for [`ComfyUI`](https://github.com/comfyanonymous/ComfyUI), consider increasing [`--poll-interval`](scripts/generate_map_assets.py:192) slightly if the machine is under heavy load

### Generation failed
- check the server console output from [`tools/ComfyUI/main.py`](tools/ComfyUI/main.py)
- try a lighter checkpoint first, such as SD 1.5 class models
- lower image size or steps if VRAM is limited

## Customization

To modify prompts, edit the `PACK_A_SPECS` and `PACK_B_SPECS` dictionaries in the script:

```python
PACK_A_SPECS = {
    "scene": {
        "prompt": "your custom prompt here..."
    },
    "icons": {
        "quest": "custom icon prompt..."
    },
    ...
}
```

## Next Steps

After generation:
1. Review generated assets in [`fablemap/demo_assets/new_map_assets/`](fablemap/demo_assets/new_map_assets/)
2. Verify consistency across both packs
3. Commit assets to repository
4. Integrate into [`frontend/src/WorldMap.jsx`](frontend/src/WorldMap.jsx)
5. If needed, refine local workflow parameters in [`scripts/generate_map_assets.py`](scripts/generate_map_assets.py)
