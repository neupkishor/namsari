export type BoundaryRing = Array<[number, number]>;
export type BoundaryPolygon = BoundaryRing[];
export type LocationPolygons = BoundaryPolygon[];

// Converts GeoJSON polygon coordinates from longitude/latitude to Leaflet latitude/longitude.
function convertGeoJsonPolygonCoordinates(coordinates: unknown): LocationPolygons | null {
    if (!Array.isArray(coordinates)) return null;

    const isPosition = (value: unknown): value is number[] =>
        Array.isArray(value) && value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));
    const isRing = (value: unknown): value is number[][] => Array.isArray(value) && value.length >= 3 && value.every(isPosition);
    const isPolygon = (value: unknown): value is number[][][] => Array.isArray(value) && value.length > 0 && value.every(isRing);

    const polygons = isPolygon(coordinates) ? [coordinates] : coordinates.filter(isPolygon);
    if (polygons.length === 0) return null;

    return polygons.map((polygon) => polygon.map((ring) => ring.map(([longitude, latitude]) => [Number(latitude), Number(longitude)])));
}

// Finds polygon geometry stored directly or under common location detail keys.
export function getLocationPolygons(details: unknown): LocationPolygons | null {
    if (!details || typeof details !== 'object' || Array.isArray(details)) return null;

    const pending: unknown[] = [details];
    const visited = new Set<object>();

    while (pending.length > 0) {
        const candidate = pending.shift();
        if (Array.isArray(candidate)) {
            pending.push(...candidate);
            continue;
        }
        if (!candidate || typeof candidate !== 'object') continue;
        if (visited.has(candidate)) continue;
        visited.add(candidate);

        const geometry = candidate as Record<string, unknown>;
        const type = String(geometry.type || '').toLowerCase();
        if (type === 'polygon' || type === 'multipolygon') {
            const polygons = convertGeoJsonPolygonCoordinates(geometry.coordinates);
            if (polygons) return polygons;
        }

        if (geometry.geometry) pending.push(geometry.geometry);
        if (geometry.polygon) pending.push(geometry.polygon);
        if (geometry.boundary) pending.push(geometry.boundary);
        if (geometry.geojson) pending.push(geometry.geojson);
        if (geometry.polygons) pending.push(geometry.polygons);
        if (geometry.features) pending.push(...(Array.isArray(geometry.features) ? geometry.features : [geometry.features]));
    }

    return null;
}
