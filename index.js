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
 * @returns {Array|null} Array of objects with keys: name, tests, time, or null if parsing fails
 */
function parseJunitXml(xmlFile) {
    try {
        const xmlContent = fs.readFileSync(xmlFile, 'utf8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Handle both testsuite and testsuites root elements
        const results = [];
        const root = doc.documentElement;
        
        if (root.tagName === 'testsuite') {
            // Single testsuite as root
            const name = root.getAttribute('name') || 'Unknown';
            const tests = root.getAttribute('tests') || '0';
            const time = root.getAttribute('time') || '0';
            results.push({ name, tests, time });
        } else if (root.tagName === 'testsuites') {
            // Multiple testsuites - extract all of them
            const testsuites = root.getElementsByTagName('testsuite');
            for (let i = 0; i < testsuites.length; i++) {
                const testsuite = testsuites[i];
                const name = testsuite.getAttribute('name') || 'Unknown';
                const tests = testsuite.getAttribute('tests') || '0';
                const time = testsuite.getAttribute('time') || '0';
                results.push({ name, tests, time });
            }
        }
        
        if (results.length === 0) {
            return null;
        }
        
        return results;
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
 * Distribute test suites across waves using the Longest Processing Time (LPT) algorithm.
 * This greedy algorithm sorts items by runtime (descending) and assigns each to the wave
 * with the smallest current total runtime, resulting in a relatively balanced distribution.
 * 
 * @param {Array} testsuites - Array of testsuite objects with name, tests, and time properties
 * @param {number} numWaves - Number of waves to distribute to
 * @returns {Array} Array of testsuite objects with added wave property
 */
function distributeToWaves(testsuites, numWaves) {
    if (numWaves <= 0 || testsuites.length === 0) {
        return testsuites;
    }
    
    // Initialize wave tracking
    const waves = Array.from({ length: numWaves }, (_, i) => ({
        name: `wave ${i + 1}`,
        totalTime: 0,
        suites: []
    }));
    
    // Sort test suites by runtime in descending order
    const sortedSuites = testsuites.slice().sort((a, b) => {
        return parseFloat(b.time) - parseFloat(a.time);
    });
    
    // Assign each suite to the wave with the smallest current total
    sortedSuites.forEach(suite => {
        // Find wave with minimum total time
        let minWave = waves[0];
        for (let i = 1; i < waves.length; i++) {
            if (waves[i].totalTime < minWave.totalTime) {
                minWave = waves[i];
            }
        }
        
        // Assign suite to this wave
        suite.wave = minWave.name;
        minWave.totalTime += parseFloat(suite.time);
        minWave.suites.push(suite);
    });
    
    return testsuites;
}

/**
 * Main entry point for the CLI utility.
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1 || args.length > 2) {
        console.error('Usage: node index.js <directory> [numWaves]');
        process.exit(1);
    }
    
    const directory = args[0];
    const xmlFiles = findXmlFiles(directory);
    
    if (xmlFiles.length === 0) {
        console.error(`No XML files found in directory: ${directory}`);
        process.exit(1);
    }
    
    // Determine number of waves: use second arg if provided, otherwise number of XML files
    const numWaves = args.length === 2 ? parseInt(args[1], 10) : xmlFiles.length;
    
    if (isNaN(numWaves) || numWaves <= 0) {
        console.error('Error: numWaves must be a positive integer');
        process.exit(1);
    }
    
    // Collect all test suites from all XML files
    const allTestSuites = [];
    xmlFiles.sort().forEach(xmlFile => {
        const testsuites = parseJunitXml(xmlFile);
        if (testsuites) {
            allTestSuites.push(...testsuites);
        }
    });
    
    // Distribute test suites to waves
    distributeToWaves(allTestSuites, numWaves);
    
    // Print CSV header
    console.log('TestSuite,Tests,Runtime,Wave');
    
    // Output CSV rows
    allTestSuites.forEach(data => {
        console.log(`${data.name},${data.tests},${data.time},${data.wave}`);
    });
}

if (require.main === module) {
    main();
}

module.exports = { parseJunitXml, findXmlFiles, distributeToWaves };
