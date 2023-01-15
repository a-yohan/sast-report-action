import {
  IndicesIndexSettings,
  MappingTypeMapping
} from '@elastic/elasticsearch/lib/api/types'

export const mappings: MappingTypeMapping = {
  dynamic: true,
  runtime: {
    'code.url': {
      type: 'keyword',
      script: {
        source: `
def uri = doc['repo.uri'].value;
def sha = doc['repo.sha'].value;
def path = doc['code.path.keyword'].value;
def start = doc['code.start.line'].value;
def end = doc['code.end.line'].value;

emit(uri + "/blob/" + sha + "/" + path + "#L"+ start + "-L" + end);
        `
      }
    }
  },
  properties: {
    repo: {
      properties: {
        name: { type: 'keyword' },
        uri: { type: 'keyword' },
        sha: { type: 'keyword' },
        ref: { type: 'keyword' }
      }
    },
    rule: {
      properties: {
        id: { type: 'keyword' },
        name: { type: 'match_only_text' },
        category: { type: 'keyword' },
        severity: { type: 'keyword' },
        technology: { type: 'keyword' },
        tags: { type: 'keyword' },
        description: { type: 'match_only_text' }
      }
    },
    code: {
      properties: {
        fingerprint: { type: 'keyword' },
        snippet: { type: 'match_only_text' }
      }
    },
    v: { type: 'keyword' }
  }
}

export const settings: IndicesIndexSettings = {
  codec: 'best_compression',
  auto_expand_replicas: '0-1'
}
