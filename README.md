# Usage

```shell
pnpm install
pnpm build
node ./dist/main.js <codemod> <path>
```

# Dry run

```sh
npx jscodeshift -d -p -t ./public/codemods/<transformer>.ts test/<transformer>/<file>.ts
```
