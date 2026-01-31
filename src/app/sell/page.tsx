"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createListing } from './actions/listing';
import imageCompression from 'browser-image-compression';
import { Input, TextArea, Select } from '@/components/ui';

export default function SellPage() {
    const [category, setCategory] = useState('House');
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [coords, setCoords] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
    const [fetchingCoords, setFetchingCoords] = useState(false);
    const [locationSource, setLocationSource] = useState('');

    const handleLocationSourceChange = (val: string) => {
        setLocationSource(val);

        // 1. Try Google Maps URL
        const urlMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (urlMatch) {
            setCoords({ lat: urlMatch[1], lng: urlMatch[2] });
            return;
        }

        // 2. Try raw Lat, Lng format (e.g. 27.7172, 85.3240)
        const geoMatch = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
        if (geoMatch) {
            setCoords({ lat: geoMatch[1], lng: geoMatch[2] });
        }
    };

    const fetchCoordinates = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setFetchingCoords(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                setCoords({ lat, lng });
                setLocationSource(`${lat}, ${lng}`);
                setFetchingCoords(false);
            },
            (error) => {
                console.error("Error fetching coordinates:", error);
                alert("Unable to retrieve your location");
                setFetchingCoords(false);
            }
        );
    };

    const getPriceInWords = (priceStr: string) => {
        const num = parseInt(priceStr.replace(/,/g, ''), 10);
        if (isNaN(num) || num === 0) return '';

        const units = [
            { value: 10000000, label: 'Crore' },
            { value: 100000, label: 'Laksh' },
            { value: 1000, label: 'Thousands' },
            { value: 100, label: 'Hundred' }
        ];

        let result = '';
        let remaining = num;

        for (const unit of units) {
            if (remaining >= unit.value) {
                const count = Math.floor(remaining / unit.value);
                result += `${count} ${unit.label} `;
                remaining %= unit.value;
            }
        }

        if (remaining > 0 || result === '') {
            const smallNumbers: { [key: number]: string } = {
                1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
                6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
                11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
                16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
                30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
            };

            if (remaining <= 20) {
                result += smallNumbers[remaining] || remaining;
            } else {
                const tens = Math.floor(remaining / 10) * 10;
                const ones = remaining % 10;
                result += smallNumbers[tens] || '';
                if (ones > 0) result += ' ' + (smallNumbers[ones] || ones);
            }
        }

        return result.trim().toLowerCase();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const originalFile = e.target.files[0];
        let file = originalFile;

        // Client-side compression
        setCompressing(true);
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            const compressedBlob = await imageCompression(originalFile, options);
            // Re-wrap in File to preserve the original name/extension
            file = new File([compressedBlob], originalFile.name, {
                type: compressedBlob.type,
                lastModified: Date.now()
            });
        } catch (error) {
            console.error("Compression error:", error);
        } finally {
            setCompressing(false);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', 'namsari');

        setUploading(true);
        try {
            const res = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadedUrl(data.url);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <header className="full-width-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '32px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
                        <Link href="/">Browse</Link>
                        <Link href="/manage" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                            Management
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="layout-container" style={{ maxWidth: '800px', paddingTop: '60px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>List Your Property</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Reach verified institutional buyers and premium residential seekers.</p>
                </div>

                <form action={createListing} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Select
                            label="Main Category"
                            name="main_category"
                            value={category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                            required
                            options={[
                                { label: 'House', value: 'House' },
                                { label: 'Land', value: 'Land' },
                                { label: 'Apartment', value: 'Apartment' },
                                { label: 'Building (Complex, Hospital, etc.)', value: 'Building' },
                            ]}
                        />

                        <Select
                            label="Sub-Category (Optional)"
                            name="commercial_sub_category"
                            placeholder="Select Sub-type"
                            options={[
                                ...(category === 'Land' ? [
                                    { label: 'Agriculture/Farm Land', value: 'Agriculture' },
                                    { label: 'Factory Land', value: 'Factory' },
                                ] : []),
                                ...(category === 'Building' ? [
                                    { label: 'Office Space', value: 'Office' },
                                    { label: 'Rental Building', value: 'Rental' },
                                    { label: 'Complex', value: 'Complex' },
                                    { label: 'Hospital', value: 'Hospital' },
                                    { label: 'Hotel', value: 'Hotel' },
                                ] : []),
                                { label: 'Other', value: 'Other' },
                            ]}
                        />
                    </div>

                    <Input
                        label="Property Title"
                        type="text"
                        name="title"
                        placeholder="e.g. The Sterling Penthouse"
                        required
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <Input
                                label="Price"
                                type="text"
                                name="price"
                                placeholder="e.g. 2500000"
                                value={price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val)) {
                                        setPrice(val);
                                    }
                                }}
                                required
                            />
                            {price && (
                                <div style={{ marginTop: '-8px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', textTransform: 'capitalize' }}>
                                    {getPriceInWords(price)}
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Location Name"
                        type="text"
                        name="location"
                        placeholder="e.g. Manhattan, NY"
                        required
                    />

                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Input
                            label="Paste Google Maps location, or paste Geo location"
                            type="text"
                            name="google_maps_url"
                            value={locationSource}
                            onChange={(e) => handleLocationSourceChange(e.target.value)}
                            placeholder="Link or Coordinates (e.g. 27.7, 85.3)..."
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <button
                                type="button"
                                onClick={fetchCoordinates}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-gold)',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    paddingLeft: '0'
                                }}
                            >
                                {fetchingCoords ? '📍 Fetching location...' : '📍 Or fetch your current location'}
                            </button>
                        </div>

                        {coords.lat && coords.lng && (
                            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#1e293b', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ color: '#22c55e' }}>✓</span> Coordinates Locked: {coords.lat}, {coords.lng}
                                <input type="hidden" name="latitude" value={coords.lat} />
                                <input type="hidden" name="longitude" value={coords.lng} />
                            </div>
                        )}
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>Properties with coordinates appear on the interactive Explore map.</p>
                    </div>

                    <TextArea
                        label="Specifications & Description"
                        name="specs"
                        rows={4}
                        placeholder="e.g. 4 Beds • 5 Baths • 4500 Sqft"
                        required
                    />

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Property Image</label>
                        <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
                            {uploadedUrl ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={uploadedUrl} alt="Property" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                                    <button
                                        type="button"
                                        onClick={() => setUploadedUrl(null)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                    <input type="hidden" name="image_url" value={uploadedUrl || ''} />
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        id="file-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '2rem' }}>📷</div>
                                        <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                                            {compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Click to upload image'}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>JPG, PNG, WEBP allowed</span>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontWeight: '700',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Post Listing
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
