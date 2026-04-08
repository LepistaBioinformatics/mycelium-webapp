import type { components } from "@/services/openapi/mycelium-schema";

export type NativeUser = Pick<
  components["schemas"]["User"],
  "id" | "email" | "firstName" | "lastName"
>;

export type NativeLoginResponse =
  components["schemas"]["MyceliumLoginResponse"];

export class InvalidCodeError extends Error {
  constructor() {
    super("Invalid or expired code");
    this.name = "InvalidCodeError";
  }
}
