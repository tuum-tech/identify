# @tuum-tech/identity-snap

This repository contains code for Identity Snap and an example website that integrates the snap to offer various features such as configuring hedera account, getting current did method, getting DID, resolving DID, getting Verifiable Credentials, creating Verifiable Credentials out of some arbitary JSON object, generating Verifiable Presentations from Verifiable Credentials and verifying VCs and verifying VPs. Refer to the [Identity Snap Wiki](https://github.com/tuum-tech/identity-snap/wiki) for more info on how the snap works and how to integrate it into your own application.

MetaMask Snaps is a system that allows anyone to safely expand the capabilities of MetaMask. A _snap_ is a program that we run in an isolated environment that can customize the wallet experience.

## Snaps is pre-release software

To interact with Identity Snap, you will need to install [MetaMask Flask](https://metamask.io/flask/), a canary distribution for developers that provides access to upcoming features.

## Getting Started

### Setup the development environment

```shell
yarn install && yarn start
```

### Connect to official npm package @tuum-tech/identity-snap

If you want to connect the example website to the official npm package [Identity Snap Npm Package](https://www.npmjs.com/package/@tuum-tech/identity-snap), you'll need to uncomment the line `` export const defaultSnapOrigin = `npm:@tuum-tech/identity-snap`; `` in the file `packages/site/src/config/snap.ts`

## Contributing

### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and fix any automatically fixable issues.

## Notes

- Babel is used for transpiling TypeScript to JavaScript, so when building with the CLI,
  `transpilationMode` must be set to `localOnly` (default) or `localAndDeps`.
- For the global `wallet` type to work, you have to add the following to your `tsconfig.json`:
  ```json
  {
    "files": ["./node_modules/@metamask/snap-types/global.d.ts"]
  }
  ```
