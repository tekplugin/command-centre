# UI Styling Guide for ExecApp

## Critical: Text Visibility Rules

### ⚠️ ALWAYS Add Explicit Text Colors

**Never rely on default text colors!** All text elements must have explicit Tailwind color classes to ensure proper contrast and visibility.

### Standard Text Color Classes

```tsx
// Primary content (dark, high contrast)
className="text-gray-900"

// Secondary content (medium dark)
className="text-gray-700"

// Labels and field names
className="text-gray-600"

// Helper text, hints, placeholders
className="text-gray-500"

// Light helper text (use sparingly)
className="text-gray-400"

// Financial values
className="text-red-600"    // Deductions, negative values, costs
className="text-green-600"  // Positive values, net pay, profit
className="text-blue-900"   // Summary panels with blue backgrounds

// Interactive elements
className="text-white"      // On dark backgrounds (buttons, nav)
```

### Required Pattern for All Text Elements

```tsx
// ❌ WRONG - No text color (invisible on some backgrounds)
<p className="font-semibold">{value}</p>
<span className="text-xs">Label:</span>

// ✅ CORRECT - Explicit text colors
<p className="font-semibold text-gray-900">{value}</p>
<span className="text-xs text-gray-600 block">Label:</span>
```

### Common Use Cases

#### 1. Form Labels
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Field Name
</label>
```

#### 2. Display Values
```tsx
<p className="text-lg font-semibold text-gray-900">
  {formatCurrency(amount)}
</p>
```

#### 3. Helper Text
```tsx
<p className="text-xs text-gray-500 mt-1">
  Additional information
</p>
```

#### 4. Financial Breakdown
```tsx
<div>
  <span className="text-gray-600 block">Label:</span>
  <p className="font-semibold text-gray-900">{value}</p>
</div>
```

#### 5. Summary Panels (Colored Backgrounds)
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p className="text-xs text-blue-700">Label</p>
  <p className="text-lg font-bold text-blue-900">{value}</p>
</div>
```

## Background and Text Contrast

### Safe Combinations

| Background | Text Color | Use Case |
|------------|------------|----------|
| `bg-white` | `text-gray-900` | Primary content |
| `bg-gray-50` | `text-gray-900` | Cards, sections |
| `bg-blue-50` | `text-blue-900` | Info panels |
| `bg-green-50` | `text-green-900` | Success panels |
| `bg-red-50` | `text-red-900` | Error/warning panels |
| `bg-blue-600` | `text-white` | Buttons, nav |

## Input Fields

All input fields must have explicit text color:

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md 
             focus:ring-blue-500 focus:border-blue-500 
             bg-white text-gray-900"
  placeholder="Enter value"
/>
```

## Display Elements with Block Class

For inline elements (span) that need proper display:

```tsx
<span className="text-gray-600 block">Label:</span>
```

The `block` class ensures the element displays properly and doesn't collapse.

## Testing Visibility

### Quick Test
1. Select text with cursor - if you can't see it until selected, it lacks proper color
2. Check on different screen brightness levels
3. Verify contrast ratios meet accessibility standards

### Common Issues Fixed
- White text on light backgrounds
- Gray-50 text on white backgrounds
- Missing text color inheritance

## Remember

✅ **DO**: Add explicit `text-{color}` classes to every text element
✅ **DO**: Use semantic colors (red for deductions, green for positive)
✅ **DO**: Add `block` to span elements when needed
✅ **DO**: Test visibility on actual backgrounds
✅ **DO**: Add helper text for complex financial terms

❌ **DON'T**: Rely on default browser text colors
❌ **DON'T**: Use text colors that blend with backgrounds
❌ **DON'T**: Forget color classes on dynamically rendered content

## Financial Terms & Definitions

### Nigerian Payroll Components

**Salary Breakdown (Standard Split):**
- **Basic (15%)**: Base salary component, fully taxable
- **Transport (15%)**: Transportation allowance (non-taxable up to ₦200,000/year)
- **Housing (15%)**: Accommodation allowance (non-taxable up to certain limits)
- **Others (55%)**: Includes:
  - Meal allowance
  - Entertainment allowance
  - Utility allowance
  - Medical allowance
  - Leave allowance
  - Other employee benefits

**Tax & Deductions:**
- **CRA**: Consolidated Relief Allowance (higher of 1% of gross or ₦200,000 + 20% of gross)
- **Pension**: 8% employee + 10% employer contribution (mandatory)
- **PAYE**: Progressive tax (7%, 11%, 15%, 19%, 21%, 24% based on income brackets)
- **WHT**: Withholding Tax (5% of gross)

---

**This guide ensures all text is visible and accessible throughout the application.**
