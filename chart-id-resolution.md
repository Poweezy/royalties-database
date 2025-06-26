# Chart ID Inconsistency Resolution

## Problem

The Mining Royalties Manager application had inconsistent references to chart canvas IDs across different components. Most critically, there was a mismatch between:

- `production-by-entity-chart` (used in older code and chart-manager.js)
- `revenue-by-entity-chart` (used in dashboard.html and dashboard.js)

This inconsistency was causing chart rendering failures as components were searching for canvas elements with different IDs.

## Resolution

We've implemented a three-layer solution to ensure the application works consistently regardless of which chart ID is used:

1. **Chart Alias Fixer (chart-alias-fixer.js)**: 
   - Creates hidden canvas elements as aliases to the existing ones
   - Patches the ChartManager's create method to resolve aliases at runtime
   - Ensures backward compatibility with both ID naming conventions

2. **Enhanced Canvas Detection (dashboard-canvas-fix.js)**:
   - Added alias mapping to check for alternative IDs during canvas creation
   - Modified to dispatch a 'chart-canvases-fixed' event when complete

3. **Modified ChartManager (chart-manager.js)**:
   - Updated createDashboardCharts method to check for both ID conventions
   - Adds runtime detection of which canvas ID is actually present in the DOM

## Implementation Details

- **chart-alias-fixer.js**: Creates hidden alias canvases at runtime, allowing the application to work with either ID convention
- **dashboard-canvas-fix.js**: Ensures all required canvases exist and watches for both ID formats
- **chart-manager.js**: Checks for canvas availability before attempting to create charts

## Affected Components

- Entity Distribution Chart (now supports both `production-by-entity-chart` and `revenue-by-entity-chart` IDs)
- Dashboard initialization logic
- Chart Manager component

## Technical Notes

- Both IDs are now treated as valid aliases of each other
- The application will preferentially use the ID of the actual canvas found in the DOM
- No changes were needed to existing dashboard.html or component templates

## Future Development

For future clarity, we recommend standardizing on the `revenue-by-entity-chart` ID as this matches the naming convention of the other dashboard charts (revenue-trends-chart, etc). However, both IDs will continue to work due to the alias system implemented.

## Testing

After implementing these changes, verify that:
1. All charts render correctly on the dashboard
2. No console errors about missing canvases or chart methods
3. Chart refreshes and filters work properly
