"""从已发布的首页原图生成固定尺寸的 WebP 副本；只写指定输出目录，不上传对象。"""

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, __version__ as pillow_version

SOURCE_SHA256 = "f1182c1ef76eba8a048dd2f424ed0219c80575629e01f46be8e59519e2fe7adf"


def main() -> None:
    """校验 source 的原始哈希，输出两个质量 80 的 WebP 和可复核的尺寸、字节、哈希。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if hashlib.sha256(args.source.read_bytes()).hexdigest() != SOURCE_SHA256:
        raise ValueError("Source must be the reviewed homepage PNG.")
    args.output.mkdir(parents=True, exist_ok=True)
    records = []
    with Image.open(args.source) as original:
        source = original.convert("RGB")
        for name, width in [("home-hero-mobile", 960), ("home-hero-desktop", 1672)]:
            height = round(source.height * width / source.width)
            resized = source.resize((width, height), Image.Resampling.LANCZOS) if width != source.width else source
            target = args.output / f"{name}.webp"
            resized.save(target, "WEBP", quality=80, method=6)
            body = target.read_bytes()
            records.append({"file": str(target), "width": width, "height": height,
                            "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()})
    print(json.dumps({"pillow": pillow_version, "source_sha256": SOURCE_SHA256, "outputs": records}))


if __name__ == "__main__":
    main()
