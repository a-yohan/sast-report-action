import * as core from '@actions/core'
import { GenericResult, SemgrepJson, Repo } from './interfaces'
import { actionUtils, semgrepUtils } from './utils'
import { ElasticsearchClient } from './elastic'

async function run(): Promise<void> {
  const jsonFile: string = core.getInput('json_file', { required: true })
  const reportUrl = core.getInput('kibana_base_path', { required: true })
  const es = new ElasticsearchClient({
    url: core.getInput('url', { required: true }),
    token: core.getInput('token'),
    username: core.getInput('username'),
    password: core.getInput('password'),
    tokenType: core.getInput('token_type'),
    caFingerprint: core.getInput('ca_fingerprint'),
    disableSslValidation: core.getBooleanInput('disable_ssl_validation')
  })
  core.startGroup('repo')
  const repo: Repo = actionUtils.getRepoFromEnv()
  core.debug(`name: ${repo.name}`)
  core.debug(`sha: ${repo.sha ?? ''}`)
  core.debug(`ref: ${repo.ref ?? ''}`)
  core.endGroup()
  core.info(`reading semgrep result from ${jsonFile}`)
  const semgrepJson: SemgrepJson = semgrepUtils.semgrepfromJson(jsonFile)
  core.info('processing data')
  const result: GenericResult[] = semgrepUtils.denormalizeSemgrepResult(
    semgrepJson,
    repo
  )
  core.info(`sending ${result.length} records`)
  await es.send(result)
  core.info(
    `${reportUrl}?_g=(filters:!((query:(match_phrase:(repo.sha:${repo.sha})))))`
  )
}

run().catch((error) => {
  core.setFailed(error)
})
