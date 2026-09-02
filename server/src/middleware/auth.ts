import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@sdp/shared';
import { config } from '../config';
import { prisma } from '../lib/db';
import { asyncRoute } from '../lib/errors';

export interface AuthedRequest extends Request {
  employeeId: string;
  roles: Role[];
}

/**
 * Stand-in for the SSO session resolution in FR-SYS-010. Real SSO
 * (OIDC/SAML against the Bajaj identity provider, OQ-19) belongs here.
 * For local development, the caller identifies as an employee via the
 * `x-employee-id` header; defaults to the first seed employee.
 *
 * Real or stub, this is the one place identity is resolved. Every route
 * reads `req.employeeId` and `req.roles` from here, never from client input.
 */
export const attachIdentity = asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
  // OIDC session resolution plugs in here once Bajaj supplies the issuer and claims contract.
  const requestedId = config.AUTH_MODE === 'development' ? req.header('x-employee-id') : undefined;
  const employeeId = (requestedId || config.DEV_EMPLOYEE_ID).trim();
  const employee = await prisma.employee.findFirst({
    where: { employeeId, isActive: true },
    include: { roleGrants: true, reportees: { where: { isActive: true }, select: { employeeId: true }, take: 1 }, buhrEmployees: { where: { isActive: true }, select: { employeeId: true }, take: 1 } },
  });

  if (!employee) {
    res.status(403).json({ error: 'NO_ACTIVE_EC_RECORD' });
    return;
  }

  (req as AuthedRequest).employeeId = employee.employeeId;
  const roles = new Set<Role>(['EMPLOYEE']);
  if (employee.reportees.length) roles.add('MANAGER');
  if (employee.buhrEmployees.length) roles.add('BUHR');
  employee.roleGrants.forEach((grant) => roles.add(grant.role as Role));
  (req as AuthedRequest).roles = [...roles];
  next();
});

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authed = req as AuthedRequest;
    if (!authed.roles.includes(role)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    next();
  };
}

export function requireAnyRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.some((role) => (req as AuthedRequest).roles.includes(role))) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have access to this resource' } });
      return;
    }
    next();
  };
}
