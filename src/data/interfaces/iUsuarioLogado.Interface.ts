import { Perfil } from "@prisma/client";

export interface IUsuarioLogado {
  id: string;
  perfil: Perfil;
}
