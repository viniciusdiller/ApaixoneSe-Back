export class Visita {
  public id?: string;
  public usuarioId: string;
  public gastronomiaId?: string | null;
  public atividadeId?: string | null;
  public dataVisita?: Date;

  constructor(
    props: Omit<Visita, "id" | "dataVisita">,
    id?: string,
    dataVisita?: Date,
  ) {
    Object.assign(this, props);
    this.id = id;
    this.usuarioId = props.usuarioId;
    this.gastronomiaId = props.gastronomiaId;
    this.atividadeId = props.atividadeId;
    this.dataVisita = dataVisita;
  }
}
