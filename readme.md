# airdrop tool

This is one airdrop tool implement with **moveflow** protocal.

## How to usage

1. Download this code

```shell
git clone https://github.com/Move-Flow/moveflow-sdk-aptos.git
git checkout tools 
```

2. Install depends

```shell
pnpm install 
```

3. Init your config as .env.example

4. Create the airdrop csv file as airdrop.csv 

5. Run airdrop

```shell
pnpm run start airdrop -f ./airdrop.csv 
```

6. check the log file : batch.log 