<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

<!--PROJECT START-->

# Project Overview

This project is a web game that is built using Vite+ and follows the clean architecture principles. The project is structured to ensure maintainability, scalability, and ease of testing.
The main contents of this game is vampire survivors like game.

## New Feature or Bug Fix

- [ ] In user input, there is a ambiguity, please re-ask me to clarify the ambiguity.

## Code Creation

- [ ] In engine folder, You need to follow the clean architecture, and create the code for the new feature or bug fix.
- [ ] Other folders, you can create freely, but you need to ensure the code is well-structured and maintainable.
- [ ] Comment your code with docstrings and inline comments to explain the logic and purpose of the code.
  - Do not add period each time at the end of the comment, unless it is a complete sentence.

## Test

- [ ] Create the test cases for the new feature or bug fix.
  - If you find any issues, please fix them.

## Final Review

- [ ] Check the vp check
  - If you found the any issues, please fix them.

<!--PROJECT END-->
