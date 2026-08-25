// Type surface for the shared transport policy, so the production database test
// evaluates the same predicate as the source and inventory validators.

export declare const HTTP_ONLY_OFFICIAL_WAIVER_KEY: 'httpOnlyOfficial'

export type HttpOnlyOfficialWaiver = {
  issuerDomain: string
  httpsCheckedAt: string
  httpsUnavailableEvidence: string
}

export type RecordedUrlTransportInput = {
  url: unknown
  official: unknown
  waiver: unknown
  prefix: string
  field: string
  today?: Date | string
  httpsRequiredMessage: string
}

export declare const evaluateRecordedUrlTransport: (
  input: RecordedUrlTransportInput,
) => { errors: string[]; warnings: string[] }

export declare const recordedUrlTransportIsValid: (input: RecordedUrlTransportInput) => boolean
