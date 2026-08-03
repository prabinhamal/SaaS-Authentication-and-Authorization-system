

export interface DeviceInfo {
  id: string;
  name: string;

  browser: string;
  browserVersion: string;

  os: string;
  osVersion: string;

  ipAddress: string;
  userAgent: string;
}


export interface DeviceRequestInfo {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
}