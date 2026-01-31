# Form Components Documentation

## Overview
This directory contains reusable form components designed to improve code maintainability, reduce duplication, and provide consistent UX across the application.

## Components

### 1. Layout Components (`FormLayout.tsx`)

#### FormSection
Controls visibility of multi-step form sections.

**Props:**
- `active: boolean` - Whether this section is currently visible
- `children: React.ReactNode` - Section content
- `gap?: string` - Gap between child elements (default: '24px')

**Usage:**
```tsx
<FormSection active={activeSection === 1}>
    {/* Form content */}
</FormSection>
```

---

#### FormGrid
Responsive grid layout for form fields.

**Props:**
- `children: React.ReactNode` - Grid items
- `cols?: number | string` - Number of columns or custom grid template (default: 3)
- `gap?: string` - Gap between grid items (default: '24px')
- `minWidth?: string` - Minimum width for auto-fill grid (e.g., '180px')

**Usage:**
```tsx
{/* Fixed columns */}
<FormGrid cols={3} gap="24px">
    <Input label="Field 1" name="field1" />
    <Input label="Field 2" name="field2" />
    <Input label="Field 3" name="field3" />
</FormGrid>

{/* Auto-fill responsive */}
<FormGrid minWidth="200px" gap="16px">
    {items.map(item => <Card key={item.id} />)}
</FormGrid>
```

---

#### FormLabel
Consistent label styling across the form.

**Props:**
- `children: React.ReactNode` - Label text
- `marginBottom?: string` - Bottom margin (default: '12px')

**Usage:**
```tsx
<FormLabel>Property Type</FormLabel>
```

---

#### FormCard
Card container for grouping related form fields.

**Props:**
- `children: React.ReactNode` - Card content
- `padding?: string` - Internal padding (default: '24px')
- `background?: string` - Background color (default: 'white')
- `border?: string` - Border style (default: '1px solid #e2e8f0')
- `shadow?: string` - Box shadow (default: 'none')
- `gap?: string` - Gap between children (default: '16px')

**Usage:**
```tsx
<FormCard padding="24px" background="#f1f5f9">
    <SectionTitle>User Details</SectionTitle>
    <FormGrid cols={2}>
        <Input label="First Name" name="firstName" />
        <Input label="Last Name" name="lastName" />
    </FormGrid>
</FormCard>
```

---

#### SectionTitle
Styled heading for form sections.

**Props:**
- `children: React.ReactNode` - Title text
- `color?: string` - Text color (default: '#1e293b')

**Usage:**
```tsx
<SectionTitle color="#0369a1">Ownership & Authorization</SectionTitle>
```

---

### 2. SelectableCheckboxCard (`SelectableCheckboxCard.tsx`)

Interactive checkbox card for multi-select options (property type, nature, purpose).

**Props:**
- `value: string` - Checkbox value
- `label: string` - Display label
- `name: string` - Form field name
- `checked: boolean` - Whether checkbox is checked
- `onClick: () => void` - Click handler
- `disabled?: boolean` - Whether card is disabled (default: false)
- `error?: boolean` - Whether to show error state (default: false)

**Usage:**
```tsx
{['sale', 'rent'].map(opt => (
    <SelectableCheckboxCard
        key={opt}
        value={opt}
        label={opt === 'sale' ? 'For Sale' : 'For Rent'}
        name="propertyPurpose"
        checked={selectedPurposes.includes(opt)}
        onClick={() => handlePurposeChange(opt)}
        error={!!errors.purpose}
    />
))}
```

**Features:**
- ✅ Visual feedback on selection (border color, background)
- ✅ Disabled state with reduced opacity
- ✅ Error state with red border
- ✅ Smooth transitions

---

### 3. GeoLocationInput (`GeoLocationInput.tsx`)

Specialized input for handling Google Maps URLs or coordinates.

**Props:**
- `value: string` - Input value (URL or coordinates)
- `onChange: (value: string) => void` - Change handler
- `onFetch: () => void` - Fetch coordinates handler
- `onClear: () => void` - Clear coordinates handler
- `hasCoords: boolean` - Whether coordinates have been fetched
- `isFetching: boolean` - Whether currently fetching
- `latitude?: string` - Latitude value
- `longitude?: string` - Longitude value
- `disabled?: boolean` - Whether input is disabled

**Usage:**
```tsx
<GeoLocationInput
    value={locationSource}
    onChange={handleLocationSourceChange}
    onFetch={fetchCoordinates}
    onClear={() => {
        setCoords({ lat: '', lng: '' });
        setLocationSource('');
    }}
    hasCoords={!!coords.lat}
    isFetching={fetchingCoords}
    latitude={coords.lat}
    longitude={coords.lng}
/>
```

**Features:**
- ✅ Fetch button (📍) to extract coordinates
- ✅ Clear button (✕) when coordinates are set
- ✅ Loading state indicator
- ✅ Hidden inputs for lat/lng form submission
- ✅ Disabled state when coordinates are set

