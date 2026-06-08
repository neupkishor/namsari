'use client';

import React, { useState } from 'react';
import { addPropertyImage, deletePropertyListing, removePropertyImage, reorderPropertyImages, updatePropertyStatus, updateSoldStatus } from '@/actions/properties';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

interface PropertyManageClientProps {
    property: any;
    canDelete?: boolean;
}

export default function PropertyManageClient({ property, canDelete }: PropertyManageClientProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [images, setImages] = useState<any[]>(property.images || []);
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);
    const [savingOrder, setSavingOrder] = useState(false);
    const [deletingProperty, setDeletingProperty] = useState(false);

    const stats = [
        { label: 'Views', value: property.views || 0, color: '#10b981' },
        { label: 'Likes', value: property.property_likes?.length || 0, color: '#ef4444' },
        { label: 'Comments', value: property.comments?.length || 0, color: '#3b82f6' },
        { label: 'Shares', value: property.shares || 0, color: '#f59e0b' },
    ];

    const hasOrderChanged = images.map((img) => img.id).join(',') !== (property.images || []).map((img: any) => img.id).join(',');
    const priceLabel = property.pricing?.price ? `NRs. ${Number(property.pricing.price).toLocaleString()}` : 'Price on request';
    const locationLabel = property.location ? [property.location.area, property.location.cityVillage, property.location.district].filter(Boolean).join(', ') : 'Location unspecified';
    const typeLabel = property.types?.map((type: any) => type.name).join(', ') || 'Property';
    const featureSummary = [
        property.features?.bedrooms != null ? `${property.features.bedrooms} beds` : null,
        property.features?.bathrooms != null ? `${property.features.bathrooms} baths` : null,
        property.features?.builtUpArea ? `${property.features.builtUpArea} ${property.features.builtUpAreaUnit || ''}`.trim() : null,
    ].filter(Boolean).join(' · ') || 'No feature summary';
    const amenityLabels = [
        property.features?.parkingAvailable ? 'Parking' : null,
        property.features?.elevator ? 'Elevator' : null,
        property.features?.security ? 'Security' : null,
        property.features?.waterSupply ? 'Water supply' : null,
        property.features?.electricity ? 'Electricity' : null,
    ].filter(Boolean) as string[];

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        setCompressing(true);
        setUploadStatus('Compressing image...');
        setUploadProgress(0);

        try {
            const compressedBlob = await imageCompression(originalFile, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const data = await uploadFileWithIntent({
                type: 'properties',
                file,
                originalFile,
                formData,
                onStatusChange: status => setUploadStatus(status === 'preparing' ? 'Preparing secure upload...' : 'Uploading image...'),
                onProgress: setUploadProgress,
            });

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                await addPropertyImage(property.id, fileUrl, type);
                router.refresh();
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    fileName: originalFile.name,
                    uploadType: 'properties',
                    imageType: type,
                    propertyId: property.id,
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (err) {
            console.error(err);
            logUploadError(err, {
                fileName: originalFile.name,
                uploadType: 'properties',
                imageType: type,
                propertyId: property.id
            });
            alert('Failed to upload image');
        } finally {
            setCompressing(false);
            setUploading(false);
            setUploadStatus('');
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (id: number) => {
        if (!confirm('Are you sure you want to remove this image?')) return;
        try {
            await removePropertyImage(id);
            setImages((prev) => prev.filter((img) => img.id !== id));
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Failed to delete image');
        }
    };

    const handleDrop = (targetImageId: number) => {
        if (!draggingImageId || draggingImageId === targetImageId) return;

        setImages((prev) => {
            const fromIndex = prev.findIndex((img) => img.id === draggingImageId);
            const toIndex = prev.findIndex((img) => img.id === targetImageId);
            if (fromIndex < 0 || toIndex < 0) return prev;

            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
        setDraggingImageId(null);
    };

    const handleSaveOrder = async () => {
        try {
            setSavingOrder(true);
            await reorderPropertyImages(property.id, images.map((img) => img.id));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save image order');
        } finally {
            setSavingOrder(false);
        }
    };

    const handleDeleteProperty = async () => {
        if (!confirm('Delete this property listing permanently?')) return;

        try {
            setDeletingProperty(true);
            await deletePropertyListing(property.id);
            router.push('/manage/properties');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to delete property');
        } finally {
            setDeletingProperty(false);
        }
    };

    return (
        <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                        <div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 850, color: 'var(--color-primary-light)' }}>{stat.value}</div>
                        </div>
                        <div style={{ width: '10px', height: '42px', borderRadius: '999px', background: stat.color }} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 0.85fr)', gap: '20px', alignItems: 'start' }}>
                <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f172a', marginBottom: '4px' }}>Media Gallery</h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Drag images to reorder. Save the order when the sequence is ready.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: 700 }}>{images.length} images</span>
                            {hasOrderChanged && (
                                <button type="button" onClick={handleSaveOrder} disabled={savingOrder} style={{ padding: '9px 13px', borderRadius: '8px', border: '1px solid var(--color-primary)', background: 'white', fontWeight: 800, cursor: savingOrder ? 'not-allowed' : 'pointer', color: 'var(--color-primary)' }}>
                                    {savingOrder ? 'Saving...' : 'Save order'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '18px' }}>
                        {images[0] && (
                            <div style={{ height: '320px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                                <img src={images[0].url} alt={images[0].imageOf || property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: '12px' }}>
                            {images.map((img: any, index: number) => (
                                <div
                                    key={img.id}
                                    draggable
                                    onDragStart={() => setDraggingImageId(img.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(img.id)}
                                    onDragEnd={() => setDraggingImageId(null)}
                                    style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1/1', background: '#f8fafc', border: draggingImageId === img.id ? '2px solid var(--color-primary)' : '1px solid #e2e8f0', cursor: 'grab' }}
                                >
                                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={img.imageOf || `Image ${index + 1}`} />
                                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <span style={{ background: 'rgba(15,23,42,0.75)', color: 'white', borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 800 }}>#{index + 1}</span>
                                        <span style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 800, color: '#334155' }}>Drag</span>
                                    </div>
                                    <button type="button" onClick={() => handleDeleteImage(img.id)} style={{ position: 'absolute', top: '8px', right: '8px', background: '#be123c', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', cursor: 'pointer', fontWeight: 900 }} aria-label="Delete image">
                                        x
                                    </button>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.7)', color: 'white', padding: '5px 8px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {img.imageOf || 'Other'}
                                    </div>
                                </div>
                            ))}

                            <label style={{ cursor: 'pointer', border: '2px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1', background: uploading ? '#f8fafc' : 'white' }}>
                                <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'other')} disabled={uploading} />
                                <span style={{ fontSize: '1.4rem', color: '#64748b' }}>{(uploading || compressing) ? '...' : '+'}</span>
                                <span style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 800, marginTop: '8px' }}>
                                    {compressing ? 'Compressing...' : uploading ? `${uploadProgress ? `${uploadProgress}%` : uploadStatus || 'Uploading...'}` : 'Add image'}
                                </span>
                                {(uploading || compressing) && (
                                    <div style={{ width: '72%', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '8px' }}>
                                        <div style={{ height: '100%', width: `${compressing ? 12 : uploadProgress || 12}%`, background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </section>

                <aside style={{ display: 'grid', gap: '16px' }}>
                    <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 850, marginBottom: '16px', color: '#0f172a' }}>Administrative Control</h2>
                        <div style={{ display: 'grid', gap: '14px' }}>
                            <ControlSelect label="Listing status" value={property.status} onChange={(value) => updatePropertyStatus(property.id, value)} options={[
                                ['pending', 'Pending review'],
                                ['approved', 'Approved / Live'],
                                ['rejected', 'Rejected'],
                                ['warned', 'Warned'],
                            ]} />
                            <ControlSelect label="Market status" value={property.soldStatus} onChange={(value) => updateSoldStatus(property.id, value)} options={[
                                ['unsold', 'Available'],
                                ['soldByUs', 'Sold by Namsari'],
                                ['soldByOther', 'Sold by other'],
                            ]} />
                            {canDelete && (
                                <button type="button" onClick={handleDeleteProperty} disabled={deletingProperty} style={{ marginTop: '4px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff1f2', color: '#be123c', fontWeight: 850, cursor: deletingProperty ? 'not-allowed' : 'pointer' }}>
                                    {deletingProperty ? 'Deleting...' : 'Delete listing'}
                                </button>
                            )}
                        </div>
                    </section>

                    <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 850, marginBottom: '16px', color: '#0f172a' }}>Listed By</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 850, overflow: 'hidden' }}>
                                {property.listedBy?.profile_picture ? (
                                    <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name || 'Lister'} />
                                ) : (
                                    (property.listedBy?.name || 'A')[0]
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.98rem', fontWeight: 850, color: '#0f172a' }}>{property.listedBy?.name || 'Unknown'}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>@{property.listedBy?.username || 'unknown'}</div>
                            </div>
                        </div>
                        <div style={{ padding: '11px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.86rem', color: '#475569', fontWeight: 700 }}>
                            {property.listedBy?.contact_number || 'No contact number'}
                        </div>
                    </section>

                    <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 850, marginBottom: '16px', color: '#0f172a' }}>Quick Details</h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <DetailRow label="Price" value={priceLabel} />
                            <DetailRow label="Type" value={typeLabel} />
                            <DetailRow label="Location" value={locationLabel} />
                            <DetailRow label="Created" value={new Date(property.created_on).toLocaleDateString()} />
                        </div>
                    </section>
                </aside>
            </div>

            <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f172a', marginBottom: '18px' }}>Listing Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
                    <InfoBlock title="Location" lines={[locationLabel, `Ward: ${property.location?.ward || 'N/A'}`, `Landmark: ${property.location?.landmark || 'None'}`]} />
                    <InfoBlock title="Road & Entrance" lines={[`${property.roadType || 'Unspecified'} road`, `Width: ${property.roadSize || 'N/A'}`, `Facing: ${property.facingDirection || 'N/A'}`]} />
                    <InfoBlock title="Specifications" lines={[featureSummary, `Floor: ${property.features?.floorNumber || 'N/A'} of ${property.features?.totalFloors || 'N/A'}`, `Furnishing: ${property.features?.furnishing || 'Unspecified'}`]} />
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '9px' }}>Amenities</div>
                        {amenityLabels.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                {amenityLabels.map((label) => (
                                    <span key={label} style={{ padding: '5px 9px', background: '#f1f5f9', borderRadius: '999px', fontSize: '0.78rem', color: '#334155', fontWeight: 750 }}>{label}</span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 650 }}>No amenities specified.</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function ControlSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
    return (
        <label style={{ display: 'grid', gap: '7px', fontSize: '0.84rem', fontWeight: 800, color: '#475569' }}>
            {label}
            <select defaultValue={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.95rem', fontWeight: 700 }}>
                {options.map(([optionValue, labelText]) => (
                    <option key={optionValue} value={optionValue}>{labelText}</option>
                ))}
            </select>
        </label>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>{value}</span>
        </div>
    );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
    return (
        <div>
            <div style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '9px' }}>{title}</div>
            <div style={{ display: 'grid', gap: '5px' }}>
                {lines.map((line) => (
                    <div key={line} style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 700 }}>{line}</div>
                ))}
            </div>
        </div>
    );
}
