# Discovery Router / Industry Roulette

The router assigns industries before explorer work begins.

## Allocation

- Known categories: at most 40%.
- Adjacent categories: 30%.
- Random new industries: 30%.

## Daily Industry Draw

Randomly draw 8-12 industry pools and ensure coverage across:

- repair replacement parts
- consumables
- exact-fit/model-specific parts
- mounting/installation parts
- seasonal demand
- industrial/commercial equipment
- consumer trends
- brand reverse

## Candidate Industries

Aquarium, pet equipment, dental, beauty equipment, gym equipment, RV, marine, coffee equipment, sewing machine, wheelchair, mobility aid, agriculture, solar, camping, pool, spa, vending machine, cleaning equipment, packaging equipment, bakery equipment, photo/video equipment, appliance repair, garage tools, bike repair, musical instruments, robotics, CNC, 3D printer, security hardware.

## Penalties

- If an industry appeared as a main output yesterday, it cannot be today's main output.
- If an industry is high-frequency in the past 14 days, reduce weight.
- If a keyword is in rejected history from the past 30 days, block by default.
- WATCH items that failed Sif enter cooldown.

