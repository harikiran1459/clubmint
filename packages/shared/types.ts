export interface TelegramIntegrationStatus {
  telegramUser: null | {
    tgUserId: number;
    tgUsername: string | null;
  };

  telegramGroups: {
    tgGroupId: bigint;
    inviteLink: string;
  }[];
}
