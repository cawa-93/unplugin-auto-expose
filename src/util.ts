import { CommonOptions } from './types';

export const generateExposedName = (
  originName: string,
  options: CommonOptions | undefined,
) => {
  return options && options.exposeName
    ? options.exposeName(originName)
    : `__electron_preload__${originName}`;
};
