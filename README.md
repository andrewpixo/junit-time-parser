# junit-time-parser

A command-line utility to parse JUnit XML test results and output test suite information in CSV format.

## Overview

This tool scans a directory for JUnit XML files, extracts test suite information (name, test count, and runtime), and outputs the data in CSV format.

## Requirements

- Node.js >= 12.0.0
- npm (for installing dependencies)

## Installation

```bash
npm install
```

## Usage

```bash
node index.js <directory> [numWaves]
```

Or if installed globally:

```bash
npm install -g .
junit-parser <directory> [numWaves]
```

### Arguments

- `<directory>`: Path to the directory containing JUnit XML files
- `[numWaves]`: (Optional) Number of waves to distribute test suites across. If not provided, defaults to the number of XML files found in the directory.

### Output Format

The tool outputs CSV format with the following columns:
- **TestSuite**: Name of the test suite
- **Tests**: Number of tests in the suite
- **Runtime**: Total runtime of the test suite in seconds
- **Wave**: The wave assignment for the test suite (e.g., "wave 1", "wave 2")

The tool uses the Longest Processing Time (LPT) algorithm to distribute test suites evenly across waves based on their runtime, ensuring each wave has approximately the same total execution time.

### Examples

#### Basic usage (default wave distribution):
```bash
node index.js ./examples
```

Output:
```csv
TestSuite,Tests,Runtime,Wave
My Test Suite,23,15.25,wave 3
Another Test Suite,10,5.5,wave 3
Manage advanced kill sheets,5,126.369,wave 1
Add special tags to certain purchase loads for reporting,5,118.005,wave 2
```

#### Specify number of waves:
```bash
node index.js ./examples 2
```

Output:
```csv
TestSuite,Tests,Runtime,Wave
My Test Suite,23,15.25,wave 1
Another Test Suite,10,5.5,wave 1
Manage advanced kill sheets,5,126.369,wave 1
Add special tags to certain purchase loads for reporting,5,118.005,wave 2
```

## JUnit XML Format

The tool supports standard JUnit XML format with either `testsuite` or `testsuites` as the root element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="My Test Suite" tests="23" time="15.25" failures="0" errors="0">
  <testcase name="test1" classname="TestClass" time="0.5"/>
  <testcase name="test2" classname="TestClass" time="1.2"/>
</testsuite>
```

## Examples

Example JUnit XML files are provided in the `examples/` directory for testing and reference.

## License

MIT