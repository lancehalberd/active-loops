
export function requireElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
        throw Error('No element with id: ' + id);
    }
    return element;
}
export function requireSelectById(id: string): HTMLSelectElement {
    const element = requireElementById(id);
    if (!(element instanceof HTMLSelectElement)) {
        throw Error('Element is not instance of HTMLSelectElement: ' + id);
    }
    return element;
}
/*
export function requireTypedElementById<T>(id: string, class: Class extends T): T {
    const element = requireElementById(id);
    if (!(element instanceof class)) {
        throw Error('Element is not instance of expected class: ' + id);
    }
    return element;
}
*/
