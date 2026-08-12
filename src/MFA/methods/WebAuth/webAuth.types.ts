import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

export interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
}

export interface WebAuthnEnrollmentResult {
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export interface WebAuthnEnrollmentVerificationInput {
  challengeId: string;
  response: RegistrationResponseJSON;
}

export interface WebAuthnEnrollmentVerificationResult {
  verified: true;
}

export interface WebAuthnVerificationInput {
  challengeId: string;
  response: AuthenticationResponseJSON;
}

export interface WebAuthnVerificationResult {
  verified: true;
}