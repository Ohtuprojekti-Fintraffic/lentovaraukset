import fi from './fi.json';
import sv from './sv.json';
import en from './en.json';

/**
 * Array of all locale objects used in the application.
*/
type TranslationTypes = [
  typeof fi,
  typeof sv,
  typeof en,
];

/**
 * Constructs a type that contains all keys that are common across the two supplied objects.
 *
 * The values may be of different types but this is not significant as
 * the locale objects only contain strings.
*/
type Common<A, B> = {
  [K in keyof A & keyof B]: A[K] | B[K];
};

/**
 * Constructs a type that contains all keys that are common across all objects in the array.
 *
 * The values may be of different types but this is not significant as
 * the locale objects only contain strings.
 */
type CommonAll<T extends object[]> =
  T extends [infer First, ...infer Rest]
    ? Common<First, CommonAll<Extract<Rest, object[]>>>
    : never;

/** Nested object type extended by the locale objects */
interface NestedObject {
  [key: string]: string | NestedObject;
}

/**
 * Constructs a typed object that maps i18next locale object keys to
 * the concatenated key strings used by the i18next `useTranslation` hook's `t` function.
 *
 * This provides a way to type the `t` function's `key` parameter
 * and provide autocompletion in IDEs.
 *
 * @param obj Nested object with string values like ones accepted by i18next as locale objects
 * @returns Nested object with the same structure as the input object,
 * but with values replaced with their corresponding keys.
 * @example
 * Input
 * ```
 * { a: "1", b: { c: "2" } }
 * ```
 * returns
 * ```js
 * { a: "a", b: { c: "b.c" } }
 * ```
 */
function constructTranslations<T extends NestedObject>(obj: T): T {
  const translationMap = { ...obj };
  Object.entries(translationMap).forEach(([key, value]) => {
    if (typeof value === 'object') {
      constructTranslations(value);
    } else if (typeof value === 'string') {
      translationMap[key as keyof T] = key as T[keyof T];
    }
  });
  return translationMap;
}

/**
 * Translations object that can be used with the `useTranslation` hook
 * in place of the `t` function's `key` parameter. This provides
 * a way to type the `key` parameter and enable autocompletion in IDEs.
 *
 * The object type also ensures that translations can only be used when they
 * are defined in all of the specified languages.
 * @example
 * ```js
 * const { t } = useTranslation();
 * const text = t(translations.page.title);
 * ```
*/
const translations = constructTranslations<CommonAll<TranslationTypes>>(fi);

// Currently unused, may be useful in the future
export type TranslationsType = typeof translations;

// resources type in i18next.d.ts must be removed in order to use this in t()
// Currently unused, may be useful in the future
export default translations;
