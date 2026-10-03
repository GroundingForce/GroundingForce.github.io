# Grounding Force

Project page for **Grounding Force: Image-Aligned Contact and Force Prediction for
Vision-Language-Action Models** — under review as a conference paper at ICLR 2027.

Live site: https://groundingforce.github.io

> The submission is under **double-blind review**: the page carries no author names,
> affiliations, analytics, or links back to a named lab. Keep it that way until the
> reviews are out.

## Structure

```
index.html                     # the whole page
figures_src/                   # the paper's figure exports, kept as the source of truth
  build_figures.py             # regenerates static/images/ from them
static/
  css/index.css                # the entire stylesheet; palette at the top
  js/app.js                    # rollout player + nav highlighting
  images/                      # the figures the page loads, and favicon.svg
  images/posters/              # first-frame posters for the rollout clips
  videos/                      # the four rollout clips
```

The page has no framework and no third-party JavaScript: one stylesheet, one
small script, and Inter from Google Fonts. Bulma, jQuery, FontAwesome and the
carousel/slider plugins that came with the original template were removed once
nothing referenced them.

## Figures

The page loads only what is in `static/images/`. Those files are built from the
paper's figure exports in `figures_src/`, which nothing on the page references:

| File | Source | Processing |
|---|---|---|
| `teaser.png` | Figure 1 | transparent background flattened onto white, resized to 2400px |
| `architecture.png` | Figure 2 | same |
| `table_robocasa.png` | Table 1 | caption cropped off |
| `table_robotwin.png` | Table 2 | caption cropped off, red hyperlink boxes whitened |
| `ablation_target.png` | Figure 3 | caption cropped off |
| `ablation_design.png` | Figure 4 | caption and a stray text sliver cropped off |
| `real_world.png` | Figure 5 (a, b) | unchanged |

Captions were cropped because they are rendered as HTML on the page instead — that
keeps the text selectable and drops the "Appendix E" / "Sec. 4.1" cross-references
that mean nothing outside the PDF.

When a figure changes in the paper, drop the new export into `figures_src/` under
the same name and rebuild:

```bash
python3 figures_src/build_figures.py
```

The script holds the exact crop rows and explains why each one is there, so the
assets stay reproducible instead of depending on a one-off edit. Re-running it on
unchanged inputs reproduces the current files byte for byte.

## Palette

Sampled from the paper's own figures, so the page and the figures agree:

| Token | Value | Where it comes from |
|---|---|---|
| `--gf-accent` | `#d946ef` | the magenta of the "+ GF" bars |
| `--gf-accent-deep` | `#8a367e` | the deep purple of the figure panel labels |
| `--gf-accent-soft` | `#ddabeb` | the light purple of the figure panel borders |

All three are defined at the top of `static/css/index.css`.

## Rollout videos

`static/videos/` holds one clip per backbone, each a side-by-side comparison with
the predicted force and contact maps composited in by the authors of the source
deck (1600x704, 20 fps, silent, faststart):

| Tab | File | Task | Length |
|---|---|---|---|
| π0 | `pi0_comparison.mp4` | PnPMicrowaveToCounter | 18 s |
| π0.5 | `pi05_comparison.mp4` | TurnOffStove | 14 s |
| GR00T N1.6 | `gr00t_comparison.mp4` | CoffeeSetupMug | 13 s |
| OpenVLA-OFT | `openvla_oft_comparison.mp4` | OpenDrawer | 13 s |

The clips in this repository are **trimmed** from the full-length renders. Each
full clip runs until the base policy's episode ends (35 / 21.6 / 35 / 35 s), long
after the Grounding Force side has finished and started holding its last frame.
They are cut to the point where that comparison has been made:

```sh
ffmpeg -i <full>.mp4 -t <18|14|13|13> \
  -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -an -movflags +faststart <out>.mp4
```

That halves the page's video payload, 22 MB to 11 MB. To change a cut point,
re-run the command above against the full-length source with a new `-t`, and
update the length shown in `index.html`.

How the player behaves, all of it in `static/js/app.js`:

- **Autoplay, muted and looping.** A clip starts when the section scrolls into
  view and pauses when it scrolls away, so the page never decodes video nobody is
  looking at.
- **One clip at a time.** Only the selected tab's video gets a `src`; the other
  three are never fetched until their tab is opened. That keeps the first visit
  to around 6 MB rather than 22 MB.
- **`prefers-reduced-motion` is honoured** — the clip loads and shows its first
  frame instead of playing.
- Autoplay can still be refused (data saver, battery saver, iOS low power). The
  clips are muted with visible controls, so the person can just press play.

The video box is deliberately a little taller than the footage
(`aspect-ratio: 1600 / 790`, `object-position: top`): the force and contact
panels sit hard against the bottom edge of the frame, and without the extra
strip the browser's own control bar covers them.

## Cache busting

`index.html` links the stylesheet and script with a version query:

```html
<link rel="stylesheet" href="./static/css/index.css?v=2">
<script src="./static/js/app.js?v=2" defer></script>
```

The filenames never change, so without this a returning visitor can pair a
cached copy of the previous `index.css` with the new `index.html` and get an
unstyled page. **Bump the number whenever you edit either file.**

The inline SVG icons also carry `width="16" height="16"` attributes, so that if
the stylesheet is ever missing they stay small instead of expanding to fill the
viewport.

## Still to fill in

1. **Paper link** — the `Paper (OpenReview)` chip in `index.html` is inert; make
   it an `<a href="…">` and drop the `is-pending` class.
2. **Code link** — same, once the anonymized repository is up.
3. **Real-robot rollouts** — a commented-out `░░ SLOT ░░` block sits under the
   real-world figure in `index.html`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to `main`, then in the repository settings enable **Pages → Deploy from a
branch → main / (root)**.

# Website License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

Template modified from [Nerfies](https://nerfies.github.io).
