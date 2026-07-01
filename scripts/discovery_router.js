#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const industries = [
  "aquarium",
  "pet equipment",
  "dental",
  "beauty equipment",
  "gym equipment",
  "RV",
  "marine",
  "coffee equipment",
  "sewing machine",
  "wheelchair",
  "mobility aid",
  "agriculture",
  "solar",
  "camping",
  "pool",
  "spa",
  "vending machine",
  "cleaning equipment",
  "packaging equipment",
  "bakery equipment",
  "photo/video equipment",
  "appliance repair",
  "garage tools",
  "bike repair",
  "musical instruments",
  "robotics",
  "CNC",
  "3D printer",
  "security hardware"
];

const requiredCoverage = [
  "repair replacement parts",
  "consumables",
  "exact-fit/model-specific parts",
  "mounting/installation parts",
  "seasonal demand",
  "industrial/commercial equipment",
  "consumer trends",
  "brand reverse"
];

function draw(list, count) {
  const copy = [...list].sort(() => Math.random() - 0.5);
  return copy.slice(0, count);
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "runs", today);
  fs.mkdirSync(outDir, { recursive: true });

  const selected = draw(industries, 10);
  const plan = {
    date: today,
    allocation: {
      known_categories_max: 0.4,
      adjacent_categories: 0.3,
      random_new_industries: 0.3
    },
    requiredCoverage,
    selectedIndustries: selected
  };

  fs.writeFileSync(path.join(outDir, "industry_roulette.json"), JSON.stringify(plan, null, 2));
  console.log(JSON.stringify(plan, null, 2));
}

main();

