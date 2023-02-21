export enum code {
  success = 200,
  notFound = 404,
}

export type codeType = keyof typeof code;
