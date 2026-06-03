export class EventoPrincipal {
  public id?: string;
  public titulo: string;
  public etapa?: string | null;
  public data: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<EventoPrincipal, "id" | "createdAt" | "updatedAt">,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    Object.assign(this, props);
    this.id = id;
    this.titulo = props.titulo;
    this.etapa = props.etapa ?? null;
    this.data = props.data;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
