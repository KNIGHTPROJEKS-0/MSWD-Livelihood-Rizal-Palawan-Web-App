#!/usr/bin/env python3
import sys
import subprocess


def check_python_version():
    current = sys.version_info
    print(f"Current Python: {current.major}.{current.minor}.{current.micro}")

    if current >= (3, 11):
        print("✅ Python version is up to date")
    else:
        print("⚠️  Consider upgrading to Python 3.11+")
        print("Run: brew install python@3.11")


if __name__ == "__main__":
    check_python_version()
