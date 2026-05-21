import { ItemPlanoViagem } from "../entities/itemPlanoViagem.Entity";

export interface IItemPlanoViagemRepository {
  save(item: ItemPlanoViagem): Promise<ItemPlanoViagem>;
  findById(id: string): Promise<any>;
  update(id: string, data: Partial<ItemPlanoViagem>): Promise<ItemPlanoViagem>;
  delete(id: string): Promise<void>;
}
