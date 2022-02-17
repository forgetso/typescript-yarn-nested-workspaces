# Setup for nested workspaces using typescript

I was banging my head against a wall dealing with `Cannot find module` errors when manually adding nested workspace
dependencies to my TypeScript project so I decided to create a basic demo to work it out. The demo structure is:

```bash
---- typescript-nested-workspaces (name:typescript-nested-workspaces)
-------- workspace1 (name:@demo/workspace1)
------------ packages
---------------- package1 (name:@demo/package1)
---------------- package2 (name:@demo/package2)
-------- workspace2 (@demo/workspace2)
---------------- package3 (name:@demo/package3)
```

Run the command `yarn` from the root to install the dependencies.

## Installing a package as a dependency of another package within a workspace

You can install `@demo1/package1` as a dependency of `@demo/package2` using this command:

```bash
yarn workspace @demo/package2 add @demo/package1
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed
➤ YN0000: Done in 0s 120ms
```

This works without issues as `package1` and `package2` are in the same workspace.

## Installing a package as a dependency of another package from another workspace

Installing `@demo/package1` into `@demo/package3` does not work as it reaches out to the registry instead of looking locally.

```bash
yarn workspace @demo/package3 add @demo/package1
➤ YN0027: @demo/package1@unknown can't be resolved to a satisfying range
➤ YN0035: The remote server failed to provide the requested resource
➤ YN0035:   Response Code: 404 (Not Found)
➤ YN0035:   Request Method: GET
➤ YN0035:   Request URL: https://registry.yarnpkg.com/@demo%2fpackage1

```

This was resolved by adding [paths](https://github.com/forgetso/typescript-yarn-nested-workspaces/blob/ecc6dd4980b50c4f5aad6b277e3d7840deb19b97/tsconfig.json#L7-L40)
and [references](https://github.com/forgetso/typescript-yarn-nested-workspaces/blob/ecc6dd4980b50c4f5aad6b277e3d7840deb19b97/tsconfig.json#L48-L69)
to the `tsconfig.json` at the root of the project. The `tsconfig.json` in `@demo/package3` then inherits this `tsconfig`
so that it knows where to look for `@demo/package1`. Clearly, this is not an ideal solution as you have an independent
package relying on a foreign root `tsconfig.json`. However, it will work for development purposes.

## Building all workspaces

Now all projects can be built from the root directory using

`yarn workspaces foreach run build`

```bash
yarn workspaces foreach run build
➤ YN0000: command not found: tsc
➤ YN0000: 13:20:12 - Projects in this build: 
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 13:20:12 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: 13:20:12 - Projects in this build: 
➤ YN0000:     * ../package1/tsconfig.json
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 13:20:12 - Project '../package1/tsconfig.json' is up to date because newest input '../package1/src/index.ts' is older than oldest output '../package1/build/src/index.js'
➤ YN0000: 
➤ YN0000: 13:20:12 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: 13:20:13 - Projects in this build: 
➤ YN0000:     * ../../../workspace1/packages/package1/tsconfig.json
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 13:20:13 - Project '../../../workspace1/packages/package1/tsconfig.json' is up to date because newest input '../../../workspace1/packages/package1/src/index.ts' is older than oldest output '../../../workspace1/packages/package1/build/src/index.js'
➤ YN0000: 
➤ YN0000: 13:20:13 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: Done in 0s 930ms

```

## Cross-workspace call

Running the script in `@demo/package3` [successfully calls `@demo/package1`](https://github.com/forgetso/typescript-yarn-nested-workspaces/blob/ecc6dd4980b50c4f5aad6b277e3d7840deb19b97/packages/workspace2/packages/package3/src/index.ts#L1):

```bash
yarn workspace @demo/package3 run cross-workspace-call                             
this is package 3 calling package 1
this is package 1
```

## Notes

- The references in the `tsconfig.json` files were added automatically using `yarn fix-typescript-references` from the
root directory. This makes use of the package [`@goldstack/utils-typescript-references`](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/utils-typescript-references#usage).
- For a more complete example of this setup, see [polkadot-js/api](https://github.com/polkadot-js/api).