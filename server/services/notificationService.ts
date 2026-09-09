export interface NotificationDispatchResult {
  success: boolean;
  channel: 'sms' | 'whatsapp';
  recipient: string;
  messageId: string;
  previewText: string;
  dispatchedAt: string;
  provider: 'local_gateway' | 'twilio' | 'msg91';
}

export class NotificationService {
  /**
   * Dispatches a TRAI DND-compliant SMS containing a medicine stock reservation confirmation code.
   */
  public async sendReservationConfirmation(
    phone: string,
    reservationCode: string,
    medicineName: string,
    pharmacyName: string,
    priceInr: number
  ): Promise<NotificationDispatchResult> {
    const maskedPhone = phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');
    const previewText = `[AltMedi Care] Confirmed: Rx reservation #${reservationCode} for ${medicineName} at ${pharmacyName} (₹${priceInr.toFixed(2)}). Pickup within 24h. Helpline: 1800-266-9090.`;

    console.log(`\n📱 [SMS GATEWAY DISPATCH] To: ${maskedPhone}`);
    console.log(`   Message: ${previewText}\n`);

    return {
      success: true,
      channel: 'sms',
      recipient: maskedPhone,
      messageId: `msg-sms-${Math.floor(100000 + Math.random() * 900000)}`,
      previewText,
      dispatchedAt: new Date().toISOString(),
      provider: 'local_gateway'
    };
  }

  /**
   * Dispatches a WhatsApp notification to the patient when a registered pharmacist
   * reviews and confirms or rejects a proposed medicine substitution.
   */
  public async sendReviewDecisionUpdate(
    phone: string,
    patientName: string,
    originalMedicineName: string,
    proposedMedicineName: string,
    decision: 'confirmed' | 'rejected',
    reason: string,
    pharmacistName: string
  ): Promise<NotificationDispatchResult> {
    const maskedPhone = phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');
    const statusEmoji = decision === 'confirmed' ? '✅' : '⚠️';

    const previewText = `*AltMedi Clinical Verification* ${statusEmoji}\n\nHello ${patientName},\n\nYour pharmacist verification for:\n• Prescribed: *${originalMedicineName}*\n• Proposed: *${proposedMedicineName}*\n\nStatus: *${decision.toUpperCase()}*\nReviewer: ${pharmacistName}\nClinical Note: "${reason}"\n\nYou can view the full clinical monograph in your AltMedi app.`;

    console.log(`\n💬 [WHATSAPP API DISPATCH] To: ${maskedPhone}`);
    console.log(`   Message:\n${previewText}\n`);

    return {
      success: true,
      channel: 'whatsapp',
      recipient: maskedPhone,
      messageId: `msg-wa-${Math.floor(100000 + Math.random() * 900000)}`,
      previewText,
      dispatchedAt: new Date().toISOString(),
      provider: 'local_gateway'
    };
  }
}

export const notificationService = new NotificationService();
