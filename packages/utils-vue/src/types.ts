/**
 * ClassValue 类型定义，用于表示可以作为 CSS 类名的各种值类型
 * 可以是字符串、数字、bigint、布尔值、null、undefined，或者是一个包含这些类型的数组，或者是一个对象
 */
export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;

/**
 * ClassDictionary 类型定义，用于表示 CSS 类名的对象形式
 * 对象的键是字符串，值可以是任意类型
 */
export type ClassDictionary = Record<string, unknown>;

/**
 * ClassArray 类型定义，用于表示 CSS 类名的数组形式
 * 数组中的每个元素都可以是 ClassValue 类型
 */
export type ClassArray = ClassValue[];
