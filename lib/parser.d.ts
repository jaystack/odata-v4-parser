import * as Lexer from './lexer';
export declare class Parser {
    filter(source: string, options?: any): Lexer.Token;
    keys(source: string, options?: any): Lexer.Token;
    literal(source: string, options?: any): Lexer.Token;
}
