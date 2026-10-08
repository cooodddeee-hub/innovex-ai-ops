function evaluateDataQuality(records, columns) {
  if (!records || records.length === 0) {
    return {
      dataQualityScore: 0,
      qualityLevel: 'Poor',
      missingValuesCount: 0,
      duplicateRowsCount: 0,
      invalidNumericCount: 0,
      detectedModule: 'general',
      warnings: ['Dataset is completely empty.'],
      errors: ['No rows found in uploaded file.'],
      recommendations: ['Upload a dataset containing valid operational rows and headers.']
    };
  }

  const rowCount = records.length;
  const colCount = columns.length;
  const colNamesLower = columns.map(c => String(c).toLowerCase().trim());

  let totalCellCount = rowCount * colCount;
  let missingValuesCount = 0;
  let invalidNumericCount = 0;
  
  // Track duplicates
  const rowStrings = new Set();
  let duplicateRowsCount = 0;

  // Empty column detection
  const populatedCols = new Set();

  records.forEach(row => {
    const rowStr = JSON.stringify(row);
    if (rowStrings.has(rowStr)) {
      duplicateRowsCount++;
    } else {
      rowStrings.add(rowStr);
    }

    columns.forEach(col => {
      const val = row[col];
      if (val === undefined || val === null || String(val).trim() === '') {
        missingValuesCount++;
      } else {
        populatedCols.add(col);
      }
    });
  });

  const emptyColumns = columns.filter(col => !populatedCols.has(col));

  // Module Detection heuristic
  let detectedModule = 'general';
  if (colNamesLower.some(c => c.includes('vibration') || c.includes('temperature') || c.includes('operating_hours') || c.includes('machine'))) {
    detectedModule = 'maintenance';
  } else if (colNamesLower.some(c => c.includes('inventory') || c.includes('reorder') || c.includes('lead_time') || c.includes('stock'))) {
    detectedModule = 'inventory';
  } else if (colNamesLower.some(c => c.includes('batch') || c.includes('standard_quantity') || c.includes('actual_quantity') || c.includes('consumption'))) {
    detectedModule = 'production';
  } else if (colNamesLower.some(c => c.includes('rework') || c.includes('error_type') || c.includes('process_type') || c.includes('rejection'))) {
    detectedModule = 'reflow';
  } else if (colNamesLower.some(c => c.includes('vehicle') || c.includes('distance') || c.includes('delivery_deadline') || c.includes('shipment'))) {
    detectedModule = 'logistics';
  }

  // Calculate Data Quality Score (0 - 100)
  const missingPenalty = (missingValuesCount / (totalCellCount || 1)) * 50;
  const duplicatePenalty = (duplicateRowsCount / (rowCount || 1)) * 30;
  const emptyColPenalty = (emptyColumns.length / (colCount || 1)) * 20;

  const dataQualityScore = Math.max(0, Math.round(100 - missingPenalty - duplicatePenalty - emptyColPenalty));

  let qualityLevel = 'Excellent';
  if (dataQualityScore < 50) qualityLevel = 'Poor';
  else if (dataQualityScore < 75) qualityLevel = 'Fair';
  else if (dataQualityScore < 90) qualityLevel = 'Good';

  const warnings = [];
  const errors = [];
  const recommendations = [];

  if (missingValuesCount > 0) {
    warnings.push(`Detected ${missingValuesCount} missing/blank cells (${((missingValuesCount / totalCellCount) * 100).toFixed(1)}% of total data).`);
    recommendations.push('Impute or supply missing cell values to improve forecasting accuracy.');
  }

  if (duplicateRowsCount > 0) {
    warnings.push(`Detected ${duplicateRowsCount} duplicate record rows.`);
    recommendations.push('Deduplicate records prior to triggering secondary analytical models.');
  }

  if (emptyColumns.length > 0) {
    errors.push(`Columns completely unpopulated: ${emptyColumns.join(', ')}.`);
  }

  if (qualityLevel === 'Excellent') {
    recommendations.push('Dataset quality meets all criteria for full automated AI optimization.');
  }

  return {
    dataQualityScore,
    qualityLevel,
    missingValuesCount,
    duplicateRowsCount,
    invalidNumericCount,
    emptyColumns,
    detectedModule,
    warnings,
    errors,
    recommendations
  };
}

module.exports = { evaluateDataQuality };
