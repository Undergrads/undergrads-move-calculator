// Undergrads Move Calculator Logic

let advancedMode = false;
let inventoryState = {}; // Track quantities for each item

document.getElementById('moveCalculator').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMove();
});

// Initialize inventory on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeInventory();
});

function toggleAdvancedMode() {
    advancedMode = !advancedMode;
    const advancedFields = document.getElementById('advancedFields');
    const toggleButton = document.getElementById('modeToggle');
    const modeText = toggleButton.querySelector('.mode-text');

    if (advancedMode) {
        advancedFields.classList.remove('hidden');
        modeText.textContent = 'Switch to Simple Estimate';
        toggleButton.classList.add('active');
        // Scroll to advanced fields
        setTimeout(() => {
            advancedFields.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        advancedFields.classList.add('hidden');
        modeText.textContent = 'Switch to Advanced Estimate';
        toggleButton.classList.remove('active');
    }
}

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

    // Get advanced mode values if enabled
    const advancedData = advancedMode ? getAdvancedInputs() : null;

    // Calculate
    let hours = getBaseHours(residenceType);
    hours = applyMoveTypeMultiplier(hours, moveType);

    const adjustments = calculateAdjustments(stairs, carryDistance, specialtyItems);
    hours += adjustments;

    // Apply advanced mode adjustments
    if (advancedMode && advancedData) {
        hours += calculateAdvancedAdjustments(advancedData);
    }

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
        specialtyItems,
        advancedMode,
        advancedData
    });
}

function getAdvancedInputs() {
    const inventory = getInventoryData();

    return {
        inventory: inventory,
        furniture: inventory.items, // Comprehensive inventory items
        totalVolume: inventory.totalVolume,
        totalItems: inventory.totalCount,
        boxCount: parseInt(document.getElementById('boxCount').value) || 0,
        packingStatus: parseInt(document.getElementById('packingStatus').value) || 100,
        floorNumber: parseInt(document.getElementById('floorNumber').value) || 0,
        elevatorStatus: document.getElementById('elevatorStatus').value,
        accessChallenges: Array.from(document.querySelectorAll('input[name="accessChallenge"]:checked'))
            .map(cb => cb.value),
        disassembly: document.getElementById('disassembly').value
    };
}

function calculateAdvancedAdjustments(data) {
    let adjustment = 0;

    // Comprehensive inventory volume adjustment
    // Industry standard: ~100 cubic feet = 1 hour of labor
    if (data.totalVolume > 0) {
        const volumeHours = data.totalVolume / 100;
        adjustment += volumeHours * 0.5; // More precise than base estimate
    }

    // Box count adjustment (every 10 boxes adds ~15 min)
    if (data.boxCount > 0) {
        adjustment += (data.boxCount / 10) * 0.25;
    }

    // Item count adjustment (many small items take longer)
    if (data.totalItems > 50) {
        adjustment += 0.5; // Many items to wrap/move
    }
    if (data.totalItems > 100) {
        adjustment += 0.5; // Very many items
    }

    // Packing status (not ready = longer time)
    if (data.packingStatus < 100) {
        const unpacked = 100 - data.packingStatus;
        adjustment += (unpacked / 100) * 1.5; // Up to 1.5 hours if nothing packed
    }

    // Specific floor number (more precise than flights)
    if (data.floorNumber > 0) {
        // Each floor adds ~20 minutes on average
        adjustment += (data.floorNumber - 1) * 0.33;
    }

    // Elevator reliability
    if (data.elevatorStatus === 'slow') adjustment += 0.5;
    if (data.elevatorStatus === 'passenger') adjustment += 0.25;
    if (data.elevatorStatus === 'none') adjustment += 1.0;

    // Access challenges (each adds time)
    adjustment += data.accessChallenges.length * 0.25;

    // Disassembly
    if (data.disassembly === 'minimal') adjustment += 0.5;
    if (data.disassembly === 'moderate') adjustment += 1.0;
    if (data.disassembly === 'extensive') adjustment += 1.5;

    return adjustment;
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

    // Advanced mode adjustments
    if (inputs.advancedMode && inputs.advancedData) {
        const advAdj = calculateAdvancedAdjustments(inputs.advancedData);
        if (advAdj > 0) {
            const advDetails = [];
            if (inputs.advancedData.boxCount > 0) advDetails.push(`${inputs.advancedData.boxCount} boxes`);
            if (inputs.advancedData.furniture.length > 0) advDetails.push(`${inputs.advancedData.furniture.length} furniture items`);
            if (inputs.advancedData.packingStatus < 100) advDetails.push(`${inputs.advancedData.packingStatus}% packed`);
            if (inputs.advancedData.disassembly && inputs.advancedData.disassembly !== 'none') advDetails.push('disassembly needed');

            steps.push({
                label: '🎯 Advanced details refinement',
                value: `+${advAdj.toFixed(1)} hours`,
                explanation: advDetails.join(', ')
            });
        }
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
    const highEstimate = Math.round((estimatedHours * 1.2) * 2) / 2);

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

// ========== INVENTORY SELECTOR FUNCTIONS ==========

function initializeInventory() {
    const accordion = document.getElementById('inventoryAccordion');
    if (!accordion || !inventoryData) return;

    accordion.innerHTML = inventoryData.rooms.map(room => {
        const roomId = room.id;
        return `
            <div class="accordion-section" data-room="${roomId}">
                <div class="accordion-header" onclick="toggleRoom('${roomId}')">
                    <span class="accordion-icon">▶</span>
                    <span class="accordion-title">${room.name}</span>
                    <span class="accordion-count" id="count-${roomId}">0 items</span>
                </div>
                <div class="accordion-content" id="content-${roomId}">
                    ${room.items.map(item => `
                        <div class="inventory-item">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">${item.cubicFeet} cu ft</div>
                            </div>
                            <div class="quantity-selector">
                                <button type="button" class="qty-btn qty-minus" onclick="updateQuantity('${item.id}', -1)">−</button>
                                <input type="number"
                                       id="qty-${item.id}"
                                       class="qty-input"
                                       value="0"
                                       min="0"
                                       max="99"
                                       onchange="setQuantity('${item.id}', this.value)"
                                       data-cubic-feet="${item.cubicFeet}">
                                <button type="button" class="qty-btn qty-plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Initialize inventory state
    inventoryData.rooms.forEach(room => {
        room.items.forEach(item => {
            inventoryState[item.id] = { quantity: 0, cubicFeet: item.cubicFeet };
        });
    });
}

function toggleRoom(roomId) {
    const content = document.getElementById(`content-${roomId}`);
    const icon = content.previousElementSibling.querySelector('.accordion-icon');

    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.textContent = '▶';
    } else {
        content.classList.add('open');
        icon.textContent = '▼';
    }
}

function expandAllRooms() {
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.add('open');
    });
    document.querySelectorAll('.accordion-icon').forEach(icon => {
        icon.textContent = '▼';
    });
}

