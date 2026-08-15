# Class 5 — Linux

## Objectives
Navigate a Linux system, understand permissions, processes, packages and logs, and work safely from a terminal.

## Filesystem
Linux exposes files through a hierarchical filesystem. Common directories include `/etc` for configuration, `/var` for variable data and logs, `/home` for user data and `/tmp` for temporary files. Relative paths depend on the current working directory.

## Permissions and processes
Permissions distinguish owner, group and others, commonly expressed as read, write and execute bits. Avoid running everything as root. Use `sudo` only for tasks that actually require elevated privileges.

Processes have IDs and consume system resources. Logs provide evidence about services and failures. Package managers verify and install software from configured repositories; do not pipe unknown remote scripts directly into a privileged shell.

## Practical workflow
Use `pwd`, `ls`, `cd`, `grep`, `find`, `cat`, `less`, `ps`, `journalctl` and `systemctl` deliberately. Read a command's manual page before using an unfamiliar destructive option.

## Self-check
Why is least privilege important on Linux? What is the difference between a process and a service? Why is blindly executing downloaded shell code risky?
