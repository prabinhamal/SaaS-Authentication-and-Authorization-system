import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
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


export interface WebAuthnVerificationInput {
    challengeId: string;
    response: AuthenticationResponseJSON;
}

export interface WebAuthnEnrollmentVerificationResult {
  verified: true;
}


export interface WebAuthAuthenticationResult {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}



export interface WebAuthnVerificationResult {
  verified: true;
}

export interface WebAuthnChallengeResult {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface WebAuthnEnrollmentVerificationResult extends WebAuthnVerificationResult {}

export interface WebAuthDisableResult extends WebAuthnChallengeResult {}



export interface WebAuthnDisableVerificationInput {
  challengeId: string;
  response: AuthenticationResponseJSON;
}
