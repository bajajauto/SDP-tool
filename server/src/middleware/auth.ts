import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@sdp/shared';
import { resolveRoles, seedEmployees } from '../data/seed';

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
export function attachIdentity(req: Request, res: Response, next: NextFunction) {
  const employeeId = (req.header('x-employee-id') || seedEmployees[0].employeeId).trim();
  const employee = seedEmployees.find((e) => e.employeeId === employeeId && e.isActive);

  if (!employee) {
    res.status(403).json({ error: 'NO_ACTIVE_EC_RECORD' });
    return;
  }

  (req as AuthedRequest).employeeId = employee.employeeId;
  (req as AuthedRequest).roles = resolveRoles(employee.employeeId);
  next();
}

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
