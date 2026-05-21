export class ItemPlanoViagem {
  id?: string;
  dataHoraAgendada!: Date;
  anotacao?: string | null;
  planoViagemId!: string;
  gastronomiaId?: string | null;
  hospedagemId?: string | null;
  eventoId?: string | null;
  atividadeId?: string | null;
  servicoTuristaId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<ItemPlanoViagem>) {
    Object.assign(this, partial);
  }
}
