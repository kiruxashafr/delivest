export interface IAuthCodeSenderUCaller {
  send(authCodeId: string): Promise<void>;
}
