# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## <small>7.2.3 (2026-01-01)</small>

* Revert "ci: publish to GitHub Packages npm registry" ([647277b](https://github.com/linkiez/DXF-Renewed/commit/647277b))
* Revert "docs: add GitHub Packages install instructions" ([86392ec](https://github.com/linkiez/DXF-Renewed/commit/86392ec))

## <small>7.2.2 (2026-01-01)</small>

* Merge pull request #4 from linkiez/fix/emit-types ([acb6440](https://github.com/linkiez/DXF-Renewed/commit/acb6440)), closes [#4](https://github.com/linkiez/DXF-Renewed/issues/4)
* Update build.mjs ([6b0970c](https://github.com/linkiez/DXF-Renewed/commit/6b0970c))
* fix(build): avoid import.meta in CJS output ([e5a351f](https://github.com/linkiez/DXF-Renewed/commit/e5a351f))
* fix(build): emit TypeScript declarations ([1e6af01](https://github.com/linkiez/DXF-Renewed/commit/1e6af01))

## <small>7.2.1 (2026-01-01)</small>

* Merge pull request #3 from linkiez/feature/2026.01.01 ([2c51f7d](https://github.com/linkiez/DXF-Renewed/commit/2c51f7d)), closes [#3](https://github.com/linkiez/DXF-Renewed/issues/3)
* docs: add GitHub Packages install instructions ([5b4671e](https://github.com/linkiez/DXF-Renewed/commit/5b4671e))
* ci: publish to GitHub Packages npm registry ([a37adda](https://github.com/linkiez/DXF-Renewed/commit/a37adda))

## 7.2.0 (2026-01-01)

* Merge pull request #2 from linkiez/feature/2026.01.01 ([c01512f](https://github.com/linkiez/DXF-Renewed/commit/c01512f)), closes [#2](https://github.com/linkiez/DXF-Renewed/issues/2)
* docs: add architecture diagram ([7f61ef2](https://github.com/linkiez/DXF-Renewed/commit/7f61ef2))
* docs: clarify supported entities ([8cd47dc](https://github.com/linkiez/DXF-Renewed/commit/8cd47dc))
* docs: consolidate documentation into PLAN.md ([204abf9](https://github.com/linkiez/DXF-Renewed/commit/204abf9))
* docs: fix mermaid diagram parsing ([0cedf8d](https://github.com/linkiez/DXF-Renewed/commit/0cedf8d))
* docs: improve README structure ([3c6659d](https://github.com/linkiez/DXF-Renewed/commit/3c6659d))
* docs: rename plan to roadmap ([23b060e](https://github.com/linkiez/DXF-Renewed/commit/23b060e))
* docs: update README progress ([64566b7](https://github.com/linkiez/DXF-Renewed/commit/64566b7))
* feat: add toJson processor ([94e112c](https://github.com/linkiez/DXF-Renewed/commit/94e112c))
* feat(entities): add handlers for additional 2D entities ([221ef8b](https://github.com/linkiez/DXF-Renewed/commit/221ef8b))
* feat(parser): add FIELD/DIMASSOC objects and extra table types ([ef89ed7](https://github.com/linkiez/DXF-Renewed/commit/ef89ed7))
* feat(render): support LEADER/RAY/XLINE/TRACE/SHAPE/WIPEOUT ([05a7c82](https://github.com/linkiez/DXF-Renewed/commit/05a7c82))
* chore(tooling): remove babel/react/webpack and migrate functional tests to vite ([dd92031](https://github.com/linkiez/DXF-Renewed/commit/dd92031))

## 7.1.0 (2026-01-01)

* Merge pull request #1 from linkiez/feat/seqend-sequencing ([068c6e1](https://github.com/linkiez/DXF-Renewed/commit/068c6e1)), closes [#1](https://github.com/linkiez/DXF-Renewed/issues/1)
* docs: add ezdxf reference sitemap and dev instructions ([859da63](https://github.com/linkiez/DXF-Renewed/commit/859da63))
* docs: add SVG rendering integration testing docs ([5bb0dbb](https://github.com/linkiez/DXF-Renewed/commit/5bb0dbb))
* docs: clarify type safety guidance ([dc01286](https://github.com/linkiez/DXF-Renewed/commit/dc01286))
* docs: consolidate documentation and plan ([2f4f01e](https://github.com/linkiez/DXF-Renewed/commit/2f4f01e))
* docs: switch to main-only workflow ([6098ad6](https://github.com/linkiez/DXF-Renewed/commit/6098ad6))
* docs: update dimension docs and test guidance ([c171703](https://github.com/linkiez/DXF-Renewed/commit/c171703))
* chore: ignore local ezdxf venv ([053e4c4](https://github.com/linkiez/DXF-Renewed/commit/053e4c4))
* chore(fixtures): add ezdxf validation tooling ([c81c871](https://github.com/linkiez/DXF-Renewed/commit/c81c871))
* chore(fixtures): regenerate DXF fixtures via ezdxf ([7c6876d](https://github.com/linkiez/DXF-Renewed/commit/7c6876d))
* chore(tests): track rendered screenshots ([ebcd1f1](https://github.com/linkiez/DXF-Renewed/commit/ebcd1f1))
* test(dimension): add fixtures for all dimension types ([6b5f9cf](https://github.com/linkiez/DXF-Renewed/commit/6b5f9cf))
* test(integration): add node DIMENSION SVG rendering test ([820efc6](https://github.com/linkiez/DXF-Renewed/commit/820efc6))
* test(integration): run SVG rendering tests in browser ([b0abe31](https://github.com/linkiez/DXF-Renewed/commit/b0abe31))
* feat(dimension): add angular 3-point rendering ([a9ee537](https://github.com/linkiez/DXF-Renewed/commit/a9ee537))
* feat(entities): add image, underlay, leader, and tolerance support ([7f17e47](https://github.com/linkiez/DXF-Renewed/commit/7f17e47))
* feat(objects): add handle maps for common DXF objects ([7672211](https://github.com/linkiez/DXF-Renewed/commit/7672211))
* style: normalize import ordering ([55d54c1](https://github.com/linkiez/DXF-Renewed/commit/55d54c1))
* fix(denormalise): apply block basepoint to TEXT/MTEXT/DIMENSION ([1ee560e](https://github.com/linkiez/DXF-Renewed/commit/1ee560e))
* fix(parser): harden POLYLINE sequencing ([7eb1fb7](https://github.com/linkiez/DXF-Renewed/commit/7eb1fb7))

## 7.0.0 (2025-12-31)

* fix: consolidar tipos ParsedDXF e corrigir incompatibilidades ([804c485](https://github.com/linkiez/DXF-Renewed/commit/804c485))
* fix: tipar handlers e entidades no parseEntities ([a364044](https://github.com/linkiez/DXF-Renewed/commit/a364044))
* fix(ci): enable corepack for yarn 4 support in github actions ([59048b9](https://github.com/linkiez/DXF-Renewed/commit/59048b9))
* fix(ci): remove yarn cache from setup-node to enable corepack first ([ba3186c](https://github.com/linkiez/DXF-Renewed/commit/ba3186c))
* fix(ci): skip eslint temporarily - babel parser incompatible with ts+esm ([37276c4](https://github.com/linkiez/DXF-Renewed/commit/37276c4))
* fix(ci): use node 22.x for semantic-release v25 compatibility ([c20e69b](https://github.com/linkiez/DXF-Renewed/commit/c20e69b))
* fix(release): simplify to use only main branch for releases ([705b77d](https://github.com/linkiez/DXF-Renewed/commit/705b77d))
* fix(release): use https repository URL ([77e9a17](https://github.com/linkiez/DXF-Renewed/commit/77e9a17))
* chore: sync package and release configuration ([e391038](https://github.com/linkiez/DXF-Renewed/commit/e391038))
* chore: update yarn.lock ([6a7fb91](https://github.com/linkiez/DXF-Renewed/commit/6a7fb91))
* docs: add warning about development status to README ([def8658](https://github.com/linkiez/DXF-Renewed/commit/def8658))
* feat: adicionar tipos para entidades hatch, viewport e ole2frame ([e1c7b8f](https://github.com/linkiez/DXF-Renewed/commit/e1c7b8f))
* feat: implement DIMENSION rendering with DIMSTYLE support (Phases 1 and 2) ([37b7e62](https://github.com/linkiez/DXF-Renewed/commit/37b7e62))
* feat: implement Phase 3 - advanced DIMENSION rendering with arrows and extension lines ([02ff584](https://github.com/linkiez/DXF-Renewed/commit/02ff584))
* feat: implement semantic-release and translate project to en_US ([e5b880d](https://github.com/linkiez/DXF-Renewed/commit/e5b880d))
* feat(lint): add typescript eslint support and fix lint errors ([df13e74](https://github.com/linkiez/DXF-Renewed/commit/df13e74))
* refactor: consolidar ColorRGB type em types/common ([4a0bd43](https://github.com/linkiez/DXF-Renewed/commit/4a0bd43))
* refactor: consolidar types e interfaces em src/types/ ([604aa5c](https://github.com/linkiez/DXF-Renewed/commit/604aa5c))
* refactor: eliminar interfaces duplicadas de arquivos principais ([3429635](https://github.com/linkiez/DXF-Renewed/commit/3429635))
* refactor: remover extrusionZ duplicado de InsertEntity ([3a1fcfd](https://github.com/linkiez/DXF-Renewed/commit/3a1fcfd))
* refactor: simplificar types com extends pattern ([ea08247](https://github.com/linkiez/DXF-Renewed/commit/ea08247))


### BREAKING CHANGE

* All commits must now follow Conventional Commits format in English

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.3.1](https://github.com/skymakerolof/dxf/compare/v5.3.0...v5.3.1) (2025-09-01)

### Bug Fixes

* properly flip LWPolyline when extrusionZ < 0 in toSVG ([#148](https://github.com/skymakerolof/dxf/issues/148)) ([5be9279](https://github.com/skymakerolof/dxf/commit/5be927947d1bdce828e31b75c45835fb94180903))

## [5.3.0](https://github.com/skymakerolof/dxf/compare/v5.2.0...v5.3.0) (2025-09-01)

### Features

* ole2frame entity ([#150](https://github.com/skymakerolof/dxf/issues/150)) ([4a00841](https://github.com/skymakerolof/dxf/commit/4a008417b5bc49a39c841f5845db4c80a980cc1d))

## [5.2.0](https://github.com/skymakerolof/dxf/compare/v5.1.1...v5.2.0) (2024-11-04)

### [5.1.1](https://github.com/skymakerolof/dxf/compare/v5.1.0...v5.1.1) (2024-08-30)

### Bug Fixes

* ignoring colorNumber when layer is not found ([#140](https://github.com/skymakerolof/dxf/issues/140)) ([a930aa1](https://github.com/skymakerolof/dxf/commit/a930aa1fed526e2557f343775fefaecff5c1f782)), closes [#139](https://github.com/skymakerolof/dxf/issues/139)

## [5.1.0](https://github.com/skymakerolof/dxf/compare/v5.0.1...v5.1.0) (2023-08-08)

### Features

* add support for polyfaceMesh outline rendering ([#138](https://github.com/skymakerolof/dxf/issues/138)) ([38fd3a6](https://github.com/skymakerolof/dxf/commit/38fd3a695644f1b142789d1d3e3828ee8a458d1f))

### Bug Fixes

* spline boundary path data ([#134](https://github.com/skymakerolof/dxf/issues/134)) ([4ea2312](https://github.com/skymakerolof/dxf/commit/4ea2312892ef73eed3690fc772ec0f2f8619beef))

### [5.0.1](https://github.com/skymakerolof/dxf/compare/v5.0.0...v5.0.1) (2023-06-08)

### Bug Fixes

* hatch with polyline points only returning y coordinate ([#132](https://github.com/skymakerolof/dxf/issues/132)) ([948dbbc](https://github.com/skymakerolof/dxf/commit/948dbbcd5e03ac064020b9c1d0b231dced895e7a)), closes [#130](https://github.com/skymakerolof/dxf/issues/130)

## [5.0.0](https://github.com/skymakerolof/dxf/compare/v4.7.0...v5.0.0) (2022-12-05)

### ⚠ BREAKING CHANGES

* **Hatch:** Renamed hatch split property points to controlPoints
* **Hatch:** Renamed polyline "has bulge flag" from bulge to hasBulge

### Features

* **Hatch:** rename hatch->spline points to controlPoints ([#117](https://github.com/skymakerolof/dxf/issues/117)) ([70e9a5d](https://github.com/skymakerolof/dxf/commit/70e9a5d46906f2f1984366df24adf80fd97c454b))
* LTYPE table parsing ([#121](https://github.com/skymakerolof/dxf/issues/121)) ([6178746](https://github.com/skymakerolof/dxf/commit/6178746ee887eb1fbacb060cfc952d07d5264173))

### Bug Fixes

* **Hatch:** bulge value for each point instead of only writing it in the loop level ([#122](https://github.com/skymakerolof/dxf/issues/122)) ([879808c](https://github.com/skymakerolof/dxf/commit/879808cde1d369b36c731b85ac4596f7ed032efe))
* **Hatch:** rename bulge to hasBulge ([#118](https://github.com/skymakerolof/dxf/issues/118)) ([3cf60c6](https://github.com/skymakerolof/dxf/commit/3cf60c6a1f5cc1711a315222a87a75fc5677041a))

## [4.7.0](https://github.com/skymakerolof/dxf/compare/v4.6.3...v4.7.0) (2022-09-22)

### Features

* add hatch entity to parser ([#107](https://github.com/skymakerolof/dxf/issues/107)) ([362e23a](https://github.com/skymakerolof/dxf/commit/362e23a2cc9e34ecfd1345d576a2138c375fcecb))
* add layout & paper space to parser ([#106](https://github.com/skymakerolof/dxf/issues/106)) ([d0a6d19](https://github.com/skymakerolof/dxf/commit/d0a6d19e34645aad208642105d381a76f97c5902))
* attrib & attdef parsing ([#109](https://github.com/skymakerolof/dxf/issues/109)) ([7a10e4b](https://github.com/skymakerolof/dxf/commit/7a10e4bd7a752a6adbd72f3a0b0e5e5ec7110f3d))
* viewport & vport parsing ([#108](https://github.com/skymakerolof/dxf/issues/108)) ([f26642e](https://github.com/skymakerolof/dxf/commit/f26642e8e338c4e85cbc1ab135e0c7f0f68029f6))

### Bug Fixes

* handle color value 256 ([#104](https://github.com/skymakerolof/dxf/issues/104)) ([80e9fa1](https://github.com/skymakerolof/dxf/commit/80e9fa119afaf5b3e5f4dcd73583c4a63b0876a8))

## 4.6.3

* Remove dependency on pretty-data (#85)

## 4.6.2

* Remove import of unused parts of lodash

## 4.4.4

* Fix typo in README

## 4.3.0

* #51 Fix bug when transforming empty bounding box

## 4.2.4

* #50 Fix knot piecewise beziers

## 4.2.3

* More accurate bounding boxes for arcs and ellipses (#48)

## 4.2.2

* Bump eslint-utils from 1.3.1 to 1.4.2
* Add HATCH to unsupported SVG entities in README

## 4.2.1

* Use main lodash package due to security issue(s)

## 4.2.0

* README updates

## 4.1.1

* #issue42 support entities that have extrusionZ === -1 defined on the entity itself (as opposed to the transform).

## 4.1.0

* CIRCLE DXF entities now produce native <circle /> SVG elements.
* ELLIPSE DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.
* ARC DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.

## 4.0.1

* Browser example uses Helper

## 4.0.0

* Use ES6 string interpolation in SVG generation.
* Use native SVG <circle /> elements for CIRCLE entities.
* Use SVG <g/> elements with a transform attribute for native and interpolated entities.
* Add a Helper object to simplify the workflow.
* The SVG output uses a root transform to flip the Y coordinates.

## 3.6.0

* NPM audit fixes.
* Remove support for Node v6 in Travis.
* Node engine is now >= 8.9.0.
