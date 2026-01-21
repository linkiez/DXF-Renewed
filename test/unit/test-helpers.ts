import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// ESM equivalent of __dirname
export const getTestDir = (importMetaUrl: string): string => {
  return dirname(fileURLToPath(importMetaUrl))
}
// Helper to get resource path
export const getResourcePath = (importMetaUrl: string, resourceFile: string): string => {
  const testDir = getTestDir(importMetaUrl)
  return join(testDir, '/../resources', resourceFile)
}