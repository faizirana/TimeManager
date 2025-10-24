/**
 * Utility function to conditionally join class names.
 *
 * @param classes - An array of class names, which can include strings, undefined, or false.
 * @returns A single string with all truthy class names joined by a space.
 */
export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}