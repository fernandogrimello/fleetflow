import { prisma } from '../../lib/prisma'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<any> {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text)
}

export async function predictNextMaintenance(equipmentId: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      maintenances: {
        orderBy: { scheduledDate: 'desc' },
        take: 10,
        include: { parts: true },
      },
      rentals: {
        where: { checkinDate: { not: null } },
        orderBy: { checkoutDate: 'desc' },
        take: 20,
      },
    },
  })

  if (!equipment) throw new Error('Veiculo nao encontrado')

  const maintenanceHistory = equipment.maintenances.map(m => ({
    tipo: m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva',
    descricao: m.description,
    data: m.scheduledDate.toISOString().split('T')[0],
    custo: Number(m.laborCost || 0) + m.parts.reduce((s, p) => s + p.quantity * Number(p.unitPrice), 0),
    concluida: !!m.releaseDate,
  }))

  const totalDaysRented = equipment.rentals.reduce((s, r) => s + (r.totalDays || 0), 0)

  const prompt = `Voce e um especialista em manutencao de veiculos para empresas de locacao.
Veiculo: ${equipment.name} (${equipment.brand} ${equipment.model} ${equipment.year})
Categoria: ${equipment.category}
Total de dias alugado: ${totalDaysRented} dias
Numero de locacoes: ${equipment.rentals.length}
Historico de manutencoes: ${JSON.stringify(maintenanceHistory)}
Retorne JSON com: proximaManutencao (tipo, descricaoSugerida, dataEstimada YYYY-MM-DD, justificativa, prioridade Alta/Media/Baixa), alertas (array de strings), recomendacoes (array de strings)`

  const result = await callGemini(prompt)
  return { equipmentId, equipmentName: equipment.name, ...result }
}

export async function analyzeFleet() {
  const equipments = await prisma.equipment.findMany({
    where: { status: { not: 'DECOMMISSIONED' } },
    include: {
      maintenances: { include: { parts: true } },
      rentals: { where: { checkinDate: { not: null } } },
    },
  })

  const fleetData = equipments.map(e => {
    const maintenanceCost = e.maintenances.reduce((s, m) => {
      return s + Number(m.laborCost || 0) + m.parts.reduce((ps, p) => ps + p.quantity * Number(p.unitPrice), 0)
    }, 0)
    const revenue = e.rentals.reduce((s, r) => s + Number(r.totalAmount || 0), 0)
    const roi = revenue - Number(e.purchasePrice) - maintenanceCost
    return { nome: e.name, categoria: e.category, status: e.status, totalLocacoes: e.rentals.length, custoManutencao: maintenanceCost, receita: revenue, roi }
  })

  const prompt = `Voce e um consultor de gestao de frotas para empresas de locacao.
Dados da frota: ${JSON.stringify(fleetData)}
Retorne JSON com: candidatosBaixa (array de {nome, motivo}), maisRentaveis (array de {nome, destaque}), recomendacoesEstrategicas (array de strings), resumoGeral (string)`

  return callGemini(prompt)
}
