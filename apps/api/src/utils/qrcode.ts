import QRCode from 'qrcode'

export async function generateQRCode(equipmentId: string): Promise<string> {
  const url = `${process.env.QR_CODE_BASE_URL || 'http://localhost:3000/equipment/public'}/${equipmentId}`
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  return qrDataUrl
}
