/**
 * Creates an element whose content is set as text, never as markup.
 *
 * @param doc - Owner document.
 * @param tag - Tag name.
 * @param content - Text content.
 * @param className - Optional class name.
 * @returns The element.
 */
export function text(doc: Document, tag: string, content: string, className?: string): HTMLElement {
  const element = doc.createElement(tag)
  element.textContent = content
  if (className) element.className = className
  return element
}
