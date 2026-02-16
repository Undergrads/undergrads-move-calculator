// Undergrads Move Calculator Logic

document.getElementById('moveCalculator').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMove();
});

function getBaseHours(residenceType) {
    const baseHours = {
        'studio': 2.5,
        '1bedroom': 3,
        '2bedroom': 4.5,
        '3bedroom': 6.5,
        '4bedroom': 10
    };
    return baseHours[residenceType] || 3;
}

function applyMoveTypeMultiplier(baseHours, moveType) {
    const multipliers = {
        'load': 1.0,
        'unload': 0.75,
        'both': 1.75,
        'inhouse': 0.85
    };
    return baseHours * (multipliers[moveType] || 1.0);
}

function calculateAdjustments(stairs, distance, specialtyItems, packing) {
    let adjustment = 0;

    // Stairs
    if (stairs === '1flight') adjustment += 0.75;
    if (stairs === '2flights') adjustment += 1.5;
    if (stairs === '3flights') adjustment += 2.5;

    // Drive distance
    if (distance === '10-40') adjustment += 0.5;
    if (distance === '40-75') adjustment += 1.5;
    if (distance === '75-100') adjustment += 2.5;

    // Specialty items
    const itemCount = specialtyItems.length;
    if (itemCount === 1 || itemCount === 2) adjustment += 0.5;
    if (itemCount >= 3) adjustment += 1.0;

    // Packing
    if (packing === 'partial') adjustment += 1.5;
    if (packing === 'full') adjustment += 2.5;

    return adjustment;
}

function recommendMovers(residenceType, stairs, specialtyItems, packing) {
    let movers = 2;

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

    // Increase for packing
    if (packing === 'full') movers += 1;

    return movers;
}

function calculateMove() {
    // Get form values
    const residenceType = document.getElementById('residenceType').value;
    const moveType = document.getElementById('moveType').value;
    const stairs = document.getElementById('stairs').value;
    const distance = document.getElementById('distance').value;
    const packing = document.getElementById('packing').value;

    const specialtyItems = Array.from(document.querySelectorAll('input[name="specialtyItems"]:checked'))
        .map(cb => cb.value);

    // Calculate
    let hours = getBaseHours(residenceType);
    hours = applyMoveTypeMultiplier(hours, moveType);

    const adjustments = calculateAdjustments(stairs, distance, specialtyItems, packing);
    hours += adjustments;

    // Round to nearest 0.5 hour
    hours = Math.round(hours * 2) / 2;

    const movers = recommendMovers(residenceType, stairs, specialtyItems, packing);
    const totalPersonHours = hours * movers;

    // Display results
    displayResults(hours, movers, totalPersonHours, {
        residenceType,
        moveType,
        stairs,
        distance,
        specialtyItems,
        packing
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
        'load': 'Load only',
        'unload': 'Unload only',
        'both': 'Load & Unload (full service)',
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

    // Distance
    if (inputs.distance !== 'na') {
        const distanceLabels = {
            'under10': 'Under 10 miles',
            '10-40': '10-40 miles',
            '40-75': '40-75 miles',
            '75-100': '75-100 miles'
        };
        factors.push(distanceLabels[inputs.distance]);
    }

    // Specialty items
    if (inputs.specialtyItems.length > 0) {
        factors.push(`${inputs.specialtyItems.length} specialty item(s)`);
    }

    // Packing
    if (inputs.packing !== 'none') {
        const packingLabels = {
            'partial': 'Partial packing service',
            'full': 'Full packing service'
        };
        factors.push(packingLabels[inputs.packing]);
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