function collapseAllRooms() {
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.remove('open');
    });
    document.querySelectorAll('.accordion-icon').forEach(icon => {
        icon.textContent = '▶';
    });
}

function updateQuantity(itemId, change) {
    const input = document.getElementById(`qty-${itemId}`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, Math.min(99, currentValue + change));

    input.value = newValue;
    inventoryState[itemId].quantity = newValue;

    updateInventorySummary();
    updateRoomCounts();
}

function setQuantity(itemId, value) {
    const quantity = Math.max(0, Math.min(99, parseInt(value) || 0));
    const input = document.getElementById(`qty-${itemId}`);

    input.value = quantity;
    inventoryState[itemId].quantity = quantity;

    updateInventorySummary();
    updateRoomCounts();
}

function updateInventorySummary() {
    let totalItems = 0;
    let totalCubicFeet = 0;

    Object.keys(inventoryState).forEach(itemId => {
        const item = inventoryState[itemId];
        totalItems += item.quantity;
        totalCubicFeet += item.quantity * item.cubicFeet;
    });

    const summaryItems = document.querySelector('.summary-items');
    const summaryVolume = document.querySelector('.summary-volume');

    if (summaryItems) summaryItems.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    if (summaryVolume) summaryVolume.textContent = `${totalCubicFeet.toFixed(0)} cu ft`;
}

function updateRoomCounts() {
    inventoryData.rooms.forEach(room => {
        let roomCount = 0;

        room.items.forEach(item => {
            roomCount += inventoryState[item.id].quantity;
        });

        const countElement = document.getElementById(`count-${room.id}`);
        if (countElement) {
            countElement.textContent = roomCount > 0 ? `${roomCount} item${roomCount !== 1 ? 's' : ''}` : '0 items';
            countElement.style.color = roomCount > 0 ? '#10b981' : '#94a3b8';
            countElement.style.fontWeight = roomCount > 0 ? '700' : '600';
        }
    });
}

function getInventoryData() {
    const items = [];
    let totalVolume = 0;

    Object.keys(inventoryState).forEach(itemId => {
        const item = inventoryState[itemId];
        if (item.quantity > 0) {
            items.push({ id: itemId, quantity: item.quantity, cubicFeet: item.cubicFeet });
            totalVolume += item.quantity * item.cubicFeet;
        }
    });

    return { items, totalVolume, totalCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}
