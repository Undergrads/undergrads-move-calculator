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
        'load': 1.0,        // Loading = baseline (tetris packing)
        'unload': 0.70,     // Unloading is 30% faster (grab & go)
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

function recommendMovers(residenceType, stairs, specialtyItems) {
    let movers = 2; // Minimum for safety

    // Base on residence type
    if (residenceType === '2bedroom') movers = 2;
    if (residenceType === '3bedroom') movers = 3;
    if (residenceType === '4bedroom') movers = 4;

    // Increase for stairs
    if (stairs === '2flights' || stairs === '3flights') {
        movers = Math.max(movers, 3);
    }

    // Increase for specialty items
    if (specialtyItems.length >= 2) movers = Math.max(movers, 3);
    if (specialtyItems.length >= 3) movers = Math.max(movers, 4);

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

    // Apply 2-hour minimum
    hours = Math.max(hours, 2);

    const movers = recommendMovers(residenceType, stairs, specialtyItems);
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
