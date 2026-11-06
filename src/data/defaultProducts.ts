import { Product, Category } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [
  {
    ProductID: 'PRD-1001',
    ProductName: 'Pro Audio Wireless Headphones',
    CategoryID: 'Electronics',
    CostPrice: 48.00,
    SalePrice: 119.99,
    Stock: 45,
    Status: 'In Stock',
    MinStock: 15,
    LastUpdated: '2026-11-04T10:30:00Z',
    Notes: 'Active noise cancellation with 40-hour battery life.'
  },
  {
    ProductID: 'PRD-1002',
    ProductName: 'Mechanical Ergonomic Keyboard',
    CategoryID: 'Computer Peripherals',
    CostPrice: 38.50,
    SalePrice: 89.90,
    Stock: 28,
    Status: 'In Stock',
    MinStock: 10,
    LastUpdated: '2026-11-04T11:15:00Z',
    Notes: 'Hot-swappable tactile switches with RGB backlighting.'
  },
  {
    ProductID: 'PRD-1003',
    ProductName: 'Precision Wireless Gaming Mouse',
    CategoryID: 'Computer Peripherals',
    CostPrice: 22.00,
    SalePrice: 59.99,
    Stock: 8,
    Status: 'Low Stock',
    MinStock: 12,
    LastUpdated: '2026-11-05T09:00:00Z',
    Notes: 'Ultra-lightweight 58g chassis, 26K DPI optical sensor.'
  },
  {
    ProductID: 'PRD-1004',
    ProductName: 'Ultra-Wide 34-Inch Curved Monitor',
    CategoryID: 'Displays',
    CostPrice: 285.00,
    SalePrice: 479.99,
    Stock: 14,
    Status: 'In Stock',
    MinStock: 8,
    LastUpdated: '2026-11-03T16:20:00Z',
    Notes: '165Hz refresh rate, 1ms response, HDR400 calibrated.'
  },
  {
    ProductID: 'PRD-1005',
    ProductName: 'Smart Desk Ambient Light Bar',
    CategoryID: 'Smart Home',
    CostPrice: 19.50,
    SalePrice: 49.95,
    Stock: 4,
    Status: 'Low Stock',
    MinStock: 10,
    LastUpdated: '2026-11-05T14:45:00Z',
    Notes: 'Screen glare-free monitor mount with touch wireless remote.'
  },
  {
    ProductID: 'PRD-1006',
    ProductName: 'Thunderbolt 4 Universal Docking Station',
    CategoryID: 'Computer Peripherals',
    CostPrice: 110.00,
    SalePrice: 219.00,
    Stock: 0,
    Status: 'Out of Stock',
    MinStock: 5,
    LastUpdated: '2026-11-02T13:10:00Z',
    Notes: '100W Power Delivery, triple 4K display support, 10Gbps ports.'
  },
  {
    ProductID: 'PRD-1007',
    ProductName: 'Studio Condenser USB Microphone',
    CategoryID: 'Audio & Gear',
    CostPrice: 32.00,
    SalePrice: 79.99,
    Stock: 32,
    Status: 'In Stock',
    MinStock: 10,
    LastUpdated: '2026-11-05T08:12:00Z',
    Notes: 'Cardioid polar pattern with integrated shock mount & pop filter.'
  },
  {
    ProductID: 'PRD-1008',
    ProductName: 'Anodized Aluminum Laptop Riser',
    CategoryID: 'Office & Desk',
    CostPrice: 14.20,
    SalePrice: 39.99,
    Stock: 52,
    Status: 'In Stock',
    MinStock: 20,
    LastUpdated: '2026-11-01T17:00:00Z',
    Notes: 'Sandblasted aerospace aluminum with anti-slip silicone pads.'
  },
  {
    ProductID: 'PRD-1009',
    ProductName: 'Braided 100W USB-C Fast Cable (2M)',
    CategoryID: 'Accessories',
    CostPrice: 3.50,
    SalePrice: 16.99,
    Stock: 140,
    Status: 'In Stock',
    MinStock: 30,
    LastUpdated: '2026-11-05T18:20:00Z',
    Notes: 'E-marker chip, 480Mbps data sync, Kevlar reinforced core.'
  },
  {
    ProductID: 'PRD-1010',
    ProductName: 'GaN 65W Triple-Port Wall Charger',
    CategoryID: 'Accessories',
    CostPrice: 13.80,
    SalePrice: 34.50,
    Stock: 6,
    Status: 'Low Stock',
    MinStock: 15,
    LastUpdated: '2026-11-05T15:30:00Z',
    Notes: 'Dual USB-C PD and single USB-A fold-away travel prongs.'
  },
  {
    ProductID: 'PRD-1011',
    ProductName: 'Desk Mat Minimalist Vegan Leather (900x400)',
    CategoryID: 'Office & Desk',
    CostPrice: 8.40,
    SalePrice: 24.99,
    Stock: 65,
    Status: 'In Stock',
    MinStock: 20,
    LastUpdated: '2026-11-04T12:00:00Z',
    Notes: 'Waterproof reversible dual-tone desk pad.'
  },
  {
    ProductID: 'PRD-1012',
    ProductName: 'Smart Wi-Fi Power Strip with Energy Monitor',
    CategoryID: 'Smart Home',
    CostPrice: 16.00,
    SalePrice: 42.00,
    Stock: 0,
    Status: 'Out of Stock',
    MinStock: 10,
    LastUpdated: '2026-10-28T09:40:00Z',
    Notes: '4 AC surge sockets, 3 smart USB ports, automated schedules.'
  },
  {
    ProductID: 'PRD-1013',
    ProductName: 'Vintage Legacy Retro Mechanical Keycaps',
    CategoryID: 'Computer Peripherals',
    CostPrice: 18.00,
    SalePrice: 45.00,
    Stock: 0,
    Status: 'Discontinued',
    MinStock: 0,
    LastUpdated: '2026-10-15T14:00:00Z',
    Notes: 'Limited production run, dye-sublimated PBT cherry profile.'
  },
  {
    ProductID: 'PRD-1014',
    ProductName: '4K Ultra HD Streaming Webcam with Privacy Cover',
    CategoryID: 'Electronics',
    CostPrice: 42.00,
    SalePrice: 109.99,
    Stock: 19,
    Status: 'In Stock',
    MinStock: 8,
    LastUpdated: '2026-11-05T11:20:00Z',
    Notes: 'Auto-framing dual stereo noise reduction microphones.'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    CategoryID: 'CAT-101',
    CategoryName: 'Electronics',
    Note: 'Consumer electronic devices, smart gear, and cameras.'
  },
  {
    CategoryID: 'CAT-102',
    CategoryName: 'Computer Peripherals',
    Note: 'Keyboards, mechanical mice, docking stations, and USB hubs.'
  },
  {
    CategoryID: 'CAT-103',
    CategoryName: 'Displays',
    Note: 'Curved monitors, HDR gaming screens, and display mounts.'
  },
  {
    CategoryID: 'CAT-104',
    CategoryName: 'Audio & Gear',
    Note: 'Microphones, studio monitors, noise-canceling headsets, and audio gear.'
  },
  {
    CategoryID: 'CAT-105',
    CategoryName: 'Office & Desk',
    Note: 'Aluminum risers, vegan leather desk pads, and cable organizers.'
  },
  {
    CategoryID: 'CAT-106',
    CategoryName: 'Smart Home',
    Note: 'Ambient lighting, Wi-Fi smart strips, and IoT automation.'
  },
  {
    CategoryID: 'CAT-107',
    CategoryName: 'Accessories',
    Note: 'Fast charging cables, GaN wall chargers, and travel adapters.'
  }
];

