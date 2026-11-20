import React from 'react';
import { AmWahSupportButton, WHATSAPP_NUMBER, WHATSAPP_INT_NUMBER, getWhatsAppUrl, formatWhatsAppNumber } from './AmWahSupportButton';

export { WHATSAPP_NUMBER, WHATSAPP_INT_NUMBER, getWhatsAppUrl, formatWhatsAppNumber, AmWahSupportButton };

// Backward-compatible alias: WhatsAppButton is now the official Am Wah Technical Support Button
export const WhatsAppButton: React.FC = () => {
  return <AmWahSupportButton />;
};

export default WhatsAppButton;