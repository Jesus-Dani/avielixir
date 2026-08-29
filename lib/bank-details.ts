export function getBankDetails() {
  return {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "",
  };
}
