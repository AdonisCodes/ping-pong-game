
export function convertToSevenSegment(num) {
    if (num == 1) {
        return [0, 1, 1, 0, 0, 0, 0]
    }
    if (num == 2) {
        return [1, 1, 0, 1, 1, 0, 1]
    }
    if (num == 3) {
        return [1, 1, 1, 1, 0, 0, 1]
    }
    if (num == 4) {
        return [0, 1, 1, 0, 0, 1, 1]
    }
    if (num == 5) {
        return [1, 0, 1, 1, 0, 1, 1]
    }
    if (num == 6) {
        return [1, 0, 1, 1, 1, 1, 1]
    }
    if (num == 7) {
        return [1, 1, 1, 0, 0, 0, 0]
    }
    if (num == 8) {
        return [1, 1, 1, 1, 1, 1, 1]
    }
    if (num == 9 || num > 9 || num < 0) {
        return [1, 1, 1, 1, 0, 1, 1]
    }
    if (num == 0) {
        return [1, 1, 1, 1, 1, 1, 0]
    }
}
