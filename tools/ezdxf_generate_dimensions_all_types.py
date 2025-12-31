"""Generate per-type DIMENSION fixtures.

This script generates one DXF fixture per DXF DIMENSION type used by our renderer.

Usage:
  ./.venv-ezdxf/bin/python tools/ezdxf_generate_dimensions_all_types.py

Output:
  test/resources/dimension-type-0-linear.dxf
  test/resources/dimension-type-1-aligned.dxf
  test/resources/dimension-type-2-angular-2l.dxf
  test/resources/dimension-type-3-diameter.dxf
  test/resources/dimension-type-4-radius.dxf
  test/resources/dimension-type-5-angular-3p.dxf
  test/resources/dimension-type-6-ordinate-x.dxf
    test/resources/dimension-type-6-ordinate-y.dxf
"""

from __future__ import annotations

from pathlib import Path

import ezdxf


def _out_path(name: str) -> Path:
    repo_root = Path(__file__).resolve().parents[1]
    return repo_root / "test" / "resources" / name


def _new_doc() -> ezdxf.EzDxf:
    doc = ezdxf.new("R2010")
    doc.header["$INSUNITS"] = 4  # millimeters
    return doc


def generate_type_0_linear() -> None:
    out_path = _out_path("dimension-type-0-linear.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    # Reference geometry
    p1 = (10.0, 10.0)
    p2 = (110.0, 10.0)
    msp.add_line(p1, p2)

    dim = msp.add_linear_dim(
        base=(10.0, 35.0),
        p1=p1,
        p2=p2,
        angle=0,
        text="<>",
        dimstyle="EZDXF",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_1_aligned() -> None:
    out_path = _out_path("dimension-type-1-aligned.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    # Reference geometry along a slope
    p1 = (10.0, 10.0)
    p2 = (90.0, 50.0)
    msp.add_line(p1, p2)

    # distance is the offset from the measured line
    dim = msp.add_aligned_dim(
        p1=p1,
        p2=p2,
        distance=20.0,
        text="<>",
        dimstyle="EZDXF",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_2_angular_2l() -> None:
    out_path = _out_path("dimension-type-2-angular-2l.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    # Two lines meeting at the origin (vertex)
    center = (0.0, 0.0)
    p1 = (100.0, 0.0)
    p2 = (0.0, 80.0)
    msp.add_line(center, p1)
    msp.add_line(center, p2)

    # line1 and line2 each defined by (start, end)
    dim = msp.add_angular_dim_2l(
        base=(50.0, 50.0),
        line1=(center, p1),
        line2=(center, p2),
        text="<>",
        dimstyle="EZ_CURVED",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_3_diameter() -> None:
    out_path = _out_path("dimension-type-3-diameter.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    center = (60.0, 40.0)
    radius = 25.0
    msp.add_circle(center, radius)

    dim = msp.add_diameter_dim(
        center=center,
        radius=radius,
        location=(center[0] + 40.0, center[1] + 30.0),
        text="<>",
        dimstyle="EZ_RADIUS",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_4_radius() -> None:
    out_path = _out_path("dimension-type-4-radius.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    center = (60.0, 40.0)
    radius = 30.0
    msp.add_circle(center, radius)

    dim = msp.add_radius_dim(
        center=center,
        radius=radius,
        location=(center[0] + 45.0, center[1] + 20.0),
        text="<>",
        dimstyle="EZ_RADIUS",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_5_angular_3p() -> None:
    # Keep this aligned with tools/ezdxf_generate_dimensions_angular_3p.py
    out_path = _out_path("dimension-type-5-angular-3p.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    center = (0.0, 0.0)
    p1 = (100.0, 0.0)
    p2 = (0.0, 120.0)
    msp.add_line(center, p1)
    msp.add_line(center, p2)

    dim = msp.add_angular_dim_3p(
        base=(80.0, 80.0),
        center=center,
        p1=p1,
        p2=p2,
        text="<>",
        dimstyle="EZ_CURVED",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_6_ordinate_x() -> None:
    out_path = _out_path("dimension-type-6-ordinate-x.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    feature = (70.0, 30.0)
    msp.add_point(feature)

    # offset is from the feature location to the leader end (where the text sits).
    dim = msp.add_ordinate_x_dim(
        feature_location=feature,
        offset=(30.0, 25.0),
        origin=(0.0, 0.0),
        rotation=0.0,
        text="<>",
        dimstyle="EZDXF",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def generate_type_6_ordinate_y() -> None:
    out_path = _out_path("dimension-type-6-ordinate-y.dxf")
    doc = _new_doc()
    msp = doc.modelspace()

    feature = (40.0, 90.0)
    msp.add_point(feature)

    dim = msp.add_ordinate_y_dim(
        feature_location=feature,
        offset=(25.0, 30.0),
        origin=(0.0, 0.0),
        rotation=0.0,
        text="<>",
        dimstyle="EZDXF",
    )
    dim.update({"dimdec": 2})
    dim.render()

    doc.saveas(out_path)
    print(f"Wrote {out_path}")


def main() -> None:
    generate_type_0_linear()
    generate_type_1_aligned()
    generate_type_2_angular_2l()
    generate_type_3_diameter()
    generate_type_4_radius()
    generate_type_5_angular_3p()
    generate_type_6_ordinate_x()
    generate_type_6_ordinate_y()


if __name__ == "__main__":
    main()
