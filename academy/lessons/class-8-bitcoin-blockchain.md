# Class 8 — Bitcoin & Blockchain

## Objectives
Explain Bitcoin's basic architecture, blocks, transactions, proof of work, keys and blockchain trade-offs.

## Bitcoin
Bitcoin uses a peer-to-peer network and a public ledger. Transactions spend outputs and create new outputs; nodes validate rules before accepting blocks. Mining uses proof of work to make rewriting recent history computationally expensive.

The 2008 Bitcoin whitepaper proposed peer-to-peer electronic cash without a central clearing party. Wallet software manages keys; the wallet does not contain coins in a literal account-like sense. Losing a private key or recovery phrase can mean losing practical control.

## Blockchain trade-offs
A replicated ledger can improve auditability and reduce reliance on a single operator, but decentralization introduces costs in throughput, latency, coordination and user responsibility. "On-chain" does not automatically mean private, reversible or risk-free.

## Operational safety
Verify addresses and network names before signing. Hardware wallets can reduce exposure to online malware but do not protect a user who approves a malicious transaction.

## Self-check
What problem does proof of work address? What does a wallet actually control? Why is a blockchain transaction not automatically reversible?

Reference: https://bitcoin.org/bitcoin.pdf
