const SIZE_REGEX = /^(\d+(\.\d+)?)\s*(b|k|m|g)$/i;
export function parseSize(input: number | string): number {
    let size: number;
    if (typeof input === 'number') {
        size = input;
    } else {
        let matches = input.match(SIZE_REGEX);
        if (matches) {
            size = parseInt(matches[1], 0);
            let surfix = matches[3].toUpperCase();

            if (size > 0) {
                if (surfix === 'B') {
                    // nothing
                } else if (surfix === 'K') {
                    size *= 1024;
                } else if (surfix === 'M') {
                    size *= 1024 * 1024;
                } else if (surfix === 'G') {
                    size *= 1024 * 1024 * 1024;
                }
            }
        }
    }

    return size;
}
