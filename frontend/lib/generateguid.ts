import { v4 as uuidv4 } from "uuid";
export const guid = (): string => {
  return uuidv4();
};
