import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRole } from 'src/users/enums/user-roles.enum';

export type ApiEndpointRoles = UserRole[] | 'public' | 'authenticated';

function formatRolesDescription(roles: ApiEndpointRoles): string {
  if (roles === 'public') {
    return 'Roles: Public (no authentication required).';
  }

  if (roles === 'authenticated') {
    return 'Roles: admin, doctor, secretary, patient (any authenticated user).';
  }

  return `Roles: ${roles.join(', ')}.`;
}

export function ApiEndpoint(
  summary: string,
  roles: ApiEndpointRoles = 'public',
) {
  return applyDecorators(
    ApiOperation({
      description: formatRolesDescription(roles) + ' ' + summary,
    }),
  );
}
