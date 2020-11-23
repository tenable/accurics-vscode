import { TerrascanScanReport, Violation } from './terrascanReportData';
import { lstatSync, writeFileSync } from 'fs';
import { Utils } from '../utils/utils';

export class ReportGenerator {

    generateJsonFile(jsonData: any, sourceName: string) {

        writeFileSync(Utils.getReportFilePath('json', sourceName), jsonData, 'utf-8');
    }

    generateHtmlFile(sourceName: string, iacType: string, terrascanReport: TerrascanScanReport) {
        let htmlReport: string = '';
        let scanSummary: string = `<html>
<head>
    <title>Accurics Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&family=Quicksand&family=Rubik:wght@300;400&display=swap" rel="stylesheet">
    <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
            font-family: 'Noto Sans', sans-serif;
            font-size: 12px;
        }
        h1, h2 {
            font-family: 'Noto Sans', sans-serif;
        }
        th, td {
            padding: 5px;
        }
    </style>
</head>
<body>
    <h1>Accurics Report</h1>
    <h2>Scan Details</h2>
    <table>
        <thead>
            <tr>
                <th>Folder / File</th>
                <th>IAC Type</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${sourceName}</td>
                <td>${iacType}</td>
            </tr>
        </tbody>
    </table>
    <h2>Scan Summary</h2>
    <table>
        <thead>
        <tr>
            <th>Total</th>
            <th>Low</th>
            <th>Medium</th>
            <th>High</th>
        </tr>
        <tr>
            <td>${terrascanReport.results.count.total}</td>
            <td>${terrascanReport.results.count.low}</td>
            <td>${terrascanReport.results.count.medium}</td>
            <td>${terrascanReport.results.count.high}</td>
        </tr>
    </table>`;

        htmlReport += scanSummary;

        if (terrascanReport.results.violations !== undefined && terrascanReport.results.violations !== null && terrascanReport.results.violations.length > 0) {
            let violations: string = '';
            let violationHead: string = `<h2>Violation Details</h2>
    <table>
        <thead>
            <tr>
                <th>Rule_name</th>
                <th>Description</th>
                <th>Rule_id</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Resource_name</th>
                <th>Resource_type</th>
                <th>File</th>
                <th>Line</th>
            </tr>
        </thead>`;
            violations += violationHead;
            violations += '<tbody>';

            // loop violations
            for (let index = 0; index < terrascanReport.results.violations.length; index++) {
                let violation: Violation = terrascanReport.results.violations[index];
                let violationRow: string = `<tr>
        <td>${violation.rule_name}</td>
        <td>${violation.description}</td>
        <td>${violation.rule_id}</td>
        <td>${violation.severity}</td>
        <td>${violation.category}</td>
        <td>${violation.resource_name}</td>
        <td>${violation.resource_type}</td>
        <td>${violation.file}</td>
        <td>${violation.line}</td>
    </tr>`;
                
                violations += violationRow;
            }

            violations += '</tbody></table>';
            htmlReport += violations;
        }

        htmlReport += '</body></html>';

        writeFileSync(Utils.getReportFilePath('html', sourceName), htmlReport, 'utf-8');
    }
}