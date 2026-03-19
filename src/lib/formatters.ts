
function parseNumericPrice(price: number | string): number {
    return typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
}

export function formatNPR(price: number | string, symbol: string = 'रु'): string {
    const numericPrice = parseNumericPrice(price);

    if (isNaN(numericPrice)) return 'Price on Request';

    const formattedNumber = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
    }).format(numericPrice);

    return `${symbol} ${formattedNumber}`;
}

export function formatPrice(price: number | string, isMobile: boolean = false): string {
    const numericPrice = parseNumericPrice(price);
    
    if (isNaN(numericPrice)) return 'Price on Request';

    const crore = 10000000;
    const lakh = 100000;
    const thousand = 1000;

    let result = '';

    if (numericPrice >= crore) {
        const crores = Math.floor(numericPrice / crore);
        const remaining = numericPrice % crore;
        const lakhs = Math.floor(remaining / lakh);
        
        if (isMobile) {
            result = `${crores} Cr`;
            if (lakhs > 0) result += ` ${lakhs} L`;
        } else {
            result = `${crores} Crore`;
            if (lakhs > 0) result += ` ${lakhs} Lakhs`;
        }
    } else if (numericPrice >= lakh) {
        const lakhs = Math.floor(numericPrice / lakh);
        const remaining = numericPrice % lakh;
        const thousands = Math.floor(remaining / thousand);
        
        if (isMobile) {
            result = `${lakhs} L`;
             if (thousands > 0) result += ` ${thousands} K`;
        } else {
            result = `${lakhs} Lakhs`;
             if (thousands > 0) result += ` ${thousands} Thousands`;
        }
    } else if (numericPrice >= thousand) {
         const thousands = Math.floor(numericPrice / thousand);
         if (isMobile) {
            result = `${thousands} K`;
         } else {
            result = `${thousands} Thousands`;
         }
    } else {
        return formatNPR(numericPrice, 'Rs.');
    }

    return result;
}
