# junit-time-parser

A command-line utility to parse JUnit XML test results and output test suite information in CSV format.

## Overview

This tool scans a directory for JUnit XML files, extracts test suite information (name, test count, and runtime), and outputs the data in CSV format.

## Requirements

- Python 3.x (no additional dependencies required)

## Usage

```bash
python junit_parser.py <directory>
```

### Arguments

- `<directory>`: Path to the directory containing JUnit XML files

### Output Format

The tool outputs CSV format with the following columns:
- **TestSuite**: Name of the test suite
- **Tests**: Number of tests in the suite
- **Runtime**: Total runtime of the test suite in seconds

### Example

```bash
python junit_parser.py ./examples
```

Output:
```csv
TestSuite,Tests,Runtime
My Test Suite,23,15.25
Another Test Suite,10,5.5
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