declare module 'sql.js' {
  export interface Database {
    run(sql: string): void;
    exec(sql: string): Array<{ columns: string[]; values: any[][] }>;
    export(): Uint8Array;
    get(sql: string, params?: any[]): any;
    all(sql: string, params?: any[]): any[];
  }
  
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }
  
  export default function initSqlJs(options: { locateFile: (file: string) => string }): Promise<SqlJsStatic>;
}
