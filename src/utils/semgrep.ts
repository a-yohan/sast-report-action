import * as fs from 'fs'
import { getCurrentDateTimeIso } from './date'

import {
  GenericResult,
  Repo,
  SemgrepJson,
  SemgrepResult
} from '@src/interfaces'

export function denormalizeSemgrepResult(
  semgrep: SemgrepJson,
  repo: Repo
): GenericResult[] {
  return semgrep.results.map(scanResultTransformer(repo))
}

export function semgrepfromJson(path: string): SemgrepJson {
  const jsonText = fs.readFileSync(path).toString('utf-8')
  return JSON.parse(jsonText) as SemgrepJson
}

function scanResultTransformer(repo: Repo): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const version = require('../../package.json').version as string
  const [major] = version.split('.')
  return function (sr: SemgrepResult): GenericResult {
    return {
      timestamp: getCurrentDateTimeIso(),
      repo,
      rule: {
        id: sr.check_id,
        name: sr.check_id,
        description: sr.extra.message,
        category: sr.extra.metadata.category,
        severity: sr.extra.severity
      },
      code: {
        fingerprint: sr.extra.fingerprint,
        snippet: sr.extra.lines,
        path: sr.path,
        // uri: `${repo.uri}/blob/${repo.sha}/${sr.path}#L${sr.start.line}-L${sr.end.line}`,
        start: {
          column: sr.start.col,
          line: sr.start.line
        },
        end: {
          column: sr.end.col,
          line: sr.end.line
        }
      },
      v: major
    }
  }
}
