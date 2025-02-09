
function computedIsFunction<T, U>(computed: Computed<T, U>): computed is (state: GameState, object: U) => T {
    return (typeof computed === 'function');
}

export function computeValue<T, U>(state: GameState, object: U, computed: Computed<T, U>|undefined, defaultValue: T): T {
    if (computedIsFunction(computed)) {
        return computed(state, object);
    }
    return computed ?? defaultValue;
}
