/**
 * Royalty Calculator Unit Tests
 * Simple test suite for EnhancedRoyaltyCalculator logic
 */
import { EnhancedRoyaltyCalculator } from '../js/modules/enhanced-royalty-calculator.js';

async function runTests() {
    const calculator = new EnhancedRoyaltyCalculator();
    let passed = 0;
    let failed = 0;

    console.log('--- Starting Royalty Calculator Tests ---\n');

    // Test Case 1: Fixed Rate Calculation
    try {
        const fixedRecord = {
            entity: 'Test Entity',
            mineral: 'Gold',
            quantity: 100,
            price: 50,
            rate: 5,
            calculationType: 'fixed'
        };
        const result = await calculator.calculateRoyalty(fixedRecord);

        // 100 * 50 = 5000. 5% of 5000 = 250.
        const expectedBase = 250;
        if (result.summary.baseRoyalty === expectedBase) {
            console.log('✅ Test 1: Fixed Rate - Passed');
            passed++;
        } else {
            console.log(`❌ Test 1: Fixed Rate - Failed (Expected ${expectedBase}, got ${result.summary.baseRoyalty})`);
            failed++;
        }
    } catch (e) {
        console.log('❌ Test 1: Fixed Rate - Error', e.message);
        failed++;
    }

    // Test Case 2: Tiered Rate Calculation
    try {
        const tieredRecord = {
            entity: 'Test Entity',
            mineral: 'Coal',
            quantity: 1500,
            price: 10,
            calculationType: 'tiered',
            tiers: [
                { from: 0, to: 1000, rate: 5 },
                { from: 1000, to: 5000, rate: 10 }
            ]
        };
        const result = await calculator.calculateRoyalty(tieredRecord);

        // 1000 @ 5% = 50. 500 @ 10% = 50. Total = 100.
        // Wait, price is 10. Gross is 15000.
        // 1000 units at $10 = $10,000. 5% = 500.
        // 500 units at $10 = $5,000. 10% = 500.
        // Total = 1000.
        const expectedBase = 1000;
        if (result.summary.baseRoyalty === expectedBase) {
            console.log('✅ Test 2: Tiered Rate - Passed');
            passed++;
        } else {
            console.log(`❌ Test 2: Tiered Rate - Failed (Expected ${expectedBase}, got ${result.summary.baseRoyalty})`);
            failed++;
        }
    } catch (e) {
        console.log('❌ Test 2: Tiered Rate - Error', e.message);
        failed++;
    }

    // Test Case 3: Validation (Missing Fields)
    try {
        const invalidRecord = {
            entity: 'Test Entity'
        };
        await calculator.calculateRoyalty(invalidRecord);
        console.log('❌ Test 3: Validation - Failed (Should have thrown error)');
        failed++;
    } catch (e) {
        console.log('✅ Test 3: Validation - Passed');
        passed++;
    }

    // Test Case 4: Sliding Scale Calculation
    try {
        const slidingRecord = {
            entity: 'Test Entity',
            mineral: 'Zinc',
            quantity: 100,
            marketPrice: 200, // High price
            calculationType: 'sliding_scale',
            baseRate: 5,
            scales: [
                { from: 0, to: 100, rate: 5 },
                { from: 101, to: 500, rate: 10 }
            ]
        };
        const result = await calculator.calculateRoyalty(slidingRecord);

        // marketPrice is 200, so rate should be 10%.
        // 100 * 200 = 20,000. 10% = 2000.
        const expectedBase = 2000;
        if (result.summary.baseRoyalty === expectedBase) {
            console.log('✅ Test 4: Sliding Scale - Passed');
            passed++;
        } else {
            console.log(`❌ Test 4: Sliding Scale - Failed (Expected ${expectedBase}, got ${result.summary.baseRoyalty})`);
            failed++;
        }
    } catch (e) {
        console.log('❌ Test 4: Sliding Scale - Error', e.message);
        failed++;
    }

    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
