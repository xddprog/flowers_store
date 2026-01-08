import queryString from "query-string";
import { axiosNoAuth } from "@/shared/api/baseQueryInstance";
import {
  BaseBouquet,
  BouquetDetail,
  BouquetSearchParams,
  PopularBouquetsParams,
  BouquetType,
  FlowerType,
} from "../types/apiTypes";

class BouquetService {
  public async searchBouquets(
    params: BouquetSearchParams
  ): Promise<BaseBouquet[]> {
    const queryParams = queryString.stringify(
      {
        bouquet_type_ids: params.bouquet_type_ids,
        flower_type_ids: params.flower_type_ids,
        price_min: params.price_min,
        price_max: params.price_max,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    const url = `/api/v1/bouquet/search${queryParams ? `?${queryParams}` : ""}`;
    const { data } = await axiosNoAuth.get<BaseBouquet[]>(url);
    return data;
  }

  public async getPopularBouquets(
    params?: PopularBouquetsParams
  ): Promise<BaseBouquet[]> {
    const queryParams = queryString.stringify(
      {
        limit: params?.limit ?? 10,
        offset: params?.offset ?? 0,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    const url = `/api/v1/bouquet/popular${
      queryParams ? `?${queryParams}` : ""
    }`;
    const { data } = await axiosNoAuth.get<BaseBouquet[]>(url);
    return data;
  }

  public async getBouquetDetail(bouquetId: string): Promise<BouquetDetail> {
    const { data } = await axiosNoAuth.get<BouquetDetail>(
      `/api/v1/bouquet/${bouquetId}`
    );
    return data;
  }

  public async getBouquetTypes(): Promise<BouquetType[]> {
    const { data } = await axiosNoAuth.get<BouquetType[]>(
      "/api/v1/bouquet/types"
    );
    return data;
  }

  public async getFlowerTypes(): Promise<FlowerType[]> {
    const { data } = await axiosNoAuth.get<FlowerType[]>("/api/v1/flower/");
    return data;
  }
}

export const bouquetService = new BouquetService();
