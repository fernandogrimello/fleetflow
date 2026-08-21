import { prisma } from '../../lib/prisma'

export async function getRanking() {
  const equipments = await prisma.equipment.findMany({
    include: {
      rentals: { where: { checkinDate: { not: null } } },
    },
  })

  const ranking = equipments
    .map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      status: e.status,
      totalRentals: e.rentals.length,
      totalRevenue: e.rentals.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
    }))
    .sort((a, b) => b.totalRentals - a.totalRentals)

  return {
    mostRented: ranking.slice(0, 5),
    leastRented: [...ranking].sort((a, b) => a.totalRentals - b.totalRentals).slice(0, 5),
  }
}

export async function getOccupancy() {
  const equipments = await prisma.equipment.findMany({
    where: { status: { not: 'DECOMMISSIONED' } },
    include: { rentals: { where: { checkinDate: { not: null } } } },
  })

  const result = equipments.map(e => {
    const totalDaysRented = e.rentals.reduce((sum, r) => sum + (r.totalDays || 0), 0)
    const daysSinceCreation = Math.max(1, Math.ceil(
      (Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ))
    const occupancyRate = Number(((totalDaysRented / daysSinceCreation) * 100).toFixed(2))

    return {
      id: e.id,
      name: e.name,
      category: e.category,
      status: e.status,
      totalDaysRented,
      daysSinceCreation,
      occupancyRate,
    }
  })

  return result.sort((a, b) => b.occupancyRate - a.occupancyRate)
}

export async function getMaintenanceCostByCategory() {
  const maintenances = await prisma.maintenance.findMany({
    include: { parts: true, equipment: { select: { category: true } } },
  })

  const byCategory: Record<string, { total: number; count: number }> = {}

  for (const m of maintenances) {
    const category = m.equipment.category
    const labor = Number(m.laborCost || 0)
    const parts = m.parts.reduce((sum, p) => sum + p.quantity * Number(p.unitPrice), 0)
    const total = labor + parts

    if (!byCategory[category]) byCategory[category] = { total: 0, count: 0 }
    byCategory[category].total += total
    byCategory[category].count += 1
  }

  return Object.entries(byCategory).map(([category, data]) => ({
    category,
    totalCost: Number(data.total.toFixed(2)),
    maintenanceCount: data.count,
    averageCost: Number((data.total / data.count).toFixed(2)),
  })).sort((a, b) => b.averageCost - a.averageCost)
}

export async function getROIRanking() {
  const equipments = await prisma.equipment.findMany({
    include: {
      rentals: { where: { checkinDate: { not: null } } },
      maintenances: { include: { parts: true } },
      insurance: true,
    },
  })

  const result = equipments.map(e => {
    const totalRevenue = e.rentals.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0)
    const totalMaintenanceCost = e.maintenances.reduce((sum, m) => {
      return sum + Number(m.laborCost || 0) + m.parts.reduce((ps, p) => ps + p.quantity * Number(p.unitPrice), 0)
    }, 0)
    const totalInsuranceCost = e.insurance ? Number(e.insurance.premium) : 0
    const purchasePrice = Number(e.purchasePrice)
    const netProfit = totalRevenue - purchasePrice - totalMaintenanceCost - totalInsuranceCost
    const roi = purchasePrice > 0 ? Number(((netProfit / purchasePrice) * 100).toFixed(2)) : 0

    return { id: e.id, name: e.name, category: e.category, status: e.status, purchasePrice, totalRevenue, netProfit, roi }
  })

  return {
    best: result.sort((a, b) => b.roi - a.roi).slice(0, 5),
    worst: result.sort((a, b) => a.roi - b.roi).slice(0, 5),
  }
}
