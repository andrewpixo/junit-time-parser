#!/usr/bin/env python3
"""
JUnit XML Parser CLI Utility

Parses JUnit XML files from a directory and outputs test suite information in CSV format.
"""

import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def parse_junit_xml(xml_file):
    """
    Parse a JUnit XML file and extract testsuite information.
    
    Args:
        xml_file: Path to the JUnit XML file
        
    Returns:
        dict with keys: name, tests, time
    """
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # Handle both testsuite and testsuites root elements
        if root.tag == 'testsuite':
            testsuite = root
        elif root.tag == 'testsuites':
            # If testsuites is the root, find the first testsuite
            testsuite = root.find('testsuite')
            if testsuite is None:
                return None
        else:
            return None
        
        name = testsuite.get('name', 'Unknown')
        tests = testsuite.get('tests', '0')
        time = testsuite.get('time', '0')
        
        return {
            'name': name,
            'tests': tests,
            'time': time
        }
    except Exception as e:
        print(f"Error parsing {xml_file}: {e}", file=sys.stderr)
        return None


def find_xml_files(directory):
    """
    Find all XML files in the given directory.
    
    Args:
        directory: Path to the directory
        
    Returns:
        List of XML file paths
    """
    xml_files = []
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"Error: Directory '{directory}' does not exist", file=sys.stderr)
        return xml_files
    
    if not dir_path.is_dir():
        print(f"Error: '{directory}' is not a directory", file=sys.stderr)
        return xml_files
    
    # Find all .xml files in the directory (non-recursive)
    for file in dir_path.glob('*.xml'):
        if file.is_file():
            xml_files.append(file)
    
    return xml_files


def main():
    """Main entry point for the CLI utility."""
    if len(sys.argv) != 2:
        print("Usage: python junit_parser.py <directory>", file=sys.stderr)
        sys.exit(1)
    
    directory = sys.argv[1]
    xml_files = find_xml_files(directory)
    
    if not xml_files:
        print(f"No XML files found in directory: {directory}", file=sys.stderr)
        sys.exit(1)
    
    # Print CSV header
    print("TestSuite,Tests,Runtime")
    
    # Parse each XML file and output CSV rows
    for xml_file in sorted(xml_files):
        data = parse_junit_xml(xml_file)
        if data:
            print(f"{data['name']},{data['tests']},{data['time']}")


if __name__ == '__main__':
    main()
