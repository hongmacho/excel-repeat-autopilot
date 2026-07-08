declare module 'papaparse' {
  interface ParseResult {
    data: unknown[]
    errors: Array<{ type: string; code: string; message: string }>
    meta: { linebreak: string; delimiter: string; truncated: boolean }
  }

  interface ParseConfig {
    header?: boolean
    dynamicTyping?: boolean
    skipEmptyLines?: boolean
    complete?: (results: ParseResult) => void
    error?: (error: { message: string }) => void
  }

  function parse(csv: File | string, config?: ParseConfig): ParseResult
  function unparse(data: unknown[]): string
}
