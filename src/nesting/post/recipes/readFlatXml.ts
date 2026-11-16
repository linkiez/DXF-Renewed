/** A parsed element: scalar text or a map of child elements (repeated tags become lists). */
export type XmlNode = string | { [tag: string]: XmlNode | XmlNode[] }

/** The document is empty, unbalanced or not XML. */
export class RecipeXmlError extends Error {
  constructor(detail: string) {
    super(`Invalid recipe XML: ${detail}`)
    this.name = 'RecipeXmlError'
  }
}

const TOKEN = /<\?[^>]*\?>|<!--[\s\S]*?-->|<\/([A-Za-z0-9_.:-]+)\s*>|<([A-Za-z0-9_.:-]+)\s*\/>|<([A-Za-z0-9_.:-]+)\s*>|([^<]+)/g

const decode = (text: string): string =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

interface Frame {
  tag: string
  children: Array<[string, XmlNode]>
  text: string
}

function add(map: { [tag: string]: XmlNode | XmlNode[] }, tag: string, node: XmlNode): void {
  const existing = map[tag]
  if (existing === undefined) map[tag] = node
  else map[tag] = Array.isArray(existing) ? [...existing, node] : [existing, node]
}

function close(frame: Frame): XmlNode {
  if (frame.children.length === 0) return decode(frame.text.trim())
  const map: { [tag: string]: XmlNode | XmlNode[] } = {}
  for (const [tag, node] of frame.children) add(map, tag, node)
  return map
}

interface Parser {
  readonly stack: Frame[]
  root: XmlNode | undefined
}

function selfClose(parser: Parser, tag: string): void {
  const parent = parser.stack[parser.stack.length - 1]
  if (!parent) throw new RecipeXmlError('self-closing root')
  parent.children.push([tag, ''])
}

function closeTag(parser: Parser, tag: string): void {
  const frame = parser.stack.pop()
  if (!frame || frame.tag !== tag) throw new RecipeXmlError(`unexpected </${tag}>`)
  const node = close(frame)
  const parent = parser.stack[parser.stack.length - 1]
  if (parent) parent.children.push([frame.tag, node])
  else parser.root = node
}

function addText(parser: Parser, content: string): void {
  const parent = parser.stack[parser.stack.length - 1]
  if (parent) parent.text += content
  else if (content.trim() !== '') throw new RecipeXmlError('text outside the root element')
}

/**
 * Read the flat, machine-written XML of the Talvi tool files without a parser dependency.
 *
 * Nested tags become nested maps, repeated sibling tags become a list in order and scalar text is trimmed. There are
 * no attributes or mixed content in these files. The root element is returned as its contents.
 *
 * @param text - Document text.
 * @returns The contents of the root element.
 * @throws {RecipeXmlError} When the document is empty, unbalanced or has no root element.
 */
export function readFlatXml(text: string): XmlNode {
  const parser: Parser = { stack: [], root: undefined }
  for (const match of text.matchAll(TOKEN)) {
    const [, closing, selfClosing, opening, content] = match
    if (opening) parser.stack.push({ tag: opening, children: [], text: '' })
    else if (selfClosing) selfClose(parser, selfClosing)
    else if (closing) closeTag(parser, closing)
    else if (content) addText(parser, content)
  }
  if (parser.stack.length > 0 || parser.root === undefined) throw new RecipeXmlError('unclosed or missing root element')
  return parser.root
}
