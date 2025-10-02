import { customAlphabet } from 'nanoid';
import xss from 'xss';

const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 16);

export const createId = () => nanoid();

export const sanitize = (value: string) =>
  xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });

export const jsonArray = (value: string[] | undefined) => JSON.stringify(value ?? []);

export const parseArray = (value: string | null) => {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const toISO = (date: Date = new Date()) => date.toISOString();
