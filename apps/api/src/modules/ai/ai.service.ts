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
        temperature: 0.1,
        maxOutputTokens: 4096,
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
      maintenances: { orderBy: { scheduledDate: 'desc' }, take: 5, include: { parts: true } },
      rentals: { where: { checkinDate: { not: null } }, orderBy: { checkoutDate: 'desc' }, take: 10 },
    },
  })

  if (!equipment) throw new Error('Veiculo nao encontrado')

  const hist = equipment.maintenances.map(m => ({
    tipo: m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva',
    desc: m.description,
    data: m.scheduledDate.toISOString().split('T')[0],
    custo: Number(m.laborCost || 0) + m.parts.reduce((s, p) => s + p.quantity * Number(p.unitPrice), 0),
  }))

  const diasAlugado = equipment.rentals.reduce((s, r) => s + (r.totalDays || 0), 0)

  const prompt = `Especialista em manutencao de veiculos de locacao.
Veiculo: ${equipment.name} ${equipment.brand} ${equipment.model} ${equipment.year}
Dias alugado: ${diasAlugado}, Locacoes: ${equipment.rentals.length}
Manutencoes: ${JSON.stringify(hist)}
Retorne JSON: {proximaManutencao:{tipo,descricaoSugerida,dataEstimada,justificativa,prioridade},alertas:[],recomendacoes:[]}`

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

  const frota = equipments.map(e => {
    const custoMan = e.maintenances.reduce((s, m) =>
      s + Number(m.laborCost || 0) + m.parts.reduce((ps, p) => ps + p.quantity * Number(p.unitPrice), 0), 0)
    const receita = e.rentals.reduce((s, r) => s + Number(r.totalAmount || 0), 0)
    return {
      nome: e.name,
      cat: e.category,
      status: e.status,
      locacoes: e.rentals.length,
      custoMan,
      receita,
      roi: receita - Number(e.purchasePrice) - custoMan,
    }
  })

  const prompt = `Consultor de frotas de locacao de veiculos.
Dados: ${JSON.stringify(frota)}
Retorne JSON compacto: {candidatosBaixa:[{nome,motivo}],maisRentaveis:[{nome,destaque}],recomendacoesEstrategicas:[string,string,string],resumoGeral:string}`

  return callGemini(prompt)
}
