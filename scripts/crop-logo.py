from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / "assets/images/logo.png").convert("RGBA")
mark = source.crop((400, 300, 1648, 1200))
alpha_bounds = mark.getchannel("A").getbbox()
if alpha_bounds:
    mark = mark.crop(alpha_bounds)
mark.thumbnail((220, 220), Image.Resampling.LANCZOS)
canvas = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
canvas.alpha_composite(mark, ((240 - mark.width) // 2, (240 - mark.height) // 2))
canvas.save(root / "assets/images/logo-mark-clean.png")
