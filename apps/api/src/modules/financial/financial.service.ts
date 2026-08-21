import { prisma } from '../../lib/prisma'

export async function getEquipmentROI(equipmentId: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      rentals: { where: { checkinDate: { not: null } } },
      maintenances: { include: { parts: true } },
      insurance: true,
    },
  })
  if (!equipment) throw new Error('Equipamento nao encontrado')

  const totalRevenue = equipment.rentals.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0)

  const totalMaintenanceCost = equipment.maintenances.reduce((sum, m) => {
    const labor = Number(m.laborCost || 0)
    const parts = m.parts.reduce((ps, p) => ps + p.quantity * Number(p.unitPrice), 0)
    return sum + labor + parts
  }, 0)

  const totalInsuranceCost = equipment.insurance ? Number(equipment.insurance.premium) : 0
  const purchasePrice = Number(equipment.purchasePrice)
  const netProfit = totalRevenue - purchasePrice - totalMaintenanceCost - totalInsuranceCost
  const roi = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0

  const downtimeDays = equipment.maintenances.reduce((sum, m) => {
    if (!m.releaseDate) return sum
    const days = Math.ceil((new Date(m.releaseDate).getTime() - new Date(m.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  const lostRevenue = downtimeDays * Number(equipment.dailyRate)

  return {
    equipment: { id: equipment.id, name: equipment.name, category: equipment.category, status: equipment.status },
    purchasePrice,
    totalRevenue,
    totalMaintenanceCost,
    totalInsuranceCost,
    netProfit,
    roi: Number(roi.toFixed(2)),
    roiPositive: roi >= 0,
    totalRentals: equipment.rentals.length,
    downtimeDays,
    lostRevenue,
  }
}
