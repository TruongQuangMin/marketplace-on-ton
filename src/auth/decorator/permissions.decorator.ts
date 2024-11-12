import { SetMetadata } from '@nestjs/common';

export const Permissions = (collection: string, actions: string) => {
  return SetMetadata('permissions', { collection, actions });
};
