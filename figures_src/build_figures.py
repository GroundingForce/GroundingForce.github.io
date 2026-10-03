#!/usr/bin/env python3
"""Turn the paper's figure exports in this folder into the page assets in static/images/.

Run from the repository root:   python3 figures_src/build_figures.py

Three things happen here, and each one is needed:

1. fig1 and fig2 are exported with a transparent background. Left alone they sit on
   whatever the viewer paints behind them, which is black in several PDF and image
   viewers, and the figures are drawn for a white page. They are flattened onto white.

2. The table and ablation exports include the LaTeX caption. The page writes those
   captions as HTML instead, so the caption rows are cropped off. The crop rows were
   read off each file: for the tables, the row of the top horizontal rule; for the
   ablations, the first blank row below the content.

3. table2's caption carries red hyperlink boxes around "Appendix E" and "Table 1",
   and the lowest one overlaps the table's top rule. They are whitened -- but only
   above row 300, because the table's own red value (-3.50) is further down and must
   survive.
"""

import os
import pathlib

from PIL import Image, ImageOps

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent / "static" / "images"
MAX_WIDTH = 2400           # ~2x the widest the page ever displays a figure
PAD = 28                   # white padding restored above/below a cropped table


def load_on_white(name):
    im = Image.open(SRC / name)
    if im.mode == "RGBA":
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im)
    return im.convert("RGB")


def save(im, name):
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    path = OUT / name
    im.save(path, optimize=True)
    print(f"  {name:28} {str(im.size):13} {os.path.getsize(path) / 1024:7.0f} KB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print("building page figures:")

    # 1. Whole figures, flattened onto white.
    save(load_on_white("fig1_v4 (1).png"), "teaser.png")
    save(load_on_white("fig2_v4 (1).png"), "architecture.png")

    # 2. Tables, cropped from their top rule down, caption dropped.
    t1 = load_on_white("table1.png")
    save(ImageOps.expand(t1.crop((0, 241, t1.width, 703)), (0, PAD), fill="white"),
         "table_robocasa.png")

    # 3. table2: whiten the caption's red hyperlink boxes before cropping.
    t2 = load_on_white("table2.png")
    px = t2.load()
    for y in range(300):                       # caption band only
        for x in range(t2.width):
            r, g, b = px[x, y]
            if r > 150 and g < 110 and b < 110:
                px[x, y] = (255, 255, 255)
    save(ImageOps.expand(t2.crop((0, 191, t2.width, 670)), (0, PAD), fill="white"),
         "table_robotwin.png")

    # 4. Ablations, caption cropped off; ablation2 also has a stray text sliver on top.
    save(load_on_white("modality_ablation.png").crop((0, 0, 2204, 660)), "ablation_target.png")
    save(load_on_white("ablation2.png").crop((0, 60, 2202, 625)), "ablation_design.png")

    # 5. Figure 5 is exported without its caption already.
    save(load_on_white("real_world_result.png"), "real_world.png")


if __name__ == "__main__":
    main()
