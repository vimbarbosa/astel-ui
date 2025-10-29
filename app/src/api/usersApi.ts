import { http } from "./httpClient";
import type { User } from "../types/User";

export async function getUsers(): Promise<User[]> {
  const { data } = await http.get("/users");
  return data;
}
