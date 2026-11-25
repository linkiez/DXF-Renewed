---
applyTo: '**'
---
# GitHub Copilot Instructions for DXF Project

## 🌐 LANGUAGE STANDARDS

**CRITICAL: All code, technical documentation, and git commits MUST be in English (en_US)**

### ✅ ALWAYS in English

- **Code**: Variables, functions, classes, comments
  ```typescript
  // ✅ Correct
  function parseEntity(entity: Entity): ParsedEntity {
    // Parse DXF entity
    return parsedEntity;
  }

  // ❌ Wrong
  function parseEntidade(entidade: Entity): EntidadeParseada {
    // Parsear entidade DXF
    return entidadeParseada;
  }
  ```

- **Git Commits**: Follow Conventional Commits in English
  ```bash
  ✅ feat(dimension): add DIMSTYLE color support
  ✅ fix(parser): correct POLYLINE bulge parsing
  ✅ docs: update README with installation steps

  ❌ feat(dimension): adicionar suporte a cores DIMSTYLE
  ❌ fix(parser): corrigir parsing de POLYLINE
  ❌ docs: atualizar README com passos de instalação
  ```

- **Technical Documentation**: README.md, API docs, code documentation
  ```markdown
  ✅ ## Installation
  ✅ ### API Reference
  ✅ #### Parameters

  ❌ ## Instalação
  ❌ ### Referência da API
  ❌ #### Parâmetros
  ```

- **Type Definitions**: Interfaces, types, enums
  ```typescript
  ✅ interface DimensionEntity {
    type: 'DIMENSION';
    styleName?: string;
    text?: string;
  }

  ❌ interface EntidadeDimensao {
    tipo: 'DIMENSION';
    nomeEstilo?: string;
    texto?: string;
  }
  ```

- **Error Messages (Technical)**: Log messages, debug output
  ```typescript
  ✅ console.error('Failed to parse DXF entity');
  ✅ throw new Error('Invalid dimension type');

  ❌ console.error('Falha ao parsear entidade DXF');
  ❌ throw new Error('Tipo de dimensão inválido');
  ```

### 🚫 NEVER in Portuguese

- Variable names
- Function names
- Class names
- Type names
- Code comments
- Git commit messages
- Technical documentation files
- API documentation
- Test descriptions
- Configuration files

## 📝 Commit Message Standards

### Format (English only)

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types (English)

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Changes to build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples (English)

```bash
# New feature
feat(dimension): add support for DIMSTYLE colors
feat(parser): implement HATCH entity parsing

# Bug fix
fix(svg): correct arc path calculation
fix(dimension): resolve text rotation issue

# Documentation
docs: update installation instructions
docs(api): add examples for toPolylines method

# Performance
perf(svg): optimize spline rendering
perf(parser): reduce memory allocation in entity handler

# Breaking change
feat!: migrate to pure ESM

BREAKING CHANGE: CommonJS is no longer supported. Use import/export syntax.
```

## 🏗️ Code Standards

### Naming Conventions (English)

```typescript
// ✅ Classes: PascalCase (English)
class DimensionRenderer { }
class EntityParser { }

// ✅ Functions/Methods: camelCase (English)
function parseString(dxfContent: string) { }
function renderToSVG(entity: Entity) { }

// ✅ Variables: camelCase (English)
const entityType = 'LINE';
let boundingBox = new Box2();

// ✅ Constants: UPPER_SNAKE_CASE (English)
const MAX_RECURSION_DEPTH = 100;
const DEFAULT_LINE_WIDTH = 0.5;

// ✅ Interfaces/Types: PascalCase (English)
interface ParsedDXF { }
type EntityHandler = (entity: Entity) => void;

// ✅ Enums: PascalCase (English)
enum DimensionType {
  Linear = 0,
  Aligned = 1,
  Angular = 2
}
```

### Comments (English)

