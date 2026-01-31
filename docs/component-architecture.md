# Component Architecture

## Component Hierarchy

```
SellClient (Main Component)
│
├── Progress Bar
│   └── Step Indicators (1-4)
│
└── Form (Multi-Step)
    │
    ├── FormSection (Step 1: Basics & Location)
    │   ├── SelectableCheckboxCard (Purpose)
    │   ├── SelectableCheckboxCard (Nature)
    │   ├── SelectableCheckboxCard (Type)
    │   ├── Input (Title)
    │   ├── GeoLocationInput
    │   ├── FormGrid
    │   │   └── Input × 3 (District, City, Area)
    │   ├── NearbyLocationCard × N
    │   ├── QuickCategorySelect
    │   └── PrivacyCheckboxCard × 2
    │
    ├── FormSection (Step 2: Property Features)
    │   ├── FormGrid (Ward, Landmark)
    │   ├── FormGrid (Road Type, Size, Direction)
    │   ├── FormCard (Conditional: House/Apartment/Villa)
    │   │   └── FormGrid × 3 (Bedrooms, Bathrooms, etc.)
    │   └── FormGrid (Amenities Checkboxes)
    │
    ├── FormSection (Step 3: Media & Ownership)
    │   ├── FormCard (Open House)
    │   │   ├── SectionTitle
    │   │   ├── Checkbox
    │   │   └── FormGrid (Date, Start, End)
    │   ├── FormGrid (Media Upload)
    │   └── FormCard (Ownership)
    │       ├── SectionTitle
    │       └── FormGrid (Owner, Authorized Person)
    │
    └── FormSection (Step 4: Pricing)
        ├── FormGrid (Pricing Type, Unit)
        ├── FormGrid (Price, Negotiable Price)
        └── Input (Rent Price) + Checkbox
```

## Component Dependencies

```
┌─────────────────────────────────────────┐
│         SellClient.tsx                  │
│         (Main Form)                     │
└─────────────────┬───────────────────────┘
                  │
                  │ imports
                  ▼
┌─────────────────────────────────────────┐
│      @/components/form/index.ts         │
│      (Centralized Exports)              │
└─────────────────┬───────────────────────┘
                  │
                  │ exports
                  ▼
┌─────────────────────────────────────────┐
│         Form Components                 │
├─────────────────────────────────────────┤
│ • FormLayout.tsx                        │
│   - FormSection                         │
│   - FormGrid                            │
│   - FormLabel                           │
│   - FormCard                            │
│   - SectionTitle                        │
│                                         │
│ • SelectableCheckboxCard.tsx            │
│ • GeoLocationInput.tsx                  │
│ • QuickCategorySelect.tsx               │
│ • NearbyLocationCard.tsx                │
│ • PrivacyCheckboxCard.tsx               │
└─────────────────────────────────────────┘
```

## Data Flow

```
User Interaction
      │
      ▼
Component Event Handler
      │
      ▼
State Update (useState)
      │
      ▼
Component Re-render
      │
      ▼
Form Submission
      │
      ▼
Server Action (createListing)
      │
      ▼
Database (Prisma)
```

## Component Composition Patterns

### Pattern 1: Section with Grid Layout
```tsx
<FormSection active={activeSection === 1}>
    <FormGrid cols={3} gap="24px">
        <Input />
        <Input />
        <Input />
    </FormGrid>
</FormSection>
```

### Pattern 2: Card with Title and Grid
```tsx
<FormCard padding="24px" background="#f1f5f9">
    <SectionTitle>Details</SectionTitle>
    <FormGrid cols={2}>
        <Input />
        <Select />
    </FormGrid>
</FormCard>
```

### Pattern 3: Multi-Select with Label
```tsx
<div>
    <FormLabel>Property Type</FormLabel>
    <FormGrid minWidth="180px">
        {options.map(opt => (
            <SelectableCheckboxCard
                key={opt.value}
                {...opt}
                checked={selected.includes(opt.value)}
                onClick={() => toggle(opt.value)}
            />
        ))}
    </FormGrid>
</div>
```

### Pattern 4: Location Management
```tsx
<div>
    <FormLabel>Nearby Locations</FormLabel>
    <FormGrid minWidth="280px">
        {locations.map(loc => (
            <NearbyLocationCard
                key={loc.id}
                {...loc}
                onRemove={() => remove(loc.id)}
                onDistanceChange={(d) => update(loc.id, d)}
            />
        ))}
    </FormGrid>
    <QuickCategorySelect
        categories={presets}
        onSelect={addLocation}
        onCustom={promptCustom}
    />
</div>
```

## State Management

### Component State (useState)
```tsx
// Selection States
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
const [selectedNatures, setSelectedNatures] = useState<string[]>([]);

// Form States
const [title, setTitle] = useState('');
const [price, setPrice] = useState('');
const [district, setDistrict] = useState('');

// UI States
const [activeSection, setActiveSection] = useState(1);
const [errors, setErrors] = useState<Record<string, string>>({});

// Location States
const [coords, setCoords] = useState({ lat: '', lng: '' });
const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
```

### Event Handlers
```tsx
// Multi-select handlers
const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
        prev.includes(type) 
            ? prev.filter(t => t !== type)
            : [...prev, type]
    );
};

// Location handlers
const addNearbyLocation = (name: string) => {
    setNearbyLocations(prev => [...prev, {
        id: Math.random().toString(),
        name,
        distance: 500
    }]);
};

const updateDistance = (id: string, distance: number) => {
    setNearbyLocations(prev => 
        prev.map(loc => 
            loc.id === id ? { ...loc, distance } : loc
        )
    );
};
```

## Styling Strategy

### 1. Component-Level Styles
Defined in component files, reusable across instances:
```tsx
// FormCard.tsx
<div style={{
    padding,
    background,
    border,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap
}}>
```

### 2. Inline Styles (Minimal)
Only for unique, one-off cases:
```tsx
<div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
```

### 3. CSS Variables
Using global CSS variables for consistency:
```tsx
borderColor: 'var(--color-primary)'
```

## Performance Considerations

### 1. Memoization Opportunities
```tsx
// Expensive computations
const isTypeDisabled = useMemo(() => 
    (type: string) => {
        // Complex logic here
    },
    [selectedTypes]
);
```

### 2. Callback Optimization
```tsx
// Prevent unnecessary re-renders
const handleRemove = useCallback((id: string) => {
    setNearbyLocations(prev => prev.filter(l => l.id !== id));
}, []);
```

### 3. Component Splitting
Large components split into smaller, focused components for better performance and maintainability.

## Accessibility Features

### Current Implementation
- ✅ Semantic HTML elements
- ✅ Clickable card areas
- ✅ Keyboard-accessible checkboxes
- ✅ Clear visual feedback

### Future Enhancements
- ⏳ ARIA labels for screen readers
- ⏳ Keyboard navigation (Tab, Enter, Space)
- ⏳ Focus management
- ⏳ Error announcements

## Testing Strategy

### Unit Tests
```tsx
describe('SelectableCheckboxCard', () => {
    it('renders with correct label', () => {});
    it('calls onClick when clicked', () => {});
    it('shows error state', () => {});
    it('disables when disabled prop is true', () => {});
});
```

### Integration Tests
```tsx
describe('SellClient Form', () => {
    it('validates required fields', () => {});
    it('navigates between sections', () => {});
    it('submits form data correctly', () => {});
});
```

### E2E Tests
```tsx
describe('Property Listing Flow', () => {
    it('creates a new listing', () => {});
    it('handles nearby locations', () => {});
    it('uploads images', () => {});
});
```
