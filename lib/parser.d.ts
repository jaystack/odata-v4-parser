import * as Lexer from './lexer';
export declare class Parser {
    odataUri(source: string, options?: any): Lexer.Token;
    resourcePath(source: string, options?: any): Lexer.Token;
    query(source: string, options?: any): Lexer.Token;
    filter(source: string, options?: any): Lexer.Token;
    keys(source: string, options?: any): Lexer.Token;
    literal(source: string, options?: any): Lexer.Token;
}
export declare function odataUri(source: string, options?: any): Lexer.Token;
export declare function resourcePath(source: string, options?: any): Lexer.Token;
export declare function query(source: string, options?: any): Lexer.Token;
export declare function filter(source: string, options?: any): Lexer.Token;
export declare function keys(source: string, options?: any): Lexer.Token;
export declare function literal(source: string, options?: any): Lexer.Token;
