import React from 'react';
import Link from 'next/link';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';

interface PropertyGridProps {
  properties: any[];
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
  if (!properties || properties.length === 0) return null;

  return (
    <section className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.slice(0, 8).map((property) => (
          <PropertyPost key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};
