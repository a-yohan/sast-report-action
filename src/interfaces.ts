export interface ClientOptions {
  url: string
  username?: string
  password?: string
  token?: string
  tokenType?: string
  caFingerprint?: string
  disableSslValidation?: boolean
}

export interface GenericResult {
  repo: Repo
  rule: Rule
  code: {
    fingerprint: string
    path: string
    snippet: string
    start: CodePosition
    end: CodePosition
  }
  timestamp: string
  tool?: Tool
  v: string
  [key: string]: any
}

interface CodePosition {
  line: number
  column: number
}

export interface Tool {
  name: string
  version?: string
  [key: string]: any
}

export interface Repo {
  name: string
  sha: string
  uri: string
  ref?: string
  [key: string]: any
}

export interface Rule {
  id: string
  name: string
  description: string
  category: string
  severity: string
  refrerences?: string[]
  technology?: string[]
  tags?: string[]
  [key: string]: any
}

export interface SemgrepJson {
  results: SemgrepResult[]
  version: string
}

export interface SemgrepResult {
  check_id: string
  path: string
  extra: {
    fingerprint: string
    lines: string
    message: string
    metadata: {
      [key: string]: any
      category: string
      technology?: string[]
      references?: string[]
      subcategory?: string[]
      cwe?: string[]
      confidence?: string
      likelihood?: string
      impact?: string
    }
    metavars?: any
    severity: string
    [key: string]: any
  }
  start: {
    col: number
    line: number
    offset: number
  }
  end: {
    col: number
    line: number
    offset: number
  }
  [key: string]: any
}