export const DEFAULT_CATEGORIES = INITIAL_CATEGORIES.map(c => c.CategoryName);

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * STOCKPULSE - GOOGLE APPS SCRIPT BACKEND FOR PRODUCT MANAGEMENT
 * =========================================================================
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. In Google Sheets menu, click: Extensions -> Apps Script
 * 3. Delete existing code and paste this ENTIRE script into Code.gs
 * 4. Click the blue "Deploy" button at top right -> Select "New deployment"
 * 5. Click the Gear icon next to "Select type" -> Choose "Web app"
 * 6. Set Description: "StockPulse Product Backend"
 * 7. Set "Execute as": "Me" (your Google account)
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy", approve Google permissions when prompted
 * 10. Copy the generated Web App URL (ends with /exec)
 * 11. Paste that URL into StockPulse -> "Google Sheets Backend" settings!
 */

var SHEET_NAME = 'Products';
var HEADERS = [
  'ProductID',
  'ProductName',
  'CategoryID',
  'CostPrice',
  'SalePrice',
  'Stock',
  'Status',
  'MinStock',
  'LastUpdated',
  'Notes'
];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    
    // Style the header row in StockPulse Red (#DC2626)
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#DC2626');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getProducts';
    var sheet = getOrCreateSheet();

    // Health check / ping test
    if (action === 'ping' || action === 'test') {
      return responseJson({
        status: 'success',
        message: 'StockPulse Google Sheets Backend is active and connected.',
        sheetName: sheet.getName(),
        totalRows: sheet.getLastRow(),
        timestamp: new Date().toISOString()
      });
    }

    // Retrieve all products
    if (action === 'getProducts') {
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return responseJson({ status: 'success', products: [] });
      }

      var headers = data[0];
      var products = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue; // Skip blank rows
        
        var item = {};
        for (var h = 0; h < headers.length; h++) {
          item[headers[h]] = row[h];
        }
        item.CostPrice = Number(item.CostPrice) || 0;
        item.SalePrice = Number(item.SalePrice) || 0;
        item.Stock = Number(item.Stock) || 0;
        item.MinStock = Number(item.MinStock) || 10;
        products.push(item);
      }
      return responseJson({ status: 'success', count: products.length, products: products });
    }

    return responseJson({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return responseJson({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action || (e && e.parameter && e.parameter.action);

    // Add a new product
    if (action === 'addProduct') {
      var p = body.product;
      if (!p || !p.ProductID) {
        return responseJson({ status: 'error', message: 'ProductID is required.' });
      }

      // Check if product ID already exists
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(p.ProductID).trim()) {
          return responseJson({ status: 'error', message: 'Product ID already exists: ' + p.ProductID });
        }
      }

      var newRow = [
        String(p.ProductID).trim(),
        p.ProductName || '',
        p.CategoryID || 'General',
        Number(p.CostPrice) || 0,
        Number(p.SalePrice) || 0,
        Number(p.Stock) || 0,
        p.Status || 'In Stock',
        Number(p.MinStock) || 10,
        p.LastUpdated || new Date().toISOString(),
        p.Notes || ''
      ];
      sheet.appendRow(newRow);
      return responseJson({ status: 'success', message: 'Product added successfully.', product: p });
    }

    // Update an existing product
    if (action === 'updateProduct') {
      var p = body.product;
      if (!p || !p.ProductID) {
        return responseJson({ status: 'error', message: 'ProductID is required for update.' });
      }

      var data = sheet.getDataRange().getValues();
      var foundRowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(p.ProductID).trim()) {
          foundRowIndex = i + 1; // 1-indexed in Google Sheets
          break;
        }
      }

      if (foundRowIndex === -1) {
        return responseJson({ status: 'error', message: 'Product not found with ID: ' + p.ProductID });
      }

      var updatedRow = [
        String(p.ProductID).trim(),
        p.ProductName || '',
        p.CategoryID || 'General',
        Number(p.CostPrice) || 0,
        Number(p.SalePrice) || 0,
        Number(p.Stock) || 0,
        p.Status || 'In Stock',
        Number(p.MinStock) || 10,
        new Date().toISOString(),
        p.Notes || ''
      ];
      sheet.getRange(foundRowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
      return responseJson({ status: 'success', message: 'Product updated successfully.', product: p });
    }

    // Delete a product by ProductID
    if (action === 'deleteProduct') {
      var productId = body.ProductID || body.productId;
      if (!productId) {
        return responseJson({ status: 'error', message: 'ProductID is required to delete.' });
      }

      var data = sheet.getDataRange().getValues();
      var foundRowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(productId).trim()) {
          foundRowIndex = i + 1;
          break;
        }
      }

      if (foundRowIndex === -1) {
        return responseJson({ status: 'error', message: 'Product not found: ' + productId });
      }

      sheet.deleteRow(foundRowIndex);
      return responseJson({ status: 'success', message: 'Product deleted successfully.', ProductID: productId });
    }

    // Full Batch Sync (e.g. initial push or replace)
    if (action === 'batchSync' || action === 'seedAll') {
      var products = body.products || [];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      if (products.length > 0) {
        var rows = products.map(function(item) {
          return [
            String(item.ProductID).trim(),
            item.ProductName || '',
            item.CategoryID || 'General',
            Number(item.CostPrice) || 0,
            Number(item.SalePrice) || 0,
            Number(item.Stock) || 0,
            item.Status || 'In Stock',
            Number(item.MinStock) || 10,
            item.LastUpdated || new Date().toISOString(),
            item.Notes || ''
          ];
        });
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }
      return responseJson({ status: 'success', count: products.length, message: 'Batch sync complete.' });
    }

    return responseJson({ status: 'error', message: 'Unknown POST action: ' + action });
  } catch (err) {
    return responseJson({ status: 'error', message: err.toString() });
  }
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
