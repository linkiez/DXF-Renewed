"""Generate a large-scale DIMENSION fixture DXF.

This fixture is meant to exercise viewport-based DIMENSION autoScale.
It intentionally uses a very large modelspace extent so that autoScale
has a noticeable effect in rendering.

Usage:
  ./.venv-ezdxf/bin/python tools/ezdxf_generate_dimensions_large_scale.py

Output:
  test/resources/dimensions-large-scale.dxf
"""

from __future__ import annotations

from pathlib import Path

import ezdxf


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    out_path = repo_root / "test" / "resources" / "dimensions-large-scale.dxf"

    doc = ezdxf.new("R2010")
    doc.header["$INSUNITS"] = 4  # millimeters
    msp = doc.modelspace()

    # Large geometry: very large extents so viewport-based autoScale has a
    # noticeable effect.
    base_x = 0.0
    base_y = 0.0

    length = 80000.0
    p1 = (base_x + 10000.0, base_y + 20000.0)
    p2 = (base_x + 10000.0 + length, base_y + 20000.0)

    # Draw a rectangle below the dimension line to resemble the existing fixture.
    rect_min = (base_x + 10000.0, base_y + 0.0)
    rect_max = (base_x + 10000.0 + length, base_y + 10000.0)
    msp.add_lwpolyline(
        [
            rect_min,
            (rect_max[0], rect_min[1]),
            rect_max,
            (rect_min[0], rect_max[1]),
            rect_min,
        ],
        dxfattribs={"closed": True},
    )

    # Linear dimension above the rectangle.
    # ezdxf renders DIMENSION via an anonymous block; our parser reads DIMENSION entity
    # and uses its definition points.
    dim = msp.add_linear_dim(
        base=(base_x + 10000.0, base_y + 25000.0),
        p1=p1,
        p2=p2,
        angle=0,
        dimstyle="EZDXF",
    )

    # Force a predictable text format.
    # ezdxf 1.4.x: add_linear_dim returns DimStyleOverride; use update().
    dim.update({"dimdec": 2})
    dim.render()

    # Radial dimension for a large circle.
    center = (base_x + 50000.0, base_y + 80000.0)
    radius = 86020.0
    msp.add_circle(center, radius)

    rdim = msp.add_radius_dim(
        center=center,
        radius=radius,
        location=(center[0] - 60000.0, center[1] + 10000.0),
        dimstyle="EZDXF",
    )
    rdim.update({"dimdec": 2})
    rdim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
