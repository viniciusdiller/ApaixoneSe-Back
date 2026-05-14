import { Atividade } from "../entities/atividade.Entity";
import { TipoRoteiro } from "@prisma/client";

export interface IAtividadeRepository {
  // Salva uma nova atividade no banco (ex: cadastrar o Surfe em Itaúna)
  save(atividade: Atividade): Promise<Atividade>;

  // Busca todas as atividades cadastradas no sistema
  findAll(): Promise<Atividade[]>;

  // Busca apenas as atividades de um roteiro específico (ex: só ESPORTE_E_AVENTURA)
  findByRoteiro(roteiro: TipoRoteiro): Promise<Atividade[]>;

  // Busca os detalhes de apenas uma atividade clicada
  findById(id: string): Promise<Atividade | null>;

  update(id: string, data: Partial<Atividade>): Promise<Atividade>;

  delete(id: string): Promise<void>;
}
