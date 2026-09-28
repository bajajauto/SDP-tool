import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@sdp/shared';
import { config } from '../config';
import { prisma } from '../lib/db';
import { asyncRoute } from '../lib/errors';
import { corporateEmailWhere, isBajajAutoEmail } from '../lib/corporateEmail';

export interface AuthedRequest extends Request {
  employeeId: string;
  roles: Role[];
}

/**
 * Stand-in for the SSO session resolution in FR-SYS-010. Real SSO
 * (OIDC/SAML against the Bajaj identity provider, OQ-19) belongs here.
 * For local development, the caller identifies as an employee via the
 * `x-employee-id` header; defaults to the first seed employee. On Azure,
 * `appservice` mode trusts the Entra principal injected by App Service
 * Authentication and never reads `x-employee-id`.
 *
 * Real or stub, this is the one place identity is resolved. Every route
 * reads `req.employeeId` and `req.roles` from here, never from client input.
 */
export const attachIdentity = asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
  const include = { roleGrants: true, reportees: { where: { isActive: true, email: corporateEmailWhere }, select: { employeeId: true }, take: 1 }, buhrEmployees: { where: { isActive: true, email: corporateEmailWhere }, select: { employeeId: true }, take: 1 } } as const;
  let employee;
  if (config.AUTH_MODE === 'development') {
    const employeeId = (req.header('x-employee-id') || config.DEV_EMPLOYEE_ID).trim();
    employee = await prisma.employee.findFirst({ where: { employeeId, isActive: true }, include });
  } else if (config.AUTH_MODE === 'appservice') {
    // Set by App Service Authentication after Entra sign-in: the user's UPN, matched to the EC email.
    const principalEmail = req.header('x-ms-client-principal-name')?.trim();
    if (!principalEmail) {
      res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue' } });
      return;
    }
    employee = await prisma.employee.findFirst({ where: { email: { equals: principalEmail, mode: 'insensitive' }, isActive: true }, include });
  } else {
    // OIDC session resolution plugs in here once Bajaj supplies the issuer and claims contract.
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue' } });
    return;
  }

  if (!employee) {
    res.status(403).json({ error: 'NO_ACTIVE_EC_RECORD' });
    return;
  }

  if (!isBajajAutoEmail(employee.email)) {
    res.status(403).json({ error: { code: 'CORPORATE_EMAIL_REQUIRED', message: 'Access is limited to active Bajaj Auto employees using a bajajauto.co.in email address' } });
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
