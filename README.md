# Setup for nested workspaces using typescript

I was banging my head against a wall when dealing with `Cannot find module` errors after manually adding nested workspace
dependencies to my TypeScript project. I decided to create a basic demo to work it out. The demo structure is:

```bash
---- typescript-nested-workspaces (name:typescript-nested-workspaces)
-------- workspace1 (name:@demo/workspace1)
------------ packages
---------------- package1 (name:@demo/package1)
---------------- package2 (name:@demo/package2)
-------- workspace2 (@demo/workspace2)
---------------- package3 (name:@demo/package3)
```

## Prerequisites

Set the version of `yarn` to stable. This equated to `3.1.1` at the time of writing:

```bash
yarn set version stable          
➤ YN0000: Retrieving https://repo.yarnpkg.com/3.1.1/packages/yarnpkg-cli/bin/yarn.js
➤ YN0000: Saving the new release in .yarn/releases/yarn-3.1.1.cjs
➤ YN0000: Done in 0s 815ms
```

Add the `workspace-tools` plugin:

```bash
yarn plugin import workspace-tools 
➤ YN0000: Downloading https://github.com/yarnpkg/berry/raw/@yarnpkg/cli/3.1.1/packages/plugin-workspace-tools/bin/%40yarnpkg/plugin-workspace-tools.js
➤ YN0000: Saving the new plugin in .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
➤ YN0000: Done in 0s 348ms
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

This works without issues as `package1` and `package2` are in the same workspace. We end up with the following in
`@demo/package2`'s `package.json`:

```json
  "dependencies" : {
    "@demo/package1" : "workspace:^"
  }
```

## Installing a package as a dependency of another package from another workspace

Installing `@demo/package1` into `@demo/package3` **does not work** as it reaches out to the registry instead of looking locally.

```bash
yarn workspace @demo/package3 add @demo/package1
➤ YN0027: @demo/package1@unknown can't be resolved to a satisfying range
➤ YN0035: The remote server failed to provide the requested resource
➤ YN0035:   Response Code: 404 (Not Found)
➤ YN0035:   Request Method: GET
➤ YN0035:   Request URL: https://registry.yarnpkg.com/@demo%2fpackage1

```

This error can be resolved by deleting all of the `.yarnrc` files that occur in the individual workspaces, as helpfully
pointed out by [this comment](https://github.com/yarnpkg/yarn/pull/6151#issuecomment-1046506013. As soon as you get rid
of these, you can add `package1` to `package3` and the typescript build works without requiring additional paths or
references at the individual package level.

```bash
yarn workspace @demo/package3 add @demo/package1
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed
➤ YN0000: Done in 0s 269ms
```

```bash
yarn workspaces foreach run build
➤ YN0000: ➤ YN0000: command not found: tsc
➤ YN0000: ➤ YN0000: 14:50:58 - Projects in this build: 
➤ YN0000: ➤ YN0000:     * tsconfig.json
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:58 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Projects in this build: 
➤ YN0000: ➤ YN0000:     * ../package1/tsconfig.json
➤ YN0000: ➤ YN0000:     * tsconfig.json
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Project '../package1/tsconfig.json' is up to date because newest input '../package1/src/index.ts' is older than oldest output '../package1/build/src/index.js'
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Projects in this build: 
➤ YN0000: ➤ YN0000:     * tsconfig.json
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Project 'tsconfig.json' is out of date because output file 'build/src/index.js' does not exist
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: 14:50:59 - Building project '/home/user/dev/typescript-nested-workspaces/packages/workspace2/packages/package3/tsconfig.json'...
➤ YN0000: ➤ YN0000: 
➤ YN0000: ➤ YN0000: Done in 2s 901ms
➤ YN0000: command not found: tsc
➤ YN0000: 14:51:01 - Projects in this build: 
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 14:51:01 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: 14:51:02 - Projects in this build: 
➤ YN0000:     * ../package1/tsconfig.json
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 14:51:02 - Project '../package1/tsconfig.json' is up to date because newest input '../package1/src/index.ts' is older than oldest output '../package1/build/src/index.js'
➤ YN0000: 
➤ YN0000: 14:51:02 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: 14:51:02 - Projects in this build: 
➤ YN0000:     * tsconfig.json
➤ YN0000: 
➤ YN0000: 14:51:02 - Project 'tsconfig.json' is up to date because newest input 'src/index.ts' is older than oldest output 'build/src/index.js'
➤ YN0000: 
➤ YN0000: Done in 4s 500ms

```

And then never run any `yarn` commands from within the nested packages. Always run `yarn` from root.

## Cross-workspace call

Running the script in `@demo/package3` [successfully calls `@demo/package1`](https://github.com/forgetso/typescript-yarn-nested-workspaces/blob/ecc6dd4980b50c4f5aad6b277e3d7840deb19b97/packages/workspace2/packages/package3/src/index.ts#L1):

```bash
yarn workspace @demo/package3 run cross-workspace-call                             
this is package 3 calling package 1
this is package 1
```

## Notes

- Make sure you're running an up to date version of `yarn` by running `yarn set version stable`  
- If you get an error running `yarn workspaces foreach` add the plugin `yarn plugin import workspace-tools`