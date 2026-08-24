import { prisma } from '../../lib/prisma'

interface UpdateLocationInput {
  latitude: number
  longitude: number
  odometer: number
  source?: string
}

export async function updateLocation(equipmentId: string, data: UpdateLocationInput) {
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
  if (!equipment) throw new Error('Veiculo nao encontrado')

  const location = await prisma.vehicleLocation.create({
    data: {
      equipmentId,
      latitude: data.latitude,
      longitude: data.longitude,
      odometer: data.odometer,
      source: data.source || 'manual',
    },
  })

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { odometer: data.odometer },
  })

  const alert = data.odometer >= equipment.odometerAlert
  if (alert) {
    const existing = await prisma.maintenance.findFirst({
      where: {
        equipmentId,
        description: { contains: 'hodometro' },
        releaseDate: null,
      },
    })

    if (!existing) {
      const admin = await prisma.user.findFirst()
      if (admin) {
        await prisma.maintenance.create({
          data: {
            equipmentId,
            type: 'PREVENTIVE',
            description: `Revisao preventiva por hodometro — ${data.odometer.toLocaleString('pt-BR')} km atingidos`,
            scheduledDate: new Date(),
            scheduledById: admin.id,
          },
        })
      }
    }
  }

  return { location, odometerAlert: alert, currentOdometer: data.odometer, alertThreshold: equipment.odometerAlert }
}

export async function getLastLocation(equipmentId: string) {
  const location = await prisma.vehicleLocation.findFirst({
    where: { equipmentId },
    orderBy: { recordedAt: 'desc' },
  })
  return location
}

export async function getFleetMap() {
  const equipments = await prisma.equipment.findMany({
    where: { status: { not: 'DECOMMISSIONED' } },
    select: {
      id: true, name: true, category: true, status: true,
      odometer: true, odometerAlert: true,
      locations: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
    },
  })

  return equipments.map(e => ({
    id: e.id,
    name: e.name,
    category: e.category,
    status: e.status,
    odometer: e.odometer,
    odometerAlert: e.odometerAlert,
    odometerWarning: e.odometer >= e.odometerAlert * 0.9,
    lastLocation: e.locations[0] || null,
  }))
}
