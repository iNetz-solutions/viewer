import {Formula, getFormulaFor} from '../formulaList';

export class ToolResult{
    calculatedValue: Formula;
    
    static fromRawJSON(toolId: string, json: any): ToolResult{
        const {
            name,
            unit,
            icon,
            toolName,
            formulaName,
            imageTypes

        } = json;

        return new ToolResult(
            toolId,
            name,
            unit,
            icon,
            toolName,
            formulaName,
            imageTypes

        );
    }

    constructor(
        public toolId: string,
        public name: string,
        public unit: string,
        public icon: string,
        public toolName: string = '',
        formulaName: string = '',
        public imageTypes: string[] = []

    ){
        this.calculatedValue = getFormulaFor(toolId, formulaName);
    }

}

export type ToolMap = Map<string, ToolResult>;