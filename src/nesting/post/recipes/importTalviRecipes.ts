import { message } from '../machine/messages'
import { parseTalviRecipeName } from './parseTalviRecipeName'
import { readFlatXml, RecipeXmlError } from './readFlatXml'
import { recipeFromTree } from './recipeFromTree'
import type { RecipeFile, RecipeImport, RecipeIssue, TalviRecipe } from './types'

/**
 * Import Talvi recipes from the text of their tool files.
 *
 * The library reads no file. Each file becomes one recipe in the input order; a file whose name or content cannot be
 * read is reported once and the others are kept.
 *
 * @param files - Name and text of each tool file.
 * @returns The recipes and the issues.
 */
export function importTalviRecipes(files: readonly RecipeFile[]): RecipeImport {
  const recipes: TalviRecipe[] = []
  const issues: RecipeIssue[] = []
  for (const file of files) {
    const name = parseTalviRecipeName(file.name)
    if (!name) {
      issues.push({ file: file.name, code: 'RECIPE_NAME_UNRECOGNIZED', message: message('RECIPE_NAME_UNRECOGNIZED', { file: file.name }) })
      continue
    }
    try {
      const result = recipeFromTree(file.name, name, readFlatXml(file.text))
      if ('recipe' in result) recipes.push(result.recipe)
      else issues.push(result.issue)
    } catch (error) {
      if (!(error instanceof RecipeXmlError)) throw error
      issues.push({ file: file.name, code: 'RECIPE_XML_INVALID', message: message('RECIPE_XML_INVALID', { file: file.name }) })
    }
  }
  return { recipes, issues }
}
