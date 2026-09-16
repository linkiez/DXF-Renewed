declare module '*.cjs' {
  const moduleExports: Record<string, unknown>
  export default moduleExports
}

declare module '*.js' {
  const moduleExports: Record<string, unknown>
  export default moduleExports
}
