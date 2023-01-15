import es from '@elastic/elasticsearch'
import { dateUtils } from './utils'
import { ClientOptions, GenericResult } from './interfaces'
import { mappings, settings } from './es-index-options'

const MAX_BODY_SIZE: number = 1048576 // 1MB nginx default max upload size
const INDEX_PREFIX: string = 'sast-result'

export class ElasticsearchClient {
  private readonly esClient: es.Client

  constructor(options: ClientOptions) {
    this.esClient = new es.Client(this.validateClientOptions(options))
  }

  private validateClientOptions(opt: ClientOptions): es.ClientOptions {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (opt.token && (opt.password ?? opt.username)) {
      throw new Error(
        'cannot use token with username & password authentication'
      )
    }

    const esClientOptions: es.ClientOptions = {
      node: opt.url
    }
    esClientOptions.tls = {}
    if (
      opt.username !== undefined &&
      opt.username.length > 0 &&
      opt.password !== undefined &&
      opt.password.length > 0
    ) {
      esClientOptions.auth = { username: opt.username, password: opt.password }
    } else if (opt.token !== undefined && opt.token.length > 0) {
      switch (opt.tokenType?.toLowerCase()) {
        case 'apikey':
          esClientOptions.auth = { apiKey: opt.token }
          break
        case 'bearer':
          esClientOptions.auth = { bearer: opt.token }
          break
        default:
          throw new Error('unsuported token type')
      }
    }
    if (opt.disableSslValidation !== undefined) {
      esClientOptions.tls.rejectUnauthorized = !opt.disableSslValidation
    }
    if (opt.caFingerprint !== undefined && opt.caFingerprint.length > 0) {
      esClientOptions.caFingerprint = opt.caFingerprint
    }
    return esClientOptions
  }

  public async send(docs: GenericResult[]): Promise<void> {
    const index: string = await this.initIndex()
    const method: string = 'POST'
    const path: string = `${index}/_bulk`
    let payloads: string[] = []
    const transport = this.esClient.transport
    const headers = { 'content-type': 'application/x-ndjson' }

    let body: string = ''
    for (let i = 0; i < docs.length; i++) {
      const _id = `${docs[i].repo.sha}-${docs[i].code.fingerprint}`
      const data: string = this.esClient.serializer.ndserialize([
        { index: { _id } },
        docs[i]
      ])
      if (body.length + data.length > MAX_BODY_SIZE) {
        payloads.push(body)
        body = data
      } else {
        body += '\n' + data
      }
    }
    payloads.push(body)
    const maxEventListener = process.getMaxListeners()
    do {
      const remaining = payloads.splice(maxEventListener)
      await Promise.all(
        payloads.map(
          async (body) =>
            await transport.request({ method, path, body }, { headers })
        )
      )
      payloads = remaining
    } while (payloads.length > 0)
    // await this.esClient.bulk({ operations: [] })
    await this.esClient.indices.clearCache({ index })
  }

  private async initIndex(): Promise<string> {
    const index = `${INDEX_PREFIX}-${dateUtils.getCurrentDate()}`
    const indexEsists = await this.esClient.indices.exists({ index })
    if (!indexEsists) {
      await this.esClient.indices.create({
        index,
        settings,
        mappings
      })
    }
    return index
  }
}
