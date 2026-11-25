---
applyTo: '**/*'
---

# Development Instructions (DXF-Renewed) — using ezdxf

This repository is a TypeScript DXF parser. For DXF fixtures, debugging, and cross-checking group codes, we use the Python library **ezdxf**.

Official docs:

- Setup (extras): <https://ezdxf.readthedocs.io/en/stable/setup.html#installation-with-extras>
- Reference index: <https://ezdxf.readthedocs.io/en/stable/reference.html>

## 1) Install ezdxf (recommended: local venv)

Many Linux distributions use an externally-managed Python environment (PEP 668), which blocks `pip install --user`.
Use a local virtualenv inside this repo:

```bash
cd <path-to>/DXF-Renewed
python3 -m venv .venv-ezdxf
. .venv-ezdxf/bin/activate
python -m pip install -U pip

# Core library
python -m pip install -U ezdxf

# Optional drawing add-on dependencies (recommended by ezdxf docs)
python -m pip install -U 'ezdxf[draw]'
```

Extras from the ezdxf docs:

- `ezdxf[draw]`: Matplotlib, PySide6, PyMuPDF, Pillow
- `ezdxf[dev]`: `draw` + setuptools, wheel, Cython, pytest
- If PySide6 is not available, use `ezdxf[draw5]` / `ezdxf[dev5]` (PyQt5-based)

Verify:

```bash
. .venv-ezdxf/bin/activate
python -m ezdxf -V
```

## 2) How ezdxf helps this repo

Use ezdxf for:

- generating **minimal DXF fixtures** for TDD (`test/resources/*.dxf`)
- dumping **raw group-code tags** for an entity/object/table
- checking real-world DXF parsing expectations without guessing group codes

This repo’s workflow is TDD-first:

- add a minimal fixture + failing unit test
- implement parser support
- keep `yarn test` + `yarn lint` green

## 3) Inspect an existing DXF fixture

Print entity types, handles, and layers:

```bash
. .venv-ezdxf/bin/activate
python - <<'PY'
import ezdxf

doc = ezdxf.readfile('test/resources/entities.dxf')
msp = doc.modelspace()

for e in msp:
    handle = getattr(e.dxf, 'handle', None)
    layer = getattr(e.dxf, 'layer', None)
    print(e.dxftype(), handle, layer)
PY
```

## 4) Dump raw group codes (tags) for a single entity

This is the most useful thing for implementing a new handler in `src/handlers/entity/*`.

```bash
. .venv-ezdxf/bin/activate
python - <<'PY'
import ezdxf
from ezdxf.lldxf.tagwriter import TagCollector

doc = ezdxf.readfile('test/resources/leader-basic.dxf')
entity = next(iter(doc.modelspace()))

collector = TagCollector()
entity.export_dxf(collector)

for tag in collector.tags:
    print(tag.code, tag.value)
PY
```

Tip: If you want to dump all entities:

```bash
. .venv-ezdxf/bin/activate
python - <<'PY'
import ezdxf
from ezdxf.lldxf.tagwriter import TagCollector

doc = ezdxf.readfile('test/resources/entities.dxf')
for i, entity in enumerate(doc.modelspace()):
    print('---', i, entity.dxftype(), '---')
    collector = TagCollector()
    entity.export_dxf(collector)
    for tag in collector.tags:
        print(tag.code, tag.value)
PY
```

## 5) Generate a new minimal fixture (recommended pattern)

If ezdxf supports the entity via `layout.new_entity()`, you can create it directly.

Example: create a minimal `TOLERANCE` entity and export:

```bash
. .venv-ezdxf/bin/activate
python - <<'PY'
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create entity by DXF type name. dxfattribs depends on entity.
# "insert" maps to group codes 10/20/30 for many entities.
fcf = msp.new_entity('TOLERANCE', dxfattribs={
    'layer': '0',
    'insert': (10, 20, 0),
})

# You can set additional attributes if supported:
# fcf.dxf.text = '%%v%%v'

out = 'test/resources/tolerance-basic.dxf'
doc.saveas(out)
print('wrote', out)
PY
```

If the high-level attribute you need is unclear, use the **tag dump** technique above to learn what ezdxf writes.

## 6) Run DXF-Renewed checks

```bash
cd <path-to>/DXF-Renewed
yarn test
yarn lint
```

## 7) Reference sitemap

Curated ezdxf reference links live here:

- docs/EZDXF_REFERENCE_SITEMAP.md
