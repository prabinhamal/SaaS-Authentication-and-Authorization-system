
export interface DeviceRequestInfo {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
}

import { UAParser } from "ua-parser-js";
import { DeviceInfo } from "../types";
import tokenService from "./token.service";

class DeviceService {
  getDeviceInfo(request: DeviceRequestInfo): DeviceInfo {
    const parser = new UAParser(request.userAgent);

    const browser = parser.getBrowser();
    const os = parser.getOS();

    return {
      id: request.deviceId ?? tokenService.generateDeviceId(),

      name: this.getDeviceName(browser.name, os.name),

      browser: browser.name ?? "Unknown",
      browserVersion: browser.version ?? "",

      os: os.name ?? "Unknown",
      osVersion: os.version ?? "",

      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    };
  }

  private getDeviceName(
    browser?: string,
    os?: string,
  ): string {
    return `${browser ?? "Unknown"} on ${os ?? "Unknown"}`;
  }
}

export default new DeviceService();