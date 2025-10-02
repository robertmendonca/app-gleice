declare module 'bcryptjs' {
  type Salt = number | string;

  export function hash(data: string, salt: Salt): Promise<string>;
  export function hashSync(data: string, salt?: Salt): string;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;

  interface BcryptModule {
    hash: typeof hash;
    hashSync: typeof hashSync;
    compare: typeof compare;
    compareSync: typeof compareSync;
    genSalt: typeof genSalt;
    genSaltSync: typeof genSaltSync;
  }

  const bcrypt: BcryptModule;
  export default bcrypt;
}
