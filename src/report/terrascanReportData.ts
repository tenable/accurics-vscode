export interface TerrascanScanReport {
    results: Result
}

export interface Result {
    violations: Violation[],
    count: Count
}

export interface Violation {
    rule_name: string,
    description: string,
    rule_id: string,
    severity: string,
    category: string,
    resource_name: string,
    resource_type: string,
    file: string,
    line: number
}

export interface Count {
    low: number,
    medium: number,
    high: number,
    total: number
}