@echo off
echo Starting Hardhat Node...
start cmd /k "cd contracts && npm run node"

echo Waiting for node to start...
timeout /t 5 /nobreak

echo Deploying Contracts...
start cmd /c "cd contracts && npx hardhat run scripts/deploy.js --network localhost"

echo Starting Next.js Dev Server...
start cmd /k "cd app\web && npm run dev"

echo All services started!
