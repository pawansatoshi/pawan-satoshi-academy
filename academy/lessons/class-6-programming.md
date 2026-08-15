# Class 6 — Programming Basics

## Objectives
Understand variables, control flow, functions, data structures, errors and testing.

## Programming model
Programs transform inputs into outputs using state and logic. Variables hold values, conditionals choose paths, loops repeat work and functions package reusable behaviour. Choose data structures based on access patterns and clarity rather than habit.

## Reliability
Validate external input at boundaries. Handle expected failures explicitly and avoid exposing secrets or sensitive internal details in error messages. Tests should cover normal cases, edge cases and failure paths.

## Maintainability
Prefer small functions with clear names and explicit interfaces. Comments should explain why a non-obvious decision exists, not restate what obvious code does. Dependency versions should be pinned or constrained deliberately and security updates should be reviewed.

## Practical workflow
Read the existing architecture before adding a module. Make one coherent change, run the formatter/linter and tests, inspect the diff, then commit.

## Self-check
Why should input validation happen at boundaries? What makes a function easy to test? Why are error paths part of normal software design?
