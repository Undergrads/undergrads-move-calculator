# Undergrads Move Calculator Logic

## Calculator Inputs

### 1. Residence Type (Dropdown)
- Studio
- 1 Bedroom
- 2 Bedroom
- 3 Bedroom
- 4+ Bedroom

### 2. Number of Rooms (Optional number input)
- Allows for more precise calculation
- Default: based on residence type

### 3. Move Type (Dropdown) **REQUIRED**
- Load Only
- Unload Only
- Load & Unload (Full Service)
- In-House Move

### 4. Stairs/Floors (Dropdown)
- Ground floor / Elevator
- 1 flight of stairs
- 2 flights of stairs
- 3+ flights of stairs

### 5. Drive Distance (Dropdown)
- Under 10 miles (local)
- 10-40 miles
- 40-75 miles
- 75-100 miles
- N/A (in-house move)

### 6. Specialty Items (Checkboxes)
- Piano
- Safe (400+ lbs)
- Pool table
- Large sectional couch
- Treadmill/exercise equipment
- Other heavy item (400+ lbs)

### 7. Packing Services (Dropdown)
- No packing needed
- Partial packing (some items)
- Full packing service

## Calculation Logic

### Step 1: Base Hours Calculation

```javascript
function getBaseHours(residenceType) {
  const baseHours = {
    'studio': 2.5,      // Average of 2-3
    '1bedroom': 3,      // Average of 2-4
    '2bedroom': 4.5,    // Average of 3-6
    '3bedroom': 6.5,    // Average of 5-8
    '4bedroom': 10      // Average of 8-12
  };
  return baseHours[residenceType];
}
```

### Step 2: Apply Move Type Multiplier

```javascript
function applyMoveTypeMultiplier(baseHours, moveType) {
  const multipliers = {
    'load': 1.0,
    'unload': 0.75,      // 25% faster!
    'both': 1.75,
    'inhouse': 0.85      // Similar to unload but slightly more
  };
  return baseHours * multipliers[moveType];
}
```

### Step 3: Add Adjustment Factors

```javascript
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
```

### Step 4: Calculate Recommended Movers

```javascript
function recommendMovers(residenceType, stairs, specialtyItems, packing) {
  let movers = 2; // Default minimum

  // Base on residence type
  if (residenceType === '2bedroom') movers = 2; // Can be 2 or 3
  if (residenceType === '3bedroom') movers = 3;
  if (residenceType === '4bedroom') movers = 4;

  // Increase for stairs
  if (stairs === '2flights' || stairs === '3flights') movers = Math.max(movers, 3);

  // Increase for specialty items
  if (specialtyItems.length >= 2) movers = Math.max(movers, 3);
  if (specialtyItems.length >= 3) movers = Math.max(movers, 4);

  // Increase for packing
  if (packing === 'full') movers += 1;

  return movers;
}
```

### Step 5: Final Calculation

```javascript
function calculateMove(inputs) {
  // Get base hours
  let hours = getBaseHours(inputs.residenceType);

  // Apply move type multiplier
  hours = applyMoveTypeMultiplier(hours, inputs.moveType);

  // Add adjustments
  const adjustments = calculateAdjustments(
    inputs.stairs,
    inputs.distance,
    inputs.specialtyItems,
    inputs.packing
  );
  hours += adjustments;

  // Round to nearest 0.5 hour
  hours = Math.round(hours * 2) / 2;

  // Determine movers
  const movers = recommendMovers(
    inputs.residenceType,
    inputs.stairs,
    inputs.specialtyItems,
    inputs.packing
  );

  return {
    estimatedHours: hours,
    recommendedMovers: movers,
    totalPersonHours: hours * movers
  };
}
```

## Output Display

The calculator will show:

1. **Estimated Hours**: X.X hours
2. **Recommended Movers**: X movers
3. **Total Labor**: XX person-hours
4. **Explanation**: Brief text explaining the estimate

Example output:
```
📦 Your Move Estimate

⏰ Estimated Time: 5.5 hours
👥 Recommended Movers: 3 movers
📊 Total Labor: 16.5 person-hours

Based on:
- 2 bedroom residence
- Load & Unload service
- 1 flight of stairs
- 10-40 mile distance
- No specialty items

This estimate includes loading, driving, and unloading time.
```

## Example Calculations

### Example 1: Small Apartment
- Studio, Unload Only, Ground floor, Under 10 miles, No specialty items
- Base: 2.5 hours
- Multiplier (unload): 2.5 × 0.75 = 1.875 hours
- Adjustments: 0
- **Total: 2 hours, 2 movers**

### Example 2: Medium Move
- 2 Bedroom, Load & Unload, 1 flight stairs, 10-40 miles, 1 piano
- Base: 4.5 hours
- Multiplier (both): 4.5 × 1.75 = 7.875 hours
- Adjustments: +0.75 (stairs) + 0.5 (distance) + 0.5 (specialty) = 1.75
- Total: 7.875 + 1.75 = 9.625
- **Total: 9.5 hours, 3 movers**

### Example 3: Large Move
- 4 Bedroom, Load & Unload, 2 flights stairs, 40-75 miles, 2 specialty items, Partial packing
- Base: 10 hours
- Multiplier (both): 10 × 1.75 = 17.5 hours
- Adjustments: +1.5 (stairs) + 1.5 (distance) + 0.5 (specialty) + 1.5 (packing) = 5
- Total: 17.5 + 5 = 22.5
- **Total: 22.5 hours, 5 movers**

## Notes

- All estimates are approximations
- Real moves can vary by ±15-20%
- Factors not accounted for: weather, elevator wait times, narrow doorways, etc.
- Always recommend contacting for precise quote
