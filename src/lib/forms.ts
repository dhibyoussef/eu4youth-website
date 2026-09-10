import { cmsApi } from '../cms/cmsApi'

export type PublicFormKind = 'contact' | 'newsletter'

type PublicFormPayload = Record<string, string | boolean>

export class FormSubmitError extends Error {
  code: 'unconfigured' | 'invalid-endpoint' | 'network' | 'rejected'

  constructor(code: FormSubmitError['code'], message: string) {
    super(message)
    this.name = 'FormSubmitError'
    this.code = code
  }
}

export { FormSubmitError as FormSubmissionError }

const endpoints: Record<PublicFormKind, string> = {
  contact: import.meta.env.VITE_CONTACT_ENDPOINT?.trim() || '/api/forms/contact',
  newsletter: import.meta.env.VITE_NEWSLETTER_ENDPOINT?.trim() || '/api/forms/newsletter',
}

export function isPublicFormReady(kind: PublicFormKind): boolean {
  return Boolean(endpoints[kind])
}

export const isPublicFormConfigured = isPublicFormReady

function formsPath(kind: PublicFormKind): string {
  const configured = endpoints[kind]
  if (!configured) {
    throw new FormSubmitError('unconfigured', `${kind} endpoint is not configured`)
  }
  if (configured.startsWith('/api/')) return configured.slice('/api'.length)
  const endpoint = new URL(configured, window.location.origin)
  if (endpoint.origin !== window.location.origin) {
    throw new FormSubmitError(
      'invalid-endpoint',
      `${kind} endpoint must be served from the same origin`,
    )
  }
  return `${endpoint.pathname}${endpoint.search}`
}

/**
 * POST a public form to the CMS API (proxied /api → :8040).
 * The `website` field is a honeypot: bots get success, payload is not sent.
 */
export async function sendPublicForm(
  kind: PublicFormKind,
  payload: PublicFormPayload,
): Promise<{ trapped: boolean }> {
  if (String(payload.website ?? '').trim()) return { trapped: true }

  const { website: _honeypot, ...safePayload } = payload
  void _honeypot

  try {
    const { data } = await cmsApi.post(formsPath(kind), {
      formType: kind,
      source: window.location.pathname,
      submittedAt: new Date().toISOString(),
      ...safePayload,
    })
    if (data?.ok !== true) {
      throw new FormSubmitError('rejected', `${kind} endpoint did not confirm acceptance`)
    }
    return { trapped: false }
  } catch (error) {
    if (error instanceof FormSubmitError) throw error
    throw new FormSubmitError(
      'network',
      error instanceof Error ? error.message : 'Network request failed',
    )
  }
}

export const submitPublicForm = sendPublicForm
