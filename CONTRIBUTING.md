# Guia de Contribuição

Obrigado por considerar contribuir para este projeto! Este documento fornece diretrizes para facilitar o processo de contribuição.

## 📋 Índice

* [Código de Conduta](#código-de-conduta)
* [Como Contribuir](#como-contribuir)
* [Padrão de Commits](#padrão-de-commits)
* [Processo de Release](#processo-de-release)
* [Desenvolvimento](#desenvolvimento)

## Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e acolhedor para todos.

## Como Contribuir

### Reportar Bugs

Antes de reportar um bug, verifique se já existe uma issue aberta sobre o problema. Se não existir:

1. Crie uma nova issue
2. Use um título claro e descritivo
3. Descreva os passos para reproduzir o problema
4. Inclua exemplos de código quando possível
5. Descreva o comportamento esperado e o comportamento atual

### Sugerir Melhorias

1. Verifique se já existe uma issue sobre a melhoria
2. Crie uma nova issue com o prefixo `[Feature]`
3. Descreva a melhoria em detalhes
4. Explique por que essa melhoria seria útil

### Pull Requests

1. Fork o repositório
2. Crie uma branch a partir de `main`:

   ```bash
   git checkout main
   git checkout -b feature/sua-feature
   ```

3. Faça suas mudanças seguindo o [Padrão de Commits](#padrão-de-commits)
4. Execute os testes: `yarn test`
5. Execute o linter: `yarn lint`
6. Execute a build: `yarn build`
7. Commit suas mudanças (o commitlint validará automaticamente)
8. Push para sua branch
9. Abra um Pull Request para `main`

## Padrão de Commits

Este projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/pt-br/) para automatizar o versionamento e geração de changelogs.

### Formato

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

* **feat**: Nova funcionalidade (gera MINOR release)
* **fix**: Correção de bug (gera PATCH release)
* **docs**: Documentation only
* **style**: Formatting changes (spaces, semicolons, etc)
* **refactor**: Code refactoring (without adding features or fixing bugs)
* **perf**: Performance improvement (generates PATCH release)
* **test**: Adding or correcting tests
* **build**: Changes to build system or dependencies
* **ci**: Changes to CI/CD files
* **chore**: Other changes that don't modify src or test
* **revert**: Reverts a previous commit

### Breaking Changes

To indicate a breaking change (generates MAJOR release):

```text
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used
to extend other config files
```

Or use `!` after the type:

```text
feat!: remove support for Node 6
```

### Examples

```bash
# New feature
feat(dimension): add DIMSTYLE color support

# Bug fix
fix(parser): correct POLYLINE bulge parsing

# Documentation
docs: update README with usage examples

# Performance
perf(svg): optimize spline rendering

# Breaking change
feat!: migrate to pure ESM

BREAKING CHANGE: CommonJS is no longer supported. Use import/export.
```

### Using Commitizen

To make it easier, use Commitizen:

```bash
yarn commit
```

Or with git-cz:

```bash
git add .
yarn commit
```

This will open an interactive prompt to create the commit in the correct format.

## Processo de Release

### Automático (Recomendado)

O projeto usa [semantic-release](https://semantic-release.gitbook.io/) para releases automáticos:

1. Faça commits seguindo o padrão Conventional Commits
2. Faça merge do PR para `main`
3. O GitHub Actions automaticamente:
   * Analisa os commits desde o último release
   * Determina o novo número de versão (MAJOR.MINOR.PATCH)
   * Gera o CHANGELOG.md
   * Cria uma tag Git
   * Cria um GitHub Release
   * Atualiza package.json

### Branches

* **main**: Releases estáveis de produção

### Versionamento

Seguimos [Semantic Versioning](https://semver.org/lang/pt-BR/):

* **MAJOR** (1.0.0 → 2.0.0): Breaking changes
* **MINOR** (1.0.0 → 1.1.0): Novas features compatíveis
* **PATCH** (1.0.0 → 1.0.1): Bug fixes compatíveis

## Desenvolvimento

### Requisitos

* Node.js >= 18.x
* Yarn >= 4.x

### Setup

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dxf.git
cd dxf

# Instale as dependências
yarn install

# Execute os testes
yarn test

# Execute o linter
yarn lint

# Build do projeto
yarn build
```

### Scripts Disponíveis

```bash
# Desenvolvimento
yarn watch              # Watch mode para TypeScript
yarn test:unit:watch    # Watch mode para testes

# Build
yarn build              # Build completo (TypeScript → ESM + CJS)
yarn compile            # Apenas compilação TypeScript
yarn dist               # Build do bundle para browser

# Testes
yarn test               # Executar todos os testes
yarn test:unit          # Executar apenas testes unitários
yarn test:functional    # Executar testes funcionais

# Qualidade
yarn lint               # Executar linter
yarn prettier           # Formatar código
yarn type-check         # Verificar tipos TypeScript

# Commits
yarn commit             # Commit interativo com Commitizen

# Release (não use manualmente, é automático via CI)
yarn semantic-release   # Executar semantic-release
```

### Estrutura do Projeto

```text
dxf/
├── src/                # Código-fonte TypeScript
│   ├── handlers/       # Parsers de entidades e tabelas
│   ├── types/          # Definições de tipos TypeScript
│   └── util/           # Utilitários
├── lib/                # Código compilado (ESM + CJS)
├── test/               # Testes
│   ├── unit/           # Testes unitários
│   └── functional/     # Testes funcionais
├── docs/               # Documentação
└── .github/
    └── workflows/      # GitHub Actions
```

### Workflow de Desenvolvimento

1. **Crie uma issue** descrevendo o que você vai fazer
2. **Crie uma branch** a partir de `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/minha-feature
   ```

3. **Faça suas mudanças** com commits seguindo o padrão
4. **Execute os testes** localmente
5. **Push e crie um PR** para `main`
6. **Aguarde a revisão** e responda aos comentários
7. **Após merge**, o release será feito automaticamente

### Dicas

* Execute `yarn test` antes de fazer push
* Use `yarn commit` para garantir commits no formato correto
* Mantenha PRs focados em uma única feature/fix
* Adicione testes para novas features
* Atualize a documentação quando necessário
* Use TypeScript strict mode
* Siga os padrões de código existentes

## Precisa de Ajuda?

* Abra uma issue com a tag `question`
* Consulte a [documentação](./docs/)
* Veja issues existentes com a tag `good first issue`

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.
