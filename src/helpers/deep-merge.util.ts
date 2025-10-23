export function deepMerge<T>(target: T, source: Partial<T>): T {
    if (typeof target !== 'object' || target === null) return source as T;
    if (typeof source !== 'object' || source === null) return target;

    const result = Array.isArray(target) ? [...target] : { ...target };

    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = (target as any)[key];

        if (
        srcVal &&
        typeof srcVal === 'object' &&
        !Array.isArray(srcVal) &&
        typeof tgtVal === 'object' &&
        tgtVal !== null
        ) {
        (result as any)[key] = deepMerge(tgtVal, srcVal);
        } else if (srcVal !== undefined) {
        (result as any)[key] = srcVal;
        }
    }

    return result as T;
}
