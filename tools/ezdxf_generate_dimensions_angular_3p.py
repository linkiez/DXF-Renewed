"""Generate an angular 3-point DIMENSION fixture DXF.

This fixture is meant to exercise DIMENSION type 5 (Angular 3-point).

Usage:
  ./.venv-ezdxf/bin/python tools/ezdxf_generate_dimensions_angular_3p.py

Output:
  test/resources/dimensions-angular-3p.dxf
"""

from __future__ import annotations

from pathlib import Path

import ezdxf


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    out_path = repo_root / "test" / "resources" / "dimensions-angular-3p.dxf"

    doc = ezdxf.new("R2010")
    doc.header["$INSUNITS"] = 4  # millimeters
    msp = doc.modelspace()

    # Geometry: two rays forming an angle at "center".
    center = (0.0, 0.0)
    p1 = (100.0, 0.0)
    p2 = (0.0, 120.0)

    # Draw legs for visual reference.
    msp.add_line(center, p1)
    msp.add_line(center, p2)

    # Place the dimension arc at a larger radius.
    base = (80.0, 80.0)

    # ezdxf renders DIMENSION via an anonymous block; our renderer uses the DIMENSION
    # entity definition points.
    dim = msp.add_angular_dim_3p(
        base=base,
        center=center,
        p1=p1,
        p2=p2,
        text="<>",
        dimstyle="EZDXF",
    )

    # Ensure deterministic text formatting.
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
