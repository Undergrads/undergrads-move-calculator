// Undergrads Move Calculator Logic

document.getElementById('moveCalculator').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMove();
});

function getBaseHours(residenceType) {
    // Base hours for LOAD ONLY (from industry research)
    const baseHours = {
        'studio': 1.5,      // Load only: 1.5-2 hours
        '1bedroom': 2,      // Load only: 2 hours
        '2bedroom': 3,      // Load only: 3 hours
        '3bedroom': 4,      // Load only: 4 hours
        '4bedroom': 6       // Load only: 5-6 hours
    };
    return baseHours[residenceType] || 2;
}

function applyMoveTypeMultiplier(baseHours, moveType) {
    // Labor-only multipliers (base = loading time)
    const multipliers = {
        'load': 1.0,        // Loading only = baseline (tetris packing)
        'unload': 0.70,     // Unloading only is 30% faster (grab & go)
        'both': 1.70,       // Load + Unload (1.0 + 0.70 = both locations)
        'inhouse': 0.80     // In-house moves (similar to unload)
    };
    return baseHours * (multipliers[moveType] || 1.0);
}

function calculateAdjustments(stairs, carryDistance, specialtyItems) {
    let adjustment = 0;

    // Stairs (each flight adds 0.5-1 hour)
    if (stairs === '1flight') adjustment += 0.75;
    if (stairs === '2flights') adjustment += 1.5;
    if (stairs === '3flights') adjustment += 2.5;

    // Long carry distance
    if (carryDistance === 'moderate') adjustment += 0.5;
    if (carryDistance === 'long') adjustment += 1.0;

    // Specialty items (each adds ~30 min)
    const itemCount = specialtyItems.length;
    if (itemCount === 1 || itemCount === 2) adjustment += 0.5;
    if (itemCount >= 3) adjustment += 1.0;

    return adjustment;
}

function recommendMovers(residenceType, stairs, specialtyItems, estimatedHours) {
    let movers = 2; // Start with minimum

    // Business strategy: Prefer 4 movers for speed and reliability
    // Target: Keep jobs under 4-5 hours maximum

    // Base on residence type - default to 4 movers for most jobs
    if (residenceType === 'studio') movers = 2;
    if (residenceType === '1bedroom') movers = 3; // Small jobs: 3 movers
    if (residenceType === '2bedroom') movers = 4; // Medium jobs: 4 movers (de-risk!)
    if (residenceType === '3bedroom') movers = 4;
    if (residenceType === '4bedroom') movers = 4;

    // Increase for complex factors
    if (stairs === '2flights' || stairs === '3flights') {
        movers = Math.max(movers, 4); // Always 4+ for multiple flights
    }

    if (specialtyItems.length >= 2) movers = Math.max(movers, 4);

    // Time-based optimization: If job would exceed 5 hours, add more movers
    if (estimatedHours > 0) {
        const hoursWithCurrentCrew = estimatedHours / movers;
        if (hoursWithCurrentCrew > 5 && movers < 5) {
            movers++; // Add one more mover to stay under 5 hours
        }
    }

    return movers;
}

function calculateMove() {
    // Get form values
    const residenceType = document.getElementById('residenceType').value;
    const moveType = document.getElementById('moveType').value;
    const stairs = document.getElementById('stairs').value;
    const carryDistance = document.getElementById('carryDistance').value;

    const specialtyItems = Array.from(document.querySelectorAll('input[name="specialtyItems"]:checked'))
        .map(cb => cb.value);

    // Calculate
    let hours = getBaseHours(residenceType);
    hours = applyMoveTypeMultiplier(hours, moveType);

    const adjustments = calculateAdjustments(stairs, carryDistance, specialtyItems);
    hours += adjustments;

    // Round to nearest 0.5 hour
    hours = Math.round(hours * 2) / 2;

    // Calculate total person-hours first (before applying minimum)
    const rawPersonHours = hours;

    // Get recommended movers (optimized for 4-5 hour jobs)
    const movers = recommendMovers(residenceType, stairs, specialtyItems, hours);

    // Calculate actual hours with crew size
    hours = rawPersonHours; // Use base calculation

    // Apply 2-hour minimum
    hours = Math.max(hours, 2);

    const totalPersonHours = hours * movers;

    // Display results
    displayResults(hours, movers, totalPersonHours, {
        residenceType,
        moveType,
        stairs,
        carryDistance,
        specialtyItems
    });
}

