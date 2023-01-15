import { Repo } from '@src/interfaces'

export function getRequiredEnvParam(name: string): string {
  if (process.env[name] != null) {
    return process.env[name] as string
  }
  throw new Error(`env ${name} not exists.`)
}

export function getRepoFromEnv(): Repo {
  const githubRepo = getRequiredEnvParam('GITHUB_REPOSITORY')
  const githubUrl = getRequiredEnvParam('GITHUB_REF')
  return {
    name: githubRepo,
    ref: getRequiredEnvParam('GITHUB_REF'),
    sha: getRequiredEnvParam('GITHUB_SHA'),
    uri: `${githubUrl}/${githubRepo}`
  }
}