---

### 4. QuickCategorySelect (`QuickCategorySelect.tsx`)

Icon-based category selector for nearby locations.

**Props:**
- `categories: CategoryButton[]` - Array of category objects with `label` and `icon`
- `onSelect: (label: string, icon: string) => void` - Selection handler
- `onCustom?: () => void` - Custom input handler
- `showCustom?: boolean` - Whether to show custom button (default: true)

**Usage:**
```tsx
<QuickCategorySelect
    categories={[
        { label: 'School', icon: '🏫' },
        { label: 'Hospital', icon: '🏥' },
        { label: 'Temple', icon: '🛕' },
    ]}
    onSelect={(label, icon) => addNearbyLocation(`${icon} ${label}`)}
    onCustom={() => {
        const name = prompt("Enter landmark name:");
        if (name) addNearbyLocation(`📍 ${name}`);
    }}
/>
```

**Features:**
- ✅ Icon-based visual buttons
- ✅ Hover effects (border color, shadow)
- ✅ Optional custom input button
- ✅ Pill-shaped design for modern look

---

### 5. NearbyLocationCard (`NearbyLocationCard.tsx`)

Card displaying a nearby location with distance controls.

**Props:**
- `id: string` - Unique identifier
- `name: string` - Location name (with icon)
- `distance: number` - Distance in meters
- `onRemove: () => void` - Remove handler
- `onDistanceChange: (newDistance: number) => void` - Distance change handler

**Usage:**
```tsx
{nearbyLocations.map((loc) => (
    <NearbyLocationCard
        key={loc.id}
        id={loc.id}
        name={loc.name}
        distance={loc.distance}
        onRemove={() => removeLocation(loc.id)}
        onDistanceChange={(newDistance) => updateDistance(loc.id, newDistance)}
    />
))}
```

**Features:**
- ✅ Formatted distance display (m/km)
- ✅ Distance adjustment buttons (-100, +100, +500)
- ✅ Remove button with visual feedback
- ✅ Hidden form inputs for submission
- ✅ Clean, card-based design

---

### 6. PrivacyCheckboxCard (`PrivacyCheckboxCard.tsx`)

Interactive card for privacy/visibility settings.

**Props:**
- `id: string` - Checkbox ID
- `name: string` - Form field name
- `title: string` - Card title
- `description: string` - Descriptive text
- `defaultChecked?: boolean` - Default checked state (default: false)

**Usage:**
```tsx
<PrivacyCheckboxCard
    id="isPrivate-cb"
    name="isPrivate"
    title="Mark as Private"
    description="Don't add exact images to your private listing if you want to hide details."
/>
```

**Features:**
- ✅ Clickable card area (entire card is clickable)
- ✅ Hover effects (border color, shadow)
- ✅ Descriptive text for better UX
- ✅ Checkbox click event doesn't propagate

---

## Import Usage

All components can be imported from the centralized index:

```tsx
import {
    FormSection,
    FormGrid,
    FormLabel,
    FormCard,
    SectionTitle,
    SelectableCheckboxCard,
    GeoLocationInput,
    QuickCategorySelect,
    NearbyLocationCard,
    PrivacyCheckboxCard
} from '@/components/form';
```

## Benefits

1. **Code Reduction**: Removed ~400+ lines of repetitive inline styling
2. **Consistency**: Uniform styling and behavior across the application
3. **Maintainability**: Changes to styling can be made in one place
4. **Reusability**: Components can be used in any form across the app
5. **Type Safety**: All components are fully typed with TypeScript
6. **Better DX**: Clear component names indicate their purpose
7. **Easier Debugging**: Component boundaries are clear in React DevTools

## Design Patterns

### Composition
Components are designed to be composed together:

```tsx
<FormSection active={activeSection === 1}>
    <FormCard padding="24px" background="#f1f5f9">
        <SectionTitle>Property Details</SectionTitle>
        <FormGrid cols={2} gap="24px">
            <Input label="Title" name="title" />
            <Input label="Price" name="price" />
        </FormGrid>
    </FormCard>
</FormSection>
```

### Controlled Components
Most components are controlled, requiring state management:

```tsx
const [selected, setSelected] = useState<string[]>([]);

<SelectableCheckboxCard
    checked={selected.includes(value)}
    onClick={() => toggleSelection(value)}
/>
```

### Flexibility
Components accept style overrides through props:

```tsx
<FormCard 
    padding="32px" 
    background="#fffbeb" 
    border="1px solid #fde68a"
    shadow="0 4px 6px rgba(0,0,0,0.1)"
/>
```

## Future Enhancements

Consider adding:
1. **FormRow** - Horizontal layout for label + input
2. **FormActions** - Standardized button group for form actions
3. **FormError** - Consistent error message display
4. **FormHint** - Helper text component
5. **Responsive breakpoints** - Mobile-first responsive design
6. **Accessibility** - ARIA labels and keyboard navigation
7. **Storybook** - Component documentation and testing
