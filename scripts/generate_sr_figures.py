"""Generate the website's success-rate figures from its leaderboard data.

Requires Python with matplotlib and Node.js. Run from any directory:
    python scripts/generate_sr_figures.py
"""

import json
import subprocess
from datetime import datetime, timedelta
from html import escape
from math import isfinite
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import MultipleLocator


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "figures"
BLUE = "#1768e8"
INK = "#0d1b2a"
MUTED = "#64748b"
COLORS = {"GPT": "#18866d", "Gemini": "#3b82f6", "Claude": "#bf7053",
          "Gemma": "#d19733", "Qwen": "#8b6aca"}
# Offsets move labels only; every point stays at its exact date and score.
LABEL_OFFSETS = {
    "Gemini 3.1 Pro": (12, 20, "left"),
    "Gemini 3.1 Pro (omni†)": (12, -24, "left"),
    "Gemini 3.1 Flash Lite": (-5, -42, "center"),
    "GPT-5.5": (0, 20, "center"),
    "Claude Opus 4.7": (14, 10, "left"),
    "Qwen 3.6 27B": (0, -40, "center"),
    "Qwen 3.5 9B": (12, 12, "left"),
    "Gemma4 31B": (-25, 30, "right"),
    "Gemma4 26B A4B": (-14, -42, "right"),
}


def read_entries():
    # Evaluate only the existing data declarations, before any DOM code.
    result = subprocess.run(
        ["node", "-e", """
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('script.js', 'utf8');
const end = source.indexOf('const leaderboard =');
if (end < 0) throw new Error('Cannot find the end of the leaderboard data');
process.stdout.write(vm.runInNewContext(
  source.slice(0, end) + '\\nJSON.stringify(leaderboardEntries)', {}, {timeout: 1000}
));
"""],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)


def timeline_entries(entries, budget):
    return sorted(
        (entry for entry in entries
         if str(budget) in entry["results"] and entry.get("releaseDate")
         and isinstance(entry["results"][str(budget)]["averageSR"], (int, float))
         and isfinite(entry["results"][str(budget)]["averageSR"])),
        key=lambda entry: (entry["releaseDate"], -entry["results"][str(budget)]["averageSR"]),
    )


def frontier_indices(scores):
    frontier, best = [], -1
    for index, score in enumerate(scores):
        if score > best:
            frontier.append(index)
            best = score
    return frontier


