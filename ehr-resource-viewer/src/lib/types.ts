export interface EHRResourceIdentifier {
  key: string;           // Unique identifier for the resource
  uid: string;           // User/system identifier  
  patientId: string;     // Patient this resource belongs to
}

export enum ProcessingState {
  PROCESSING_STATE_UNSPECIFIED = "PROCESSING_STATE_UNSPECIFIED",
  PROCESSING_STATE_NOT_STARTED = "PROCESSING_STATE_NOT_STARTED", 
  PROCESSING_STATE_PROCESSING = "PROCESSING_STATE_PROCESSING",
  PROCESSING_STATE_COMPLETED = "PROCESSING_STATE_COMPLETED",
  PROCESSING_STATE_FAILED = "PROCESSING_STATE_FAILED",
}

export enum FHIRVersion {
  FHIR_VERSION_UNSPECIFIED = "FHIR_VERSION_UNSPECIFIED",
  FHIR_VERSION_R4 = "FHIR_VERSION_R4",
  FHIR_VERSION_R4B = "FHIR_VERSION_R4B", 
}

export interface EHRResourceMetadata {
  state: ProcessingState;           // Current processing status
  createdTime: string;              // When created (ISO string)
  fetchTime: string;                // When fetched (ISO string) 
  processedTime?: string;           // When processed (optional, ISO string)
  identifier: EHRResourceIdentifier; // Unique identifiers
  resourceType: string;             // Type of medical resource
  version: FHIRVersion;             // FHIR standard version
}

export interface EHRResourceJson {
  metadata: EHRResourceMetadata;    // Resource metadata
  humanReadableStr: string;         // Human-friendly description
  aiSummary?: string;               // AI-generated summary (optional)
}

export interface ResourceWrapper {
  resource: EHRResourceJson;        // The main resource data
}