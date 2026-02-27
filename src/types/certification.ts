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
  documentPath: string;
  notarizationId: string;
}

export interface CertificationResponse {
  success: boolean;
  message: string;
  data: Certification[];
}

export interface CertificationState {
  items: Certification[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}
