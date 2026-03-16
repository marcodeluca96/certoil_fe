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
  address: string;
  zipCode: string;
  city: string;
  province: string;
  vatNumber: string;
  taxCode: string;
  email: string;
  certifiedEmail: string;
  phoneNumber: string;
  website: string;
  oilData: OilData[];
  certificationCode: string;
  certificationCreatedAt: string;
  certificatePath: string;
  notarizationId: string;
  isExpired: boolean;
  deleteLockDate: string;
}

export interface CertificationResponse {
  success: boolean;
  message: string;
  data: Certification[];
  totalCount: number;
}

export interface CertificationState {
  items: Certification[];
  lockMetadata: LockMetadataResponse[];
  loading: boolean;
  loadingLockMetadata: string | null;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
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

export interface CertificationHistoryResponse {
  success: boolean;
  message: string;
  data: {
    companyId: number;
    companyName: string;
    certificationId: number;
    certificationCode: string;
    certificationCreatedAt: string;
    certificatePath: string;
    certificationNote: string | null;
    certificationExpiryDate: string;
  }[];
}