def draw(entries, budget, mobile=False):
    timeline = timeline_entries(entries, budget)
    scores = [entry["results"][str(budget)]["averageSR"] for entry in timeline]
    dates = [datetime.fromisoformat(entry["releaseDate"]) for entry in timeline]
    frontier = frontier_indices(scores)
    # Use the same zero-based axis for both budgets, expanding for future scores.
    maximum = max(
        result["averageSR"] for entry in entries for result in entry["results"].values()
        if isinstance(result["averageSR"], (int, float)) and isfinite(result["averageSR"])
    )
    axis_max = max(50, int(maximum // 10 + 1) * 10)

    fig = plt.figure(figsize=(4.3, 6.5) if mobile else (11, 5.5), facecolor="white")
    ax = fig.add_axes([0.13, 0.40, 0.81, 0.56] if mobile else [0.08, 0.14, 0.89, 0.82])

    ax.set_axisbelow(True)
    ax.grid(color="#e2e8f0", linewidth=0.7, linestyle=(0, (3, 4)))
    ax.set_xlim(min(dates) - timedelta(days=10), max(dates) + timedelta(days=18 if not mobile else 8))
    ax.set_ylim(0, axis_max)
    ax.yaxis.set_major_locator(MultipleLocator(10))
    ax.xaxis.set_major_locator(mdates.DayLocator(bymonthday=[1, 15]) if not mobile else mdates.MonthLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d %b" if not mobile else "%b"))
    ax.tick_params(colors=MUTED, labelsize=9 if mobile else 12, length=0, pad=8)
    year = str(dates[0].year) if dates[0].year == dates[-1].year else f"{dates[0].year}–{dates[-1].year}"
    ax.set_xlabel(f"Model release date · {year}", color=MUTED, fontsize=9 if mobile else 11, labelpad=12)
    ax.set_ylabel("Success rate (%)", color=MUTED, fontsize=9 if mobile else 11, labelpad=10)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.spines["bottom"].set_visible(True)
    ax.spines["bottom"].set_color("#cbd5e1")
    for index, (entry, date, score) in enumerate(zip(timeline, dates, scores)):
        color = COLORS.get(entry["family"], BLUE)
        ax.scatter(date, score, s=110 if mobile else 240, color=color, alpha=0.10,
                   edgecolors="none", zorder=3)
        ax.scatter(date, score, s=42 if mobile else 100, facecolors="white",
                   edgecolors=color, linewidths=1.8, zorder=4)
        ax.scatter(date, score, s=12 if mobile else 30, color=color, edgecolors="none", zorder=5)
        if mobile:
            dx, dy = (8, 8)
            if entry["model"] == "Gemma4 26B A4B":
                dx, dy = (-8, -14)
            ax.annotate(str(index + 1), (date, score), xytext=(dx, dy),
                        textcoords="offset points", fontsize=8, color=color, fontweight="bold")
            column, row = index % 2, index // 2
            fig.text(0.055 + column * 0.50, 0.285 - row * 0.055,
                     f"{index + 1}  {entry['model']}", fontsize=8.1, color=color, fontweight="bold")
            fig.text(0.055 + column * 0.50, 0.265 - row * 0.055,
                     f"    {date:%d %b} · {score:.1f}%", fontsize=8, color=MUTED)
        else:
            dx, dy, alignment = LABEL_OFFSETS.get(entry["model"], (10, 12, "left"))
            ax.annotate(f"{entry['model']}\n{score:.1f}%", (date, score), xytext=(dx, dy),
                        textcoords="offset points", ha=alignment, va="center", fontsize=13,
                        color=INK, fontweight="bold" if index in frontier else "normal",
                        bbox={"facecolor": "white", "edgecolor": "none", "pad": 2, "alpha": 0.9},
                        arrowprops={"arrowstyle": "-", "color": color, "linewidth": 0.7,
                                    "shrinkA": 3, "shrinkB": 8})

    stem = f"success-rate-{budget}" + ("-mobile" if mobile else "")
    metadata = {"Date": None, "Title": f"WebArena-Pro success rate by release date at {budget} steps",
                "Description": "; ".join(f"{entry['model']} ({entry['releaseDate']}): {score:.1f}%"
                                         for entry, score in zip(timeline, scores))}
    svg_path = OUTPUT / f"{stem}.svg"
    fig.savefig(svg_path, metadata=metadata)
    # Match the SVG's point coordinates (72 units per inch), with y measured
    # from its top edge. Keep these controls outside Matplotlib's drawing group
    # so the website can expose them while hiding decorative paths from AT.
    fig.canvas.draw()
    controls = []
    for entry, date, score in zip(timeline, dates, scores):
        x, y = fig.transFigure.inverted().transform(
            ax.transData.transform((mdates.date2num(date), score))
        )
        x *= fig.get_figwidth() * 72
        y = (1 - y) * fig.get_figheight() * 72
        label = escape(f"{entry['model']}, {score:.1f}%, show agent configuration", quote=True)
        controls.append(
            f'<g class="sr-point" data-entry-index="{entries.index(entry)}" '
            f'tabindex="0" role="button" aria-label="{label}">'
            f'<circle cx="{x:.3f}" cy="{y:.3f}" r="{6 if mobile else 8}" '
            'fill="transparent" stroke="transparent"/></g>'
        )
    svg_path.write_text(svg_path.read_text().replace("</svg>", "\n".join(controls) + "\n</svg>"))
    if not mobile:
        fig.savefig(OUTPUT / f"{stem}.png", dpi=200)
    plt.close(fig)


if __name__ == "__main__":
    plt.rcParams.update({"font.family": "DejaVu Sans", "svg.hashsalt": "webarena-pro-sr"})
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries = read_entries()
    for budget in (30, 50):
        draw(entries, budget)
        draw(entries, budget, mobile=True)
    print("Generated 30- and 50-step figures in assets/figures/.")