function displayResults(hours, movers, totalPersonHours, inputs) {
    // Update result values
    document.getElementById('estimatedHours').textContent = `${hours} hours`;
    document.getElementById('recommendedMovers').textContent = `${movers} movers`;
    document.getElementById('totalPersonHours').textContent = `${totalPersonHours} person-hours`;

    // Create calculation breakdown
    createCalculationBreakdown(inputs, hours);

    // Create time range visual
    createTimeRangeVisual(hours);

    // Build factors list
    const factors = [];

    // Residence type
    const residenceLabels = {
        'studio': 'Studio apartment',
        '1bedroom': '1 bedroom residence',
        '2bedroom': '2 bedroom residence',
        '3bedroom': '3 bedroom residence',
        '4bedroom': '4+ bedroom residence'
    };
    factors.push(residenceLabels[inputs.residenceType]);

    // Move type
    const moveTypeLabels = {
        'load': 'Load only (pack truck)',
        'unload': 'Unload only (unpack truck)',
        'both': 'Load & Unload (customer drives truck)',
        'inhouse': 'In-house move'
    };
    factors.push(moveTypeLabels[inputs.moveType]);

    // Stairs
    const stairsLabels = {
        'ground': 'Ground floor / Elevator',
        '1flight': '1 flight of stairs',
        '2flights': '2 flights of stairs',
        '3flights': '3+ flights of stairs'
    };
    factors.push(stairsLabels[inputs.stairs]);

    // Carry distance
    const carryLabels = {
        'close': 'Close parking (under 50 feet)',
        'moderate': 'Moderate distance (50-150 feet)',
        'long': 'Long carry (150+ feet)'
    };
    factors.push(carryLabels[inputs.carryDistance]);

    // Specialty items
    if (inputs.specialtyItems.length > 0) {
        factors.push(`${inputs.specialtyItems.length} specialty item(s)`);
    }

    // Display factors
    const factorsList = document.getElementById('estimateFactors');
    factorsList.innerHTML = factors.map(f => `<li>${f}</li>`).join('');

    // Show results section
    document.getElementById('results').classList.remove('hidden');

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function resetCalculator() {
    document.getElementById('moveCalculator').reset();
    document.getElementById('results').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createCalculationBreakdown(inputs, finalHours) {
    const steps = [];

    // Step 1: Base hours
    const baseHours = getBaseHours(inputs.residenceType);
    const residenceLabels = {
        'studio': 'Studio apartment',
        '1bedroom': '1 bedroom',
        '2bedroom': '2 bedroom',
        '3bedroom': '3 bedroom',
        '4bedroom': '4+ bedroom'
    };
    steps.push({
        label: `Base time for ${residenceLabels[inputs.residenceType]} (loading)`,
        value: `${baseHours} hours`,
        explanation: 'Industry standard for labor-only loading service'
    });

    // Step 2: Move type multiplier
    const moveTypeLabels = {
        'load': 'Load only (1.0×)',
        'unload': 'Unload only (0.70× - faster!)',
        'both': 'Load & Unload (1.70×)',
        'inhouse': 'In-house move (0.80×)'
    };
    const multipliers = {
        'load': 1.0,
        'unload': 0.70,
        'both': 1.70,
        'inhouse': 0.80
    };
    const afterMultiplier = baseHours * multipliers[inputs.moveType];
    steps.push({
        label: `Service type: ${moveTypeLabels[inputs.moveType]}`,
        value: `${afterMultiplier.toFixed(1)} hours`,
        explanation: inputs.moveType === 'unload' ? 'Unloading is faster - just grab and go!' :
                     inputs.moveType === 'both' ? 'Includes both loading and unloading time' : ''
    });

    // Step 3: Adjustments
    let adjustmentTotal = 0;
    const adjustmentDetails = [];

    // Stairs
    const stairsAdjustments = {
        '1flight': 0.75,
        '2flights': 1.5,
        '3flights': 2.5
    };
    if (inputs.stairs !== 'ground' && stairsAdjustments[inputs.stairs]) {
        const stairsTime = stairsAdjustments[inputs.stairs];
        adjustmentTotal += stairsTime;
        adjustmentDetails.push(`Stairs: +${stairsTime} hrs`);
    }

    // Carry distance
    const distanceAdjustments = {
        'moderate': 0.5,
        'long': 1.0
    };
    if (inputs.carryDistance !== 'close' && distanceAdjustments[inputs.carryDistance]) {
        const distanceTime = distanceAdjustments[inputs.carryDistance];
        adjustmentTotal += distanceTime;
        adjustmentDetails.push(`Parking distance: +${distanceTime} hrs`);
    }

    // Specialty items
    if (inputs.specialtyItems.length > 0) {
        const itemTime = inputs.specialtyItems.length >= 3 ? 1.0 : 0.5;
        adjustmentTotal += itemTime;
        adjustmentDetails.push(`${inputs.specialtyItems.length} specialty items: +${itemTime} hrs`);
    }

    if (adjustmentTotal > 0) {
        steps.push({
            label: 'Additional factors',
            value: `+${adjustmentTotal.toFixed(1)} hours`,
            explanation: adjustmentDetails.join(', ')
        });
    }

    // Final step
    steps.push({
        label: 'Total estimated time',
        value: `${finalHours} hours`,
        explanation: '2-hour minimum applied',
        isFinal: true
    });

    // Render steps
    const stepsContainer = document.getElementById('calculationSteps');
    stepsContainer.innerHTML = steps.map((step, index) => `
        <div class="calc-step ${step.isFinal ? 'calc-step-final' : ''}">
            <div class="calc-step-number">${index + 1}</div>
            <div class="calc-step-content">
                <div class="calc-step-label">${step.label}</div>
                ${step.explanation ? `<div class="calc-step-explanation">${step.explanation}</div>` : ''}
            </div>
            <div class="calc-step-value">${step.value}</div>
        </div>
    `).join('');
}

function createTimeRangeVisual(estimatedHours) {
    // Calculate range: -20% to +20%
    const lowEstimate = Math.max(2, Math.round((estimatedHours * 0.8) * 2) / 2);
    const highEstimate = Math.round((estimatedHours * 1.2) * 2) / 2;

    // Update markers
    document.getElementById('timeLow').style.left = '10%';
    document.getElementById('timeEstimate').style.left = '50%';
    document.getElementById('timeHigh').style.left = '90%';

    document.getElementById('timeLabelLow').textContent = `${lowEstimate} hrs`;
    document.getElementById('timeLabelEstimate').textContent = `${estimatedHours} hrs`;
    document.getElementById('timeLabelHigh').textContent = `${highEstimate} hrs`;

    // Animate the fill
    const fillBar = document.getElementById('timeBarFill');
    setTimeout(() => {
        fillBar.style.width = '100%';
    }, 300);
}
