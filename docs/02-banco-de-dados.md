# 02 — Banco de Dados

Entidades: User, Equipment, Client, Rental, Maintenance, MaintenancePart, Insurance, Claim

Status do equipamento: AVAILABLE | RENTED | MAINTENANCE | DECOMMISSIONED

Campos calculados em runtime:
- ROI = receita - aquisicao - manutencoes - seguro
- Taxa de ocupacao = dias_alugado / dias_disponivel * 100
- Receita perdida = diaria * dias_em_manutencao