```typescript
// ✅ Correct
/**
 * Convert DXF color number to SVG RGB string
 * @param colorNumber - DXF color code (0-255)
 * @returns RGB color string in format "rgb(r,g,b)"
 */
function colorNumberToSVG(colorNumber?: number): string {
  // Handle special cases: ByBlock (0) and ByLayer (256)
  if (colorNumber === 0 || colorNumber === 256) {
    return 'currentColor';
  }
  // ... rest of implementation
}

// ❌ Wrong
/**
 * Converte número de cor DXF para string RGB SVG
 * @param colorNumber - Código de cor DXF (0-255)
 * @returns String de cor RGB no formato "rgb(r,g,b)"
 */
function colorNumberToSVG(colorNumber?: number): string {
  // Tratar casos especiais: ByBlock (0) e ByLayer (256)
  if (colorNumber === 0 || colorNumber === 256) {
    return 'currentColor';
  }
  // ... resto da implementação
}
```

### File Names (English)

```
✅ dimension-entity.ts
✅ color-utils.ts
✅ entity-parser.ts
✅ svg-renderer.ts

❌ entidade-dimensao.ts
❌ utils-cor.ts
❌ parser-entidade.ts
❌ renderizador-svg.ts
```

## 📚 Documentation Standards

### Technical Documentation (English)

- README.md: English
- API.md: English
- CONTRIBUTING.md: English (with optional Portuguese translation as CONTRIBUTING.pt-BR.md)
- Code comments: English
- JSDoc/TSDoc: English
- Type definitions: English

### User-Facing Content (Can be localized)

- Error messages shown to end users
- UI labels (if applicable)
- User guides (can have translations)

## 🔧 Configuration Files

### Package.json Scripts (English)

```json
{
  "scripts": {
    "build": "node build.mjs",
    "test": "mocha --require tsx",
    "lint": "eslint src test",
    "clean": "rimraf dist/ lib/"
  }
}
```

### Commit Configuration (English)

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code refactoring
        'perf',     // Performance
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI/CD
        'chore',    // Maintenance
        'revert'    // Revert
      ]
    ]
  }
};
```

## ✅ Checklist for AI Assistance

When providing code or suggestions:

- [ ] All variable names in English
- [ ] All function names in English
- [ ] All class names in English
- [ ] All type definitions in English
- [ ] All comments in English
- [ ] All commit messages in English
- [ ] All documentation in English
- [ ] All error messages (technical) in English
- [ ] No Portuguese in code or technical content

## 🎯 Examples

### ✅ Correct Pattern

```typescript
/**
 * Render linear dimension with extension lines and arrows
 */
function renderLinearDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
): BoundsAndElement {
  const arrowSize = dimStyle?.dimAsz ?? 2.5;
  const textHeight = dimStyle?.dimTxt ?? 2.5;

  // Calculate dimension line angle
  const angle = Math.atan2(
    entity.measureEnd.y - entity.measureStart.y,
    entity.measureEnd.x - entity.measureStart.x
  );

  // ... rest of implementation
}
```

### ❌ Wrong Pattern

```typescript
/**
 * Renderizar dimensão linear com linhas de extensão e setas
 */
function renderizarDimensaoLinear(
  entidade: EntidadeDimensao,
  estiloDim?: TabelaEstiloDim,
): LimitesEElemento {
  const tamanhoSeta = estiloDim?.dimAsz ?? 2.5;
  const alturaTexto = estiloDim?.dimTxt ?? 2.5;

  // Calcular ângulo da linha de dimensão
  const angulo = Math.atan2(
    entidade.fimMedicao.y - entidade.inicioMedicao.y,
    entidade.fimMedicao.x - entidade.inicioMedicao.x
  );

  // ... resto da implementação
}
```

## 🌍 Translation Policy

- **Code**: English only, no exceptions
- **Commits**: English only, no exceptions
- **Technical Docs**: English (primary), Portuguese translations optional in separate files
- **User Docs**: Can be localized
- **Comments**: English only
- **Error Messages**: Technical errors in English, user-facing errors can be localized

## 📖 Resources

- [Conventional Commits](https://www.conventionalcommits.org/en/)
- [Semantic Versioning](https://semver.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
