#!/usr/bin/env node

/**
 * JUnit XML Parser CLI Utility
 * 
 * Parses JUnit XML files from a directory and outputs test suite information in CSV format.
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

/**
 * Parse a JUnit XML file and extract testsuite information.
 * 
 * @param {string} xmlFile - Path to the JUnit XML file
 * @returns {Object|null} Object with keys: name, tests, time, or null if parsing fails
 */
function parseJunitXml(xmlFile) {
    try {
        const xmlContent = fs.readFileSync(xmlFile, 'utf8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Handle both testsuite and testsuites root elements
        let testsuite = null;
        const root = doc.documentElement;
        
        if (root.tagName === 'testsuite') {
            testsuite = root;
        } else if (root.tagName === 'testsuites') {
            // If testsuites is the root, find the first testsuite
            const testsuites = root.getElementsByTagName('testsuite');
            if (testsuites.length > 0) {
                testsuite = testsuites[0];
            }
        }
        
        if (!testsuite) {
            return null;
        }
        
        const name = testsuite.getAttribute('name') || 'Unknown';
        const tests = testsuite.getAttribute('tests') || '0';
        const time = testsuite.getAttribute('time') || '0';
        
        return {
            name: name,
            tests: tests,
            time: time
        };
    } catch (error) {
        console.error(`Error parsing ${xmlFile}: ${error.message}`);
        return null;
    }
}

/**
 * Find all XML files in the given directory.
 * 
 * @param {string} directory - Path to the directory
 * @returns {string[]} Array of XML file paths
 */
function findXmlFiles(directory) {
    try {
        if (!fs.existsSync(directory)) {
            console.error(`Error: Directory '${directory}' does not exist`);
            return [];
        }
        
        const stats = fs.statSync(directory);
        if (!stats.isDirectory()) {
            console.error(`Error: '${directory}' is not a directory`);
            return [];
        }
        
        // Find all .xml files in the directory (non-recursive)
        const files = fs.readdirSync(directory);
        const xmlFiles = files
            .filter(file => file.endsWith('.xml'))
            .map(file => path.join(directory, file))
            .filter(file => fs.statSync(file).isFile());
        
        return xmlFiles;
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return [];
    }
}

/**
 * Main entry point for the CLI utility.
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 1) {
        console.error('Usage: node index.js <directory>');
        process.exit(1);
    }
    
    const directory = args[0];
    const xmlFiles = findXmlFiles(directory);
    
    if (xmlFiles.length === 0) {
        console.error(`No XML files found in directory: ${directory}`);
        process.exit(1);
    }
    
    // Print CSV header
    console.log('TestSuite,Tests,Runtime');
    
    // Parse each XML file and output CSV rows
    xmlFiles.sort().forEach(xmlFile => {
        const data = parseJunitXml(xmlFile);
        if (data) {
            console.log(`${data.name},${data.tests},${data.time}`);
        }
    });
}

if (require.main === module) {
    main();
}

module.exports = { parseJunitXml, findXmlFiles };
