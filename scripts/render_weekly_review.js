#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function main() {
  const output = path.join(process.cwd(), "reports", "weekly-review-template.md");
  const body = `# Weekly Review

## Weekly Scan Counts

- Total candidates:
- Pre-SIF passed:
- Sent to Sif:
- A opportunities:
- B opportunities:
- C opportunities:

## A/B/C Opportunity Count

| Grade | Count | Notes |
|---|---:|---|
| A |  |  |
| B |  |  |
| C |  |  |

## Top Opportunities

| Opportunity | Industry | ASIN/link | Grade | Human decision | Next review |
|---|---|---|---|---|---|

## Top Rejected Reasons

| Reason | Count | Example |
|---|---:|---|

## Agent Performance

| Agent | Candidates | Pre-SIF pass rate | A/B/C mix | Notes |
|---|---:|---:|---|---|

## Category Coverage

| Industry | Scanned | SIF pass rate | WATCH rate | REJECT rate |
|---|---:|---:|---:|---:|

## Opportunities Needing Human Decision

| Opportunity | AI recommendation | Human decision needed | Notes |
|---|---|---|---|

## Next Week Exploration Direction

- 
`;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, body);
  console.log(output);
}

main();
