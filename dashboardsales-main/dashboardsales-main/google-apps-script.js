/**
 * Google Apps Script to serve Google Sheet data as JSON for the Sales Dashboard.
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into the editor.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select "Web App".
 * 6. Set "Execute as" to "Me".
 * 7. Set "Who has access" to "Anyone".
 * 8. Copy the Web App URL and paste it into the "Connect Source" settings in the dashboard.
 */

function doGet() {
  const sheetName = "Sales_Data"; // Make sure this matches your sheet name
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const jsonData = rows.map((row, index) => {
    const obj = {};
    headers.forEach((header, i) => {
      let value = row[i];
      
      // Format date to ISO string if it's a Date object
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }
      
      // Clean up header names to match the frontend types (lowercase, underscores)
      const cleanHeader = header.toString().toLowerCase().trim().replace(/\s+/g, '_');
      obj[cleanHeader] = value;
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
