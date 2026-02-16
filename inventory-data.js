// Comprehensive Moving Inventory Data
// Organized by room with cubic feet measurements

const inventoryData = {
    rooms: [
        {
            id: 'living-room',
            name: '🛋️ Living Room',
            items: [
                { id: 'sofa-4seat', name: '4-Seater Sofa', cubicFeet: 55, category: 'Seating' },
                { id: 'sofa-3seat', name: '3-Seater Sofa', cubicFeet: 50, category: 'Seating' },
                { id: 'sofa-2seat', name: '2-Seater Sofa / Loveseat', cubicFeet: 35, category: 'Seating' },
                { id: 'sectional', name: 'Sectional Sofa (per section)', cubicFeet: 30, category: 'Seating' },
                { id: 'armchair', name: 'Armchair', cubicFeet: 10, category: 'Seating' },
                { id: 'recliner', name: 'Recliner / Lazy Boy', cubicFeet: 25, category: 'Seating' },
                { id: 'coffee-table', name: 'Coffee Table', cubicFeet: 10, category: 'Tables' },
                { id: 'end-table', name: 'End Table', cubicFeet: 5, category: 'Tables' },
                { id: 'bookcase-large', name: 'Bookcase (Large)', cubicFeet: 20, category: 'Storage' },
                { id: 'bookcase-small', name: 'Bookcase (Small)', cubicFeet: 10, category: 'Storage' },
                { id: 'tv-stand', name: 'TV Stand', cubicFeet: 15, category: 'Electronics' },
                { id: 'tv', name: 'TV (boxed)', cubicFeet: 10, category: 'Electronics' },
                { id: 'lamp-floor', name: 'Floor Lamp', cubicFeet: 5, category: 'Decor' },
                { id: 'lamp-table', name: 'Table Lamp', cubicFeet: 2, category: 'Decor' },
                { id: 'rug', name: 'Area Rug', cubicFeet: 5, category: 'Decor' },
                { id: 'mirror', name: 'Mirror', cubicFeet: 10, category: 'Decor' }
            ]
        },
        {
            id: 'dining-room',
            name: '🍽️ Dining Room',
            items: [
                { id: 'dining-table', name: 'Dining Table', cubicFeet: 30, category: 'Furniture' },
                { id: 'dining-chair', name: 'Dining Chair', cubicFeet: 5, category: 'Furniture' },
                { id: 'buffet', name: 'Buffet / Sideboard', cubicFeet: 25, category: 'Storage' },
                { id: 'china-cabinet', name: 'China Cabinet', cubicFeet: 30, category: 'Storage' }
            ]
        },
        {
            id: 'kitchen',
            name: '🍳 Kitchen',
            items: [
                { id: 'refrigerator', name: 'Refrigerator', cubicFeet: 60, category: 'Appliances' },
                { id: 'mini-fridge', name: 'Mini Fridge', cubicFeet: 10, category: 'Appliances' },
                { id: 'microwave', name: 'Microwave', cubicFeet: 5, category: 'Appliances' },
                { id: 'dishwasher', name: 'Dishwasher', cubicFeet: 25, category: 'Appliances' },
                { id: 'kitchen-table', name: 'Kitchen Table', cubicFeet: 20, category: 'Furniture' },
                { id: 'kitchen-chair', name: 'Kitchen Chair', cubicFeet: 5, category: 'Furniture' },
                { id: 'kitchen-cart', name: 'Kitchen Cart', cubicFeet: 10, category: 'Furniture' }
            ]
        },
        {
            id: 'master-bedroom',
            name: '🛏️ Master Bedroom',
            items: [
                { id: 'king-bed', name: 'King Bed (frame + mattress)', cubicFeet: 80, category: 'Beds' },
                { id: 'queen-bed', name: 'Queen Bed (frame + mattress)', cubicFeet: 60, category: 'Beds' },
                { id: 'dresser-large', name: 'Dresser (Large)', cubicFeet: 35, category: 'Storage' },
                { id: 'dresser-medium', name: 'Dresser (Medium)', cubicFeet: 25, category: 'Storage' },
                { id: 'chest-drawers', name: 'Chest of Drawers', cubicFeet: 30, category: 'Storage' },
                { id: 'nightstand', name: 'Nightstand', cubicFeet: 5, category: 'Storage' },
                { id: 'wardrobe', name: 'Wardrobe', cubicFeet: 40, category: 'Storage' },
                { id: 'bedroom-chair', name: 'Bedroom Chair', cubicFeet: 10, category: 'Furniture' }
            ]
        },
        {
            id: 'bedroom-2',
            name: '🛏️ Bedroom 2',
            items: [
                { id: 'double-bed', name: 'Double Bed (frame + mattress)', cubicFeet: 50, category: 'Beds' },
                { id: 'single-bed', name: 'Single/Twin Bed (frame + mattress)', cubicFeet: 40, category: 'Beds' },
                { id: 'bunk-bed', name: 'Bunk Bed', cubicFeet: 70, category: 'Beds' },
                { id: 'dresser-small', name: 'Dresser (Small)', cubicFeet: 20, category: 'Storage' },
                { id: 'nightstand-2', name: 'Nightstand', cubicFeet: 5, category: 'Storage' },
                { id: 'desk-small', name: 'Desk (Small)', cubicFeet: 20, category: 'Furniture' }
            ]
        },
        {
            id: 'home-office',
            name: '🏢 Home Office',
            items: [
                { id: 'desk-large', name: 'Desk (Large)', cubicFeet: 25, category: 'Furniture' },
                { id: 'office-chair', name: 'Office Chair', cubicFeet: 10, category: 'Furniture' },
                { id: 'filing-cabinet', name: 'Filing Cabinet', cubicFeet: 15, category: 'Storage' },
                { id: 'bookshelf-office', name: 'Bookshelf', cubicFeet: 15, category: 'Storage' },
                { id: 'computer-desk', name: 'Computer/Monitor', cubicFeet: 5, category: 'Electronics' },
                { id: 'printer', name: 'Printer', cubicFeet: 3, category: 'Electronics' }
            ]
        },
        {
            id: 'laundry',
            name: '🧺 Laundry / Utilities',
            items: [
                { id: 'washer', name: 'Washing Machine', cubicFeet: 30, category: 'Appliances' },
                { id: 'dryer', name: 'Dryer', cubicFeet: 30, category: 'Appliances' },
                { id: 'ironing-board', name: 'Ironing Board', cubicFeet: 3, category: 'Items' },
                { id: 'vacuum', name: 'Vacuum Cleaner', cubicFeet: 5, category: 'Items' }
            ]
        },
        {
            id: 'outdoor',
            name: '🌿 Outdoor / Garage / Patio',
            items: [
                { id: 'bbq', name: 'BBQ Grill', cubicFeet: 15, category: 'Outdoor' },
                { id: 'patio-table', name: 'Patio Table', cubicFeet: 20, category: 'Outdoor' },
                { id: 'patio-chair', name: 'Patio Chair', cubicFeet: 5, category: 'Outdoor' },
                { id: 'bicycle', name: 'Bicycle', cubicFeet: 10, category: 'Outdoor' },
                { id: 'lawn-mower', name: 'Lawn Mower', cubicFeet: 15, category: 'Outdoor' },
                { id: 'ladder', name: 'Ladder', cubicFeet: 10, category: 'Tools' },
                { id: 'toolbox', name: 'Toolbox', cubicFeet: 5, category: 'Tools' },
                { id: 'workbench', name: 'Workbench', cubicFeet: 25, category: 'Tools' }
            ]
        },
        {
            id: 'boxes',
            name: '📦 Boxes & Packed Items',
            items: [
                { id: 'box-small', name: 'Small Box (1.5 cu ft)', cubicFeet: 1.5, category: 'Boxes' },
                { id: 'box-medium', name: 'Medium Box (3 cu ft)', cubicFeet: 3, category: 'Boxes' },
                { id: 'box-large', name: 'Large Box (4.5 cu ft)', cubicFeet: 4.5, category: 'Boxes' },
                { id: 'wardrobe-box', name: 'Wardrobe Box', cubicFeet: 15, category: 'Boxes' },
                { id: 'suitcase-large', name: 'Large Suitcase', cubicFeet: 10, category: 'Boxes' },
                { id: 'suitcase-small', name: 'Small Suitcase', cubicFeet: 5, category: 'Boxes' }
            ]
        }
    ]
};
