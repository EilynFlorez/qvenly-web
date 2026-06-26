import { ApiResponse } from '../../core-events/models/event.model';

export type AttendanceType = 'EVENT' | 'ACTIVITY';

export interface QrResponse {
  token: string;
  qrImage: string; // data URI base64 listo para <img src>
}

export interface AttendanceResponse {
  id: number;
  type: AttendanceType;
  referenceId: number;
  userId: number;
  userEmail: string;
  scannedBy: string;
  registeredAt: string;
}

export interface ScanRequest {
  token: string;
}

export { ApiResponse };