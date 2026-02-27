export interface OilDataDetail {
  name: string;
  value: string;
  unit: string;
}

export interface OilData {
  formattedValue: string;
  data: OilDataDetail;
}

export interface Certification {
  certificationId: number;
  companyName: string;
  companyId: number;
  oilData: OilData[];
  certificationCode: string;
  certificationCreatedAt: string;
  certificatePath: string;
  notarizationId: string;
}

export interface CertificationResponse {
  success: boolean;
  message: string;
  data: Certification[];
}

export interface CertificationState {
  items: Certification[];
  lockMetadata: LockMetadataResponse[];
  loading: boolean;
  loadingLockMetadata: string | null;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

export interface LockMetadataResponse {
  success: boolean;
  notarizationId: string;
  deleteLockDate: string;
  state: {
    deleteLock: {
      args: number;
      type: string;
    };
    transferLock: {
      type: string;
    };
    updateLock: {
      type: string;
    };
  };
}
